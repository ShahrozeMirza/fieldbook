import "dotenv/config";
import { defineConfig } from "prisma/config";
import { databaseUrl, isRemoteDatabase } from "./src/lib/database-url";

const url = databaseUrl({ requireInProduction: false });

// Prisma Migrate only works with the local SQLite file. Turso gets the same
// migrations through `bun run db:deploy` (prisma/deploy.ts).
if (process.argv.includes("migrate") && isRemoteDatabase(url)) {
  throw new Error(
    "Prisma Migrate can't connect to Turso. Unset DATABASE_URL to work on ./dev.db, or run `bun run db:deploy` to apply migrations to Turso.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url },
});
