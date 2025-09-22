# Arabic Tourism Social (Frontend + Backend API)

## Setup

- Prereqs: Node 22+, PNPM 10+
- Install: `pnpm install`
- Env: copy `.env.example` to `.env.local` and fill values:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `NEXTAUTH_COOKIE_NAME=app_token`
  - Optional image/upload limits

## Common Commands

- Dev: `pnpm dev`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Build: `pnpm build` (Next.js App Router)
- Seed DB: `pnpm seed` (Mongo running; sample images in `scripts/sample-images/`)

## Seeding

1. Set env vars (PowerShell example):

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/arabic_tourism_social"
$env:JWT_SECRET="dev-secret"
$env:NEXTAUTH_COOKIE_NAME="app_token"
```

2. Add files: `scripts/sample-images/one.webp`, `two.webp`, `three.webp`
3. Run: `pnpm seed`

Creates users (alice/bob/carol; password: "password"), follows, posts, comments, conversation.

## Admin Endpoints

- `GET /api/admin/health` → `{ ok, dbState, now }` (auth required)
- `GET /api/admin/stats` → collection counts (auth required)

## CI

GitHub Actions on PRs and pushes:

- `pnpm install`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

## Tech Stack

- Next.js 14 (App Router), React 18, TypeScript, Tailwind
- MongoDB + Mongoose (GridFS for images)
- JWT auth (access + refresh cookie)
- React Query for server state
