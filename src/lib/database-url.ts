// Shared by the app, the seed script, the Turso migration script and prisma.config.ts,
// so it must not import Next.js.

/**
 * The database connection string: a local SQLite file in development
 * ("file:./dev.db"), a Turso database in production ("libsql://<db>.turso.io").
 *
 * Development falls back to ./dev.db. Production requires DATABASE_URL, so a
 * missing value fails loudly instead of quietly using a file that won't persist.
 */
export function databaseUrl({ requireInProduction = true } = {}) {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;
  if (requireInProduction && process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not set. In production it must point to the Turso database, e.g. libsql://fieldbook-<org>.turso.io",
    );
  }
  return "file:./dev.db";
}

/** True for a hosted database (Turso) rather than a local SQLite file. */
export const isRemoteDatabase = (url: string) => !url.startsWith("file:");

/** Connection config for the libSQL client. Turso needs TURSO_AUTH_TOKEN; local files don't. */
export function databaseConfig({ requireInProduction = true } = {}) {
  const url = databaseUrl({ requireInProduction });
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;
  if (isRemoteDatabase(url) && !authToken && requireInProduction) {
    throw new Error("TURSO_AUTH_TOKEN is not set. Create one with `turso db tokens create <db>`.");
  }
  return { url, authToken };
}
