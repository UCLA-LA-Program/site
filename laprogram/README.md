# LA Program App

Full-stack [Next.js](https://nextjs.org/docs) app deployed to [Cloudflare Workers](https://developers.cloudflare.com/workers/) via the [OpenNext adapter](https://opennext.js.org/cloudflare).

## Getting Started

Install dependencies:

```bash
npm i
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

To preview on the local Cloudflare Workers runtime (uses Wrangler + Miniflare under the hood, includes D1 and other bindings):

```bash
npm run preview
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

- `BETTER_AUTH_SECRET` — secret for signing auth tokens
- `BETTER_AUTH_URL` — base URL of the app. **Must match the port you're running on:** `http://localhost:3000` for `npm run dev`, `http://localhost:8787` for `npm run preview`. Update this value when switching between the two.
- `NEXT_PUBLIC_BUCKET_URL` — public URL of the R2 bucket (used for avatar images)

For the Cloudflare preview/deploy runtime, local env vars go in `.dev.vars`.

## Deploying

```bash
npm run deploy
```

This builds with OpenNext and deploys to Cloudflare Workers. Production secrets are set with:

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put NEXT_PUBLIC_BETTER_AUTH_URL
npx wrangler secret put NEXT_PUBLIC_BUCKET_URL
```

## Cloudflare Bindings

All Cloudflare resources are declared in `wrangler.jsonc`. Access them in server-side code:

```ts
import { getCloudflareContext } from "@opennextjs/cloudflare";

const { env } = await getCloudflareContext({ async: true });
env.data      // D1 database (auth + app tables)
env.IMAGES    // Cloudflare Images
env.storage   // R2 bucket (avatar storage)
```

After editing `wrangler.jsonc`, regenerate TypeScript types:

```bash
npm run cf-typegen
```

## Database (D1)

A single D1 database (`data`) holds all tables:

- **Auth tables** (managed by BetterAuth): `user`, `session`, `account`, `verification`
- **`course`** — maps users to courses with a position (composite key: `userId`, `course_name`, `position`)
- **`feedback`** — feedback submissions from one user to another (stored as JSON)

Migrations live in `migrations/`. Common commands:

```bash
# Create a new migration
npx wrangler d1 migrations create data "description"

# Apply migrations locally
npx wrangler d1 migrations apply data --local

# Apply migrations to production
npx wrangler d1 migrations apply data --remote

# Query production D1
npx wrangler d1 execute data --remote --command "SELECT * FROM user"

# Seed local DB with test data
npx wrangler d1 execute data --local --file scripts/testing.sql
```

## Authentication

Magic link login via BetterAuth. Server config in `lib/auth.ts`, client in `lib/auth-client.ts`.

- Magic links are sent via AWS SES (`lib/email.ts`). Before sending, the email is checked against the `user` table — if no account exists, a "no account found" email is sent instead.
- Pages requiring auth (`/settings`, `/feedback/view`) use a server component wrapper that checks the session and redirects to `/login` if unauthenticated.
- The feedback form is public for students and TAs, but LA-specific feedback types (Head LA, Observation) require login.

## Styling

Use shadcn to add components:

```bash
npx shadcn add <component>
```

Never copy-paste shadcn component source manually — always use the CLI.
