# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Full-stack app for the UCLA Learning Assistant Program (<https://www.laprogramucla.com>). Used by LAs and PDT to manage the feedback and observation cycle each quarter. The app lives in the `laprogram/` directory — a single Next.js project deployed to **Cloudflare Workers** via the OpenNext adapter.

## Commands

```bash
cd laprogram
npm i                # install deps
npm run dev          # dev server at localhost:3000
npm run build        # production build (catches type errors)
npm run lint         # ESLint
npm run preview      # build + preview on local Cloudflare Workers runtime
npm run deploy       # build + deploy to Cloudflare Workers
npm run cf-typegen   # regenerate Cloudflare env type definitions
```

### Database (D1)

```bash
# Apply migrations to remote D1
npx wrangler d1 migrations apply data --remote

# Apply migrations locally (for preview)
npx wrangler d1 migrations apply data --local

# Open a SQL console against remote D1
npx wrangler d1 execute data --remote --command "SELECT * FROM user"

# Seed local DB with test data
npx wrangler d1 execute data --local --file scripts/testing.sql
```

## Architecture

### App (`laprogram/`)

- **Next.js 16** (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Form, Zod 4
- Deployed to **Cloudflare Workers** using `@opennextjs/cloudflare`. Config in `wrangler.jsonc` and `open-next.config.ts`.
- `app/` — file-based routing. Current routes:
  - `/` — landing page (hero with CTA links to `/feedback` and `/login`)
  - `/feedback` — multi-variant feedback form (the main feature)
  - `/login` — email-based magic link login via BetterAuth
  - `/api/auth/[...all]` — BetterAuth catch-all API route
- `components/ui/` — shadcn components. Add new ones with `npx shadcn add <component>`. Never copy-paste component source manually.

#### Authentication

- **BetterAuth** with magic link plugin, admin plugin, and impersonation. Server config in `lib/auth.ts`, client in `lib/auth-client.ts`.
- Uses a single Cloudflare D1 database (`data` binding) for all storage — auth tables (`user`, `session`, `account`, `verification`) and app tables (`course`, `feedback`) share one DB.
- The `user` table includes BetterAuth admin fields (`role`, `banned`, `banReason`, `banExpires`) and an `impersonatedBy` field on `session`.
- The `auth.ts` module calls `getCloudflareContext()` to access the D1 binding at runtime — this is async, so a singleton pattern wraps the auth instance.
- Magic link sending is currently a stub (logs URL to console). Will need a real email transport (e.g. Cloudflare Email Workers or Resend).

#### Feedback form (`app/feedback/`)

The feedback form is the most complex part of the frontend. It conditionally renders different sections based on role (`student`, `la`, `ta`) and feedback type.

- **Schema** (`schema.ts`): validation uses nested `z.discriminatedUnion` — first on `role`, then on `feedback_type` (and `la_head_type` for LA→Head LA). Shared field groups (`headerFields`, `closingFields`, `mqFields`, `eqFields`, `laPedFields`, `laLccFields`, `obsFields`, `taFields`, etc.) are defined once and spread into both variant schemas and `baseSchema`. `baseSchema` exists only for type inference (`FeedbackFormValues`) and generating `defaultValues` — it is built from the field groups, not maintained manually. When adding a new field, add it to the relevant field group; it will flow into `baseSchema`, `defaultValues`, and the variant schema automatically.
- **Constants** (`constants.ts`): all dropdown/radio options and question lists. Courses and LAs are currently hardcoded (will eventually be fetched from the `course` and `user` tables in D1).
- The exported `feedbackFormSchema` is cast to `z.ZodType<FeedbackFormValues, FeedbackFormValues>` because the discriminated union's inferred type is narrower than the flat `FeedbackFormValues` that TanStack Form expects. This cast is safe — runtime validation is correct.

### Cloudflare Resources

All infrastructure is on Cloudflare. The `wrangler.jsonc` file defines every binding.

| Resource | Binding name | Purpose |
|----------|-------------|---------|
| D1 Database | `data` | All app data — auth (user/session/account/verification) and app tables (course, feedback) |
| Assets | `ASSETS` | Static files from `.open-next/assets` |
| Service | `WORKER_SELF_REFERENCE` | Self-referencing worker binding (used by OpenNext) |
| Images | `IMAGES` | Cloudflare Images integration |

#### Accessing Cloudflare resources in code

Inside Next.js server code (route handlers, server components, server actions), access bindings via the OpenNext helper:

```ts
import { getCloudflareContext } from "@opennextjs/cloudflare";

const { env } = await getCloudflareContext({ async: true });
// env.data      — D1 database (auth + app tables)
// env.ASSETS    — static asset fetcher
// env.IMAGES    — Cloudflare Images
```

The `CloudflareEnv` interface in `cloudflare-env.d.ts` provides TypeScript types for all bindings. Regenerate it after changing `wrangler.jsonc`:

```bash
npm run cf-typegen
```

#### Deploying Cloudflare resources via the API

Use the [Cloudflare REST API](https://developers.cloudflare.com/api/) or [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) to manage resources. Wrangler is the preferred approach for this project.

**Common Wrangler operations:**

```bash
# Deploy the worker
npm run deploy

# Create a new D1 database
# After creating, add the binding to wrangler.jsonc and set
# "migrations_dir" to "migrations/<db-name>" (a subdirectory under migrations/)
npx wrangler d1 create <db-name>

# Create and apply a D1 migration
npx wrangler d1 migrations create <db-name> "<description>"
npx wrangler d1 migrations apply <db-name> --remote

# Add a KV namespace
npx wrangler kv namespace create <namespace-name>

# Add an R2 bucket
npx wrangler r2 bucket create <bucket-name>

# Manage secrets (e.g. BETTER_AUTH_SECRET)
npx wrangler secret put <SECRET_NAME>

# Tail live logs
npx wrangler tail
```

After creating a new resource with Wrangler, add its binding to `wrangler.jsonc` and run `npm run cf-typegen` to update types.

Wrangler supports all resources used in this project (Workers, D1, KV, R2, secrets). For resources or automation not covered by Wrangler, use the [Cloudflare REST API](https://developers.cloudflare.com/api/) with an API token. The account ID can be found in the Cloudflare dashboard under Workers & Pages.

### Environment Variables

- `BETTER_AUTH_SECRET` — secret for BetterAuth token signing. Set via `wrangler secret put BETTER_AUTH_SECRET` for production, or in `.env` locally.
- `BETTER_AUTH_URL` — base URL of the app. **Must match the port you're running on:** `http://localhost:3000` for `npm run dev`, `http://localhost:8787` for `npm run preview`. Update this when switching between the two. Use the production domain for prod.
- `NEXTJS_ENV` — set in `.dev.vars` for local dev (`development`).
- Copy `.env.example` to `.env` and fill in values for local development.

### Database Schema

All tables live in a single D1 database (`data`). The init migration (`migrations/0001_init.sql`) creates:

- **Auth tables** (managed by BetterAuth — do not edit): `user`, `session`, `account`, `verification`
- **`course`** — course assignments. Composite primary key `(userId, course_name, position)`. Indexed on `course_name` for listing all LAs in a course.
- **`feedback`** — feedback submissions linking a giver to a recipient (references `user.id`). Indexed on `recipientId`.

A default admin user (`pdt.laprogram@gmail.com`, role `admin`) is seeded in the init migration. Test data can be loaded from `scripts/testing.sql`.

### Migrations

D1 migrations live in `migrations/`. To create a new migration:

```bash
npx wrangler d1 migrations create data "description of change"
```

Then edit the generated SQL file and apply with `npx wrangler d1 migrations apply data --local` (local) or `--remote` (production).
