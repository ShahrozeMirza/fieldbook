import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { databaseUrl } from "@/lib/database-url";

function createClient() {
  // `next build` loads this module to collect page data but never queries,
  // so it must not demand the production database.
  const building = process.env.NEXT_PHASE === "phase-production-build";
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl({ requireInProduction: !building }) });
  return new PrismaClient({ adapter });
}

// Reuse one client across hot reloads in development.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
