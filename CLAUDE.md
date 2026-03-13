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
```

### Backend

No local dev server. Deploy and test backend routes by opening a PR — GitHub Actions will provision a test environment and post environment variable instructions as a PR comment. Set `NEXT_PUBLIC_API_URL` in the frontend to point at the test API URL.

## Architecture

### Frontend (`frontend/`)

- **Next.js 16** (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`base-nova` style)
- `app/` — file-based routing.
- `components/ui/` — shadcn components live here. Freely search for and add new ones with `npx shadcn add <component>`. Do not copy paste components.
- `lib/utils.ts` — exports `cn()` (clsx + tailwind-merge).
- Styling uses CSS variables defined in `app/globals.css`. Theme uses oklch colors; primary is UCLA blue.

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
