# Frontend

This is a [Next.js](https://nextjs.org/docs) project.

## Technical Guide

We use a subset of Next.js features in order to ease development and reduce cost. These include that we:

- use the App Router
- do not use Vercel for anything other than front-end deployment (all API routes are deployed through Lambdas)
- minimize usage of Next.js Route Handlers
- minimize usage of SSR (server-side rendering) as this app does not require SEO optimization and we wish to minimize requests to Vercel

## Getting Started

First, install dependencies.

```bash
cd frontend
npm i
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Edit the `page.tsx` files in `/app` to change the site's contents. Please read the codebase and the [Next.js docs](https://nextjs.org/docs) for more information.

## API Access

> [!WARNING]
> Do not hardcode API routes. Instead, set the `NEXT_PUBLIC_API_ROUTE` environment variable while developing. This ensures your API calls will work on the production deployment as this URL changes between test and production deployments.

You can get a test API URL by making a PR on Github. More information is in [the root README.md](../README.md).

You can set the environment variable by making a copy of `.env.example`, naming it `.env`, and setting the environment variable there. Next.js automatically loads this variable upon starting the development server.
