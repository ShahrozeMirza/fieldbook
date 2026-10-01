import "dotenv/config";
import { defineConfig } from "prisma/config";
import { databaseUrl } from "./src/lib/database-url";

// `prisma migrate deploy` only ever targets a real deployment, so never let it
// fall back to ./dev.db. Other commands (generate at build time, migrate dev,
// db seed locally) keep the development fallback.
const deploying = process.argv.includes("migrate") && process.argv.includes("deploy");
if (deploying && !process.env.DATABASE_URL?.trim()) {
  throw new Error(
    "DATABASE_URL is not set. `prisma migrate deploy` needs it to point at the SQLite file on the persistent volume, e.g. file:/data/fieldbook.db",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl({ requireInProduction: false }),
  },
});
