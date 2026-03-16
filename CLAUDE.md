# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Monorepo for the UCLA Learning Assistant Program web app (<https://www.laprogramucla.com>). Used by LAs and PDT to manage the feedback and observation cycle each quarter. Three top-level directories: `frontend/`, `backend/`, `terraform/`.

## Commands

### Frontend

```bash
cd frontend
npm i          # install deps
npm run dev    # dev server at localhost:3000
npm run build  # production build (catches type errors)
npm run lint   # ESLint
```

### Backend

No local dev server. Deploy and test backend routes by opening a PR — GitHub Actions will provision a test environment and post environment variable instructions as a PR comment. Set `NEXT_PUBLIC_API_URL` in the frontend to point at the test API URL.

## Architecture

### Frontend (`frontend/`)

- **Next.js 16** (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Form, Zod 4
- `app/` — file-based routing. Current routes:
  - `/` — landing page (hero with CTA links to `/feedback` and `/login`)
  - `/feedback` — multi-variant feedback form (the main feature)
  - `/login` — email-based OTP login (stub — `handleSubmit` is a server action that currently just logs)
- `components/ui/` — shadcn components. Add new ones with `npx shadcn add <component>`. Never copy-paste component source manually.

#### Feedback form (`app/feedback/`)

The feedback form is the most complex part of the frontend. It conditionally renders different sections based on role (`student`, `la`, `ta`) and feedback type.

- **Schema** (`schema.ts`): validation uses nested `z.discriminatedUnion` — first on `role`, then on `feedback_type` (and `la_head_type` for LA→Head LA). Shared field groups (`headerFields`, `closingFields`, `mqFields`, `eqFields`, `laPedFields`, `laLccFields`, `obsFields`, `taFields`, etc.) are defined once and spread into both variant schemas and `baseSchema`. `baseSchema` exists only for type inference (`FeedbackFormValues`) and generating `defaultValues` — it is built from the field groups, not maintained manually. When adding a new field, add it to the relevant field group; it will flow into `baseSchema`, `defaultValues`, and the variant schema automatically.
- **Constants** (`constants.ts`): all dropdown/radio options and question lists. Courses and LAs are currently hardcoded (will eventually be fetched from backend).
- The exported `feedbackFormSchema` is cast to `z.ZodType<FeedbackFormValues, FeedbackFormValues>` because the discriminated union's inferred type is narrower than the flat `FeedbackFormValues` that TanStack Form expects. This cast is safe — runtime validation is correct.

### Backend (`backend/`)

- Python 3.14. Each `.py` file = one Lambda function = one API route.
- Lambdas use AWS Lambda format 2.0 payload. Each handler parses HTTP method, path, body, etc. from the `event` dict directly.
- No shared runtime or framework — each file is standalone.

### Infrastructure (`terraform/`)

- Avoid changing Terraform files; they should only be edited by humans. Only read Terraform files to figure out how to properly access AWS resources for backend routes.
- Two Terraform modules: `deploy` (per-PR, duplicatable: API Gateway + Lambdas) and `prod` (production-only: domain, TLS cert).
- Two configs: `terraform/dev/` (PR previews, one workspace per PR named e.g. `pr150`) and `terraform/release/` (production, `default` workspace).
- Terraform state is in S3; AWS credentials are in GitHub Secrets.
- `deploy` automatically provisions a Lambda for every `.py` file found in `backend/`.
