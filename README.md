# The Original I Ching App

Monorepo for a web oracle product: **I Ching** and **oracle bones**–style consultations with AI-assisted interpretation and images. Stack: **Next.js** (App Router), **TypeScript**, **Supabase**, **Turborepo**.

## Quick start

**Prerequisites:** Node.js **20+** and **npm 10+** (see root `package.json` → `packageManager`).

```bash
git clone <your-fork-or-remote-url> iching-oracle
cd iching-oracle
npm install
cp .env.example .env
```

Edit `.env` with at least Supabase and any AI/image keys you need (see comments in [`.env.example`](./.env.example)).

```bash
npm run dev
```

This runs **Turborepo** `dev` for every workspace that defines a `dev` script (including the Next.js app in `apps/web`). Check the terminal for the local URL (often `http://localhost:3000` for the web app).

## What lives where

| Path | Role |
|------|------|
| `apps/web` | Next.js UI, `app/api/*` routes (consult, account, auth helpers), Vercel deployment target |
| `packages/*` | Shared libraries: `iching-engine`, `context-engine`, `oracle-bones-engine`, `i18n`, `ui`, etc. |
| `backend/db/migrations` | Ordered **SQL** migrations for Postgres (Supabase) |
| `backend/auth` | Auth-related package consumed by the web app |
| `.env.example` | **Reference** for environment variables (never commit real secrets) |

## Root scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development servers via Turbo |
| `npm run build` | Production build (all packages that define `build`) |
| `npm run typecheck` | `tsc --noEmit` across the monorepo |
| `npm run test` | Tests via Turbo |
| `npm run lint` | Lint via Turbo |

Package-specific scripts (e.g. `apps/web`: `next dev`, `next build`) are defined in each workspace `package.json`.

## User-facing documentation (product)

Static/guide pages live in `apps/web/src/app/`:

- [`/guia`](./apps/web/src/app/guia/page.tsx) — Quick usage guide (ES/EN via cookie)
- [`/quickstart`](./apps/web/src/app/quickstart/page.tsx) — Short tutorial-style steps
- [`/notes`](./apps/web/src/app/notes/page.tsx) — Method notes / context (explanation)
- [`/privacy`](./apps/web/src/app/privacy/page.tsx) — Privacy policy
- [`/terms`](./apps/web/src/app/terms/page.tsx) — Terms of service

Editorial and legal standards for these files are described in [`.cursor/rules/iching-documentation-standards.mdc`](./.cursor/rules/iching-documentation-standards.mdc).

## Database

Run migration files in `backend/db/migrations/` **in numeric order** on your Supabase (or Postgres) project. See individual files for DDL/RPC changes.

## Contributing / standards

- TypeScript **strict**; prefer matching existing patterns in touched packages.
- After user-visible behavior changes, update the relevant routes under `apps/web/src/app/` (guía, privacidad, términos, quickstart) when copy or flows change.

## License

Private repository — rights reserved unless otherwise stated in the repository settings.
