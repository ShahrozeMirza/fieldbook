# Fieldbook

A CRM built with Next.js 16, Prisma 7 and SQLite (a local file in development, [Turso](https://turso.tech) in production).

## Setup

```bash
cp .env.example .env
bun install          # also runs `prisma generate`
bun run db:migrate   # creates dev.db
bun run db:seed      # adds 10 sample contacts, 8 deals, and 10 past won deals
bun dev
```

Open http://localhost:3000 and sign in as **admin** / **admin123** (created by the seed). Every page requires sign-in. There's no signup or password reset.

After signing in you land on the dashboard. Contacts are at `/contacts` and the pipeline at `/deals`.

The revenue chart counts won deals by the month they closed, in the server's local time. The past won deals in the seed are dated relative to the day you run it, so the chart always has a year of history.

After a schema change, restart `bun dev`. The Prisma client is cached across hot reloads, so a running server keeps the old models until it restarts.

Bun installs packages, but the app, the seed and the migration script run on Node (the scripts via `tsx`).

## Production (Netlify + Turso)

Prisma talks to SQLite through the libSQL adapter, which reads a local file (`file:./dev.db`) or a Turso database (`libsql://…`). The schema and migrations are the same for both.

**Database (once, from your machine, with the [Turso CLI](https://docs.turso.tech/cli/introduction)):**

```bash
turso db create fieldbook            # pick a location close to Netlify's functions (US East by default)
turso db show fieldbook --url        # → DATABASE_URL
turso db tokens create fieldbook     # → TURSO_AUTH_TOKEN
DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… bun run db:deploy   # apply migrations
DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… bun run db:seed     # create admin and sample data
```

**Netlify:** import the repo. `netlify.toml` sets the build command and Node 22. Under Site configuration → Environment variables, add `DATABASE_URL` and `TURSO_AUTH_TOKEN`.

**Schema changes:** create the migration locally with `bun run db:migrate` (against `dev.db`), commit it, then run `bun run db:deploy` with the Turso variables. Prisma Migrate can't connect to Turso, so `db:deploy` applies the SQL files itself and records them in `_fieldbook_migrations`. Deploying the app doesn't run migrations, so apply them before deploying code that needs them.

**Notes:**

- The login page shows the demo credentials. Seed production without `ADMIN_PASSWORD` so they stay correct. Re-running the seed resets the admin password and the sample records.
- Turso archives free databases after 10 days without activity. Unarchive with `turso group unarchive <group>`.
- Netlify's free plan pauses the site when the monthly credits run out. Each production deploy costs credits, so deploy sparingly.
- Functions run in UTC, so the revenue chart groups by UTC month.
