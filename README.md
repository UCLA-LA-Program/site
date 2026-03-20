# UCLA Learning Assistant Website

This repository contains the code for the Learning Assistant website at UCLA. This is not an informational website; it is actively used by both LAs and PDT to manage the feedback and observation cycle each quarter.

Please visit <https://www.laprogramucla.com> to see the production website.

## Tech Stack

- **Next.js 16** (App Router) with React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Cloudflare Workers** — hosting via the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare)
- **Cloudflare D1** — SQLite database for auth and app data
- **BetterAuth** — authentication with magic link login
- **Kysely** — type-safe SQL query builder (with `kysely-d1` for D1)

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
laprogram/              Full-stack Next.js app
├── app/                File-based routing (pages + API routes)
│   ├── api/auth/       BetterAuth catch-all route
│   ├── feedback/       Feedback form (main feature)
│   └── login/          Magic link login
├── components/ui/      shadcn components
├── lib/                Auth config, utilities
├── migrations/         D1 database migrations
├── wrangler.jsonc      Cloudflare Workers config
└── open-next.config.ts OpenNext adapter config
```
