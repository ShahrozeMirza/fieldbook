// Shared by the app, the seed script and prisma.config.ts, so it must not import Next.js.

/**
 * The SQLite connection string, e.g. "file:/data/fieldbook.db".
 *
 * Development falls back to ./dev.db. Production requires DATABASE_URL, so a
 * missing value fails loudly instead of quietly creating a database inside the
 * app directory, which is replaced on every deploy.
 */
export function databaseUrl({ requireInProduction = true } = {}) {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;
  if (requireInProduction && process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not set. In production it must point to the SQLite file on the persistent volume, e.g. file:/data/fieldbook.db",
    );
  }
  return "file:./dev.db";
}
