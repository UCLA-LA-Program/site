# UCLA Learning Assistant Website

This repository contains the code for the Learning Assistant website at UCLA. This is not an informational website; it is actively used by both LAs and PDT to manage the feedback and observation cycle each quarter.

Please visit <https://www.laprogramucla.com> to see the production website.

## Tech Stack

- **Next.js 16** (App Router) with React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Cloudflare Workers** — hosting via the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare)
- **Cloudflare D1** — single SQLite database (`data`) for auth and app tables (users, courses, feedback)
- **Cloudflare R2** — object storage for avatar images
- **Cloudflare Images** — image transformation (avatar resizing)
- **BetterAuth** — authentication with magic link login, admin/ban support, impersonation
- **AWS SES** — transactional email (magic link delivery)
- **Kysely** — type-safe SQL query builder (with `kysely-d1` for D1)
- **TanStack Form** + **Zod 4** — form state management and validation
- **SWR** — client-side data fetching and caching

## Getting Started

```bash
cd laprogram
npm i
npm run dev
```

This starts a Next.js development server at <http://localhost:3000>.

To preview on the local Cloudflare Workers runtime (closer to production):

```bash
npm run preview
```

Copy `.env.example` to `.env` and fill in the required values. See [laprogram/README.md](laprogram/README.md) for more details.

## Deploying

```bash
cd laprogram
npm run deploy
```

This builds the app with the OpenNext adapter and deploys to Cloudflare Workers via Wrangler. Secrets (like `BETTER_AUTH_SECRET`) are managed with `npx wrangler secret put <NAME>`.

## Project Structure

```
laprogram/                  Full-stack Next.js app
├── app/                    File-based routing (pages + API routes)
│   ├── api/
│   │   ├── auth/[...all]   BetterAuth catch-all route
│   │   ├── feedback/       Submit (POST, public) & retrieve (GET, auth) feedback
│   │   ├── la/             List all LAs (GET, public)
│   │   ├── la/self/        Get user's own course positions (GET, auth)
│   │   └── settings/avatar Upload avatar (POST, auth)
│   ├── feedback/           Feedback form (public, LA features gated behind login)
│   ├── feedback/view/      View received feedback tables (auth)
│   ├── login/              Magic link login
│   └── settings/           User settings — avatar, courses (auth)
├── components/ui/          shadcn components
├── lib/                    Auth config, email, utilities
├── types/                  TypeScript types (db.ts)
├── migrations/             D1 database migrations
├── scripts/                SQL seed scripts (testing.sql)
├── wrangler.jsonc          Cloudflare Workers config (all bindings)
└── open-next.config.ts     OpenNext adapter config
```
