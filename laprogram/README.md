# LA Program App

Full-stack [Next.js](https://nextjs.org/docs) app deployed to [Cloudflare Workers](https://developers.cloudflare.com/workers/) via the [OpenNext adapter](https://opennext.js.org/cloudflare).

## Getting Started

Install dependencies:

```bash
npm i
```

You may need a copy of the environment variables. Refer to the next section; ask a previous PDT member for a copy of some working ones. 

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

To preview on the local Cloudflare Workers runtime (uses Wrangler + Miniflare under the hood, includes D1 and other bindings):

```bash
npm run preview
```

This will open a copy of the app on [http://localhost:8787](http://localhost:8787). Typically, the standard `npm run dev` should work, but you may need to use `preview` if you want to test things like emails. Be careful, as this enhanced functionality may have unintended side effects like sending actual emails to people.

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

- `BETTER_AUTH_SECRET` — secret for signing auth tokens
- `TURNSTILE_SECRET_KEY` — secret for Cloudflare Turnstile (DDOS protection)
- `POSTMARK_SERVER_TOKEN` — token for Postmark, our email service
- `AIRTABLE_API_KEY` — API key for Airtable access as our SOT
- `AIRTABLE_BASE_ID` — This quarter's Airtable base ID; can be retrieved through the URL
- `BETTER_AUTH_URL` — base URL of the app. **Must match the port you're running on:** `http://localhost:3000` for `npm run dev`, `http://localhost:8787` for `npm run preview`. Those two commands should auto-set this environment variable for you but if you are running into weird issues related to the URL while testing locally this is why.
- `NEXT_PUBLIC_BUCKET_URL` — public URL of the R2 bucket (used for avatar images)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile site key

## Deploying

To manually deploy, run

```bash
npm run deploy
```

This builds with OpenNext and deploys to Cloudflare Workers. You typically will not need to manually deploy. Merging a PR to main triggers a deployment automatically.

Set production secrets in the Cloudflare UI. Using the CLI is rather flaky.

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

### Testing with production data
To get a copy of production data onto your local checkout, run:

```sh
.scripts/fetchremote.sh
```

This wipes your local wrangler D1 database data, downloads the remote `data` database, and replays it into your local copy. 

## Authentication

Magic link login via BetterAuth. Server config in `lib/auth.ts`, client in `lib/auth-client.ts`.

- Magic links are sent via Postmark (`lib/email.ts`). Before sending, the email is checked against the `user` table — if no account exists, a "no account found" email is sent instead.
- Pages requiring auth (`/settings`, `/feedback/view`) use a server component wrapper that checks the session and redirects to `/login` if unauthenticated.
- The feedback form is public for students and TAs, but LA-specific feedback types (Head LA, Observation) require login.

## Styling

Use shadcn to add components:

```bash
npx shadcn add <component>
```

Never copy-paste shadcn component source manually — always use the CLI.

## New Quarter

To set up for a new quarter, you will need to:
- Create a SQLite (D1) + bucket (R2) for app data + profile images respectively
  - Go into Cloudflare and create a new D1 database, name it something sensible like data-w25
  - Create a new R2 bucket, name it something sensible like storage-w25
  - You do not need to create a replacement for db-backups or config
  - Go into `wrangler.jsonc` and replace the `database_name` and `bucket_name` respectively
  - Push your commit to main to lock in these changes. You may need to run migrations; refer above to the database section to learn how to apply the migrations.
