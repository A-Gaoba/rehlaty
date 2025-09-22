# Deployment Checklist

## Platform

- Vercel (Next.js 14 App Router)
- Runtime: Node.js (edge not required due to Busboy/Sharp)

## Environment Variables

Required:

- MONGODB_URI (MongoDB Atlas)
- JWT_SECRET (strong random secret)
- NEXTAUTH_COOKIE_NAME (e.g., app_token)
- NODE_ENV (production on Vercel)

Uploads and image processing:

- UPLOADS_MAX_FILE_SIZE_MB (default 10)
- IMAGE_MAX_WIDTH (default 2000)
- IMAGE_MAX_HEIGHT (default 2000)
- IMAGE_QUALITY (default 80)

Set in Vercel Project Settings → Environment Variables for Production/Preview/Development.

## MongoDB Atlas

- Create cluster, DB user, and network access
- Use SRV connection string in MONGODB_URI

## Build & Runtime

- Install: pnpm install
- Build: pnpm build
- Start (Vercel handles): next start
- Sharp is supported by default on Vercel

## Caching and Headers

- Uploads: GET /api/uploads/[id] sets
  - Cache-Control: public, max-age=31536000, immutable
  - Content-Type from GridFS metadata (image/webp)

## Rate Limiting

Protect auth + write endpoints:

- POST /api/auth/login, /api/auth/register
- POST /api/posts, /api/posts/[id]/like, /api/posts/[id]/unlike
- POST /api/posts/[postId]/comments, /api/comments/[id]/like
- POST /api/follows, /api/follow-requests/\*
- POST /api/conversations/[id]/messages

Recommended: Upstash Redis

- @upstash/ratelimit + @upstash/redis
- Sliding window e.g. 10 req / 10 s per IP

Pseudo:

```ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
const redis = Redis.fromEnv()
export const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '10 s') })
```

## Security

- HSTS, nosniff, frame options, referrer policy, permissions policy in next.config.mjs
- Refresh token via httpOnly, Secure cookie

## Observability

- Vercel Analytics optional
- Consider Sentry for API routes

## Smoke Test

- GET /api/admin/health → ok true
- Seed locally and verify:
  - Register/Login
  - Create Post + upload
  - Home Feed images via /api/uploads/[id]
  - Comments & notifications
  - Messages pagination

## Rollback

- Keep last good Vercel deployment for instant rollback
