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
  - `/feedback` — multi-variant feedback form (the main feature, public)
  - `/feedback/view` — tabbed tables showing feedback received by the logged-in LA (auth required)
  - `/login` — email-based magic link login via BetterAuth
  - `/settings` — user settings: avatar upload, course info display (auth required)
  - `/api/auth/[...all]` — BetterAuth catch-all API route
  - `/api/feedback` — POST (public): submit feedback, and for student mid-/end-of-quarter submissions email the submitter a confirmation; GET (auth): retrieve feedback for current user
  - `/api/la` — GET (public): list all LAs with name, course, position, image
  - `/api/la/self` — GET (auth): get current user's course positions
  - `/api/settings/avatar` — POST (auth): upload and transform avatar image
- `components/ui/` — shadcn components. Add new ones with `npx shadcn add <component>`. Never copy-paste component source manually.

#### Authentication

- **BetterAuth** with magic link plugin, admin plugin, and impersonation. Server config in `lib/auth.ts`, client in `lib/auth-client.ts`.
- Uses a single Cloudflare D1 database (`data` binding) for all storage — auth tables (`user`, `session`, `account`, `verification`) and app tables (`course`, `feedback`) share one DB.
- The `user` table includes BetterAuth admin fields (`role`, `banned`, `banReason`, `banExpires`) and an `impersonatedBy` field on `session`.
- The `auth.ts` module calls `getCloudflareContext()` to access the D1 binding at runtime — this is async, so a singleton pattern wraps the auth instance.
- Magic links are sent via AWS SES (`lib/email/`). Before sending, the `user` table is checked — if no account exists for the email, nothing is sent (the attempt is logged instead), so the login form can't be used to probe for accounts.
- Pages requiring auth (`/settings`, `/feedback/view`) wrap their client component in a server component that checks the session via `getAuth()` and redirects to `/login`. The client component does not handle auth checks.

#### Email (`lib/email/`)

All outbound mail goes through **AWS SES**, called as a signed REST request rather than through the AWS SDK — `@aws-sdk/client-sesv2` is far too large for a Worker bundle. `aws4fetch` does SigV4 signing with WebCrypto in a few KB.

- `ses.ts` — the transport. `sendEmail()` POSTs to the SES v2 `outbound-emails` endpoint with both an HTML and a text part, so SES builds a `multipart/alternative` message. It returns a boolean instead of throwing: email is never load-bearing for a request. In `NODE_ENV=development` it logs the message to the console instead of sending, so local dev needs no AWS credentials.
- `render.tsx` — an email is authored **once** as a list of blocks (`heading`, `text`, `button`, `note`, `facts`, `bullets`, …) and `renderEmail()` renders it twice: to HTML and to plain text. Single-sourcing means the text fallback can't drift from the HTML. Mark a block `htmlOnly: true` for HTML-only affordances (e.g. a copy-paste link fallback) so it's dropped from the text version.
- HTML is built from `@react-email/components`, which carries the email-client workarounds worth having (Outlook conditional wrapper tables, the MSO padding hack on buttons, the preheader whitespace trick). Rendering uses `renderToStaticMarkup` from `react-dom/server` — **do not** import `@react-email/render`: it pulls in `html-to-text` and `js-beautify` (~130 KB gzipped) for features this app doesn't use. Components alone cost under 5 KB gzipped.
- `templates.ts` — one function per email returning blocks. Add new emails here, not in route handlers.
- Callers should send inside `ctx.waitUntil()` so a slow SES call doesn't delay the user's response.

#### Feedback form (`app/feedback/`)

The feedback form is the most complex part of the frontend. It conditionally renders different sections based on role (`student`, `la`, `ta`) and feedback type.

- The course selector is hidden until a role is selected. When the user selects "an LA", they must be signed in to proceed — unauthenticated LAs see a sign-in prompt. Students and TAs can use the form without authentication.
- **Schema** (`schema.ts`): validation uses nested `z.discriminatedUnion` — first on `role`, then on `feedback_type` (and `la_head_type` for LA→Head LA). Shared field groups (`headerFields`, `closingFields`, `mqFields`, `eqFields`, `laPedFields`, `laLccFields`, `obsFields`, `taFields`, etc.) are defined once and spread into both variant schemas and `baseSchema`. `baseSchema` exists only for type inference (`FeedbackFormValues`) and generating `defaultValues` — it is built from the field groups, not maintained manually. When adding a new field, add it to the relevant field group; it will flow into `baseSchema`, `defaultValues`, and the variant schema automatically.
- **Constants** (`constants.ts`): all dropdown/radio options and question lists. Courses and LAs are fetched from the API (`/api/la`), not hardcoded.
- The exported `feedbackFormSchema` is cast to `z.ZodType<FeedbackFormValues, FeedbackFormValues>` because the discriminated union's inferred type is narrower than the flat `FeedbackFormValues` that TanStack Form expects. This cast is safe — runtime validation is correct.

#### Feedback view (`app/feedback/view/`)

Tabbed interface for LAs to view feedback they've received. Columns are defined in `columns.ts` with anonymized schemas that strip sensitive fields. Tables are built dynamically based on the user's course positions (e.g., Ped Heads see Head LA pedagogy columns, LCCs see logistical columns).

### Cloudflare Resources

All infrastructure is on Cloudflare. The `wrangler.jsonc` file defines every binding.

| Resource | Binding name | Purpose |
|----------|-------------|---------|
| D1 Database | `data` | All app data — auth (user/session/account/verification) and app tables (course, feedback) |
| R2 Bucket | `storage` | Avatar image storage |
| Assets | `ASSETS` | Static files from `.open-next/assets` |
| Service | `WORKER_SELF_REFERENCE` | Self-referencing worker binding (used by OpenNext) |
| Images | `IMAGES` | Cloudflare Images transformation (avatar resizing to 300x300 webp) |

#### Accessing Cloudflare resources in code

Inside Next.js server code (route handlers, server components, server actions), access bindings via the OpenNext helper:

```ts
import { getCloudflareContext } from "@opennextjs/cloudflare";

const { env } = await getCloudflareContext({ async: true });
// env.data      — D1 database (auth + app tables)
// env.storage   — R2 bucket (avatar storage)
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
- `NEXT_PUBLIC_BUCKET_URL` — public URL of the R2 bucket for avatar images.
- `NEXTJS_ENV` — set in `.dev.vars` for local dev (`development`).
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — IAM credentials for SES email sending. The IAM user only needs `ses:SendEmail`.
- `AWS_REGION` — SES region (defaults to `us-east-1`). Must be the region where the sending domain is verified.
- `SES_FROM_ADDRESS` — verified sender address (defaults to `admin@laprogramucla.com`).
- `SES_CONFIGURATION_SET` — optional SES configuration set for bounce/complaint tracking.
- Copy `.env.example` to `.env` and fill in values for local development.

### Database Schema

All tables live in a single D1 database (`data`). The init migration (`migrations/0001_init.sql`) creates:

- **Auth tables** (managed by BetterAuth — do not edit): `user`, `session`, `account`, `verification`
- **`course`** — course assignments. Composite primary key `(userId, course_name, position)`. Indexed on `course_name` for listing all LAs in a course.
- **`feedback`** — feedback submissions linking a giver to a recipient (references `user.id`). Stores form data as a JSON string in the `feedback` column. Indexed on `recipientId`.

A default admin user (`pdt.laprogram@gmail.com`, role `admin`) is seeded in the init migration. Test data can be loaded from `scripts/testing.sql`.

### Migrations

D1 migrations live in `migrations/`. To create a new migration:

```bash
npx wrangler d1 migrations create data "description of change"
```

Then edit the generated SQL file and apply with `npx wrangler d1 migrations apply data --local` (local) or `--remote` (production).

### Page Pattern

Pages that need metadata export and/or auth checks use a **server component wrapper** (`page.tsx`) that exports metadata and checks the session, then renders a client component for the interactive UI. Examples: `/login` (`page.tsx` → `Login.tsx`), `/settings` (`page.tsx` → `Settings.tsx`), `/feedback/view` (`page.tsx` → `FeedbackView.tsx`). The `/feedback` page is a server component itself since the form component handles its own client-side rendering.
