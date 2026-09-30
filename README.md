# Fieldbook

A CRM built with Next.js 16, Prisma 7 and SQLite.

## Setup

```bash
cp .env.example .env
bun install          # also runs `prisma generate`
bun run db:migrate   # creates dev.db
bun run db:seed      # adds 10 sample contacts and 8 deals
bun dev
```

Open http://localhost:3000. It redirects to `/contacts`. The pipeline is at `/deals`.

After a schema change, restart `bun dev`. The Prisma client is cached across hot reloads, so a running server keeps the old models until it restarts.

The seed runs under Node (via `tsx`) because Bun's runtime can't load the `better-sqlite3` native addon. The Next.js app itself runs on Node.
