// Applies pending migrations from prisma/migrations to the database in DATABASE_URL.
//
// Prisma Migrate can't connect to Turso, so production uses this instead of
// `prisma migrate deploy`. The SQL is the same files `prisma migrate dev`
// generates locally. Applied migrations are recorded in _fieldbook_migrations
// (separate from Prisma's own _prisma_migrations table in dev.db).
import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { databaseConfig } from "../src/lib/database-url";

const MIGRATIONS_DIR = path.join(import.meta.dirname, "migrations");

async function main() {
  const client = createClient(databaseConfig());
  try {
    await migrate(client);
  } finally {
    client.close();
  }
}

async function migrate(client: Client) {
  await client.execute(
    `CREATE TABLE IF NOT EXISTS "_fieldbook_migrations" (
      "name" TEXT NOT NULL PRIMARY KEY,
      "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  );
  const applied = new Set(
    (await client.execute(`SELECT "name" FROM "_fieldbook_migrations"`)).rows.map((row) => String(row.name)),
  );

  const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true });
  const pending = entries
    .filter((entry) => entry.isDirectory() && !applied.has(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (pending.length === 0) {
    console.log("No pending migrations.");
    return;
  }

  for (const name of pending) {
    const sql = await readFile(path.join(MIGRATIONS_DIR, name, "migration.sql"), "utf8");
    // Prisma ends every statement with ";" at the end of a line.
    const statements = sql
      .split(/;\s*$/m)
      .map((statement) => statement.trim())
      .filter((statement) => statement.replace(/^--.*$/gm, "").trim() !== "");

    // One transaction per migration, with foreign key checks deferred so table
    // rebuilds work, and the record written in the same transaction.
    await client.migrate([
      ...statements,
      { sql: `INSERT INTO "_fieldbook_migrations" ("name") VALUES (?)`, args: [name] },
    ]);
    console.log(`Applied ${name}`);
  }
  console.log(`${pending.length} migration(s) applied.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
