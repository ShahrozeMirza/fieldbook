import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import { databaseConfig } from "@/lib/database-url";

function createClient() {
  // `next build` loads this module to collect page data but never queries,
  // so it must not demand the production database.
  const building = process.env.NEXT_PHASE === "phase-production-build";
  const adapter = new PrismaLibSql(databaseConfig({ requireInProduction: !building }));
  return new PrismaClient({ adapter });
}

// Reuse one client across hot reloads in development.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
