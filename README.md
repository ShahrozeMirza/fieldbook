# Fieldbook

A CRM built with Next.js 16, Prisma 7 and SQLite.

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

The seed runs under Node (via `tsx`) because Bun's runtime can't load the `better-sqlite3` native addon. The Next.js app itself runs on Node.

## Production (Railway, SQLite on a volume)

- Node 22 (>= 22.12). Bun installs and builds; the app itself runs on Node.
- Attach a volume mounted at `/data` and set `DATABASE_URL=file:/data/fieldbook.db`.
- Run migrations in the start command, not as a pre-deploy step: Railway only mounts volumes on the running service.
  Start command: `bun run db:deploy && bun run start`
- Seed once from a shell on the running service (`railway ssh`): `bun run db:seed`, with `ADMIN_PASSWORD` set to a strong password.
  Re-running the seed resets the admin password and the sample records.
- One replica only. SQLite and Railway volumes don't support more.
