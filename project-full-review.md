# Project Full Review

This document provides an end‑to‑end technical review of the project for production readiness and future planning. It covers architecture, database schema, backend APIs, frontend routes/components, supporting libraries, CI/CD and deployment, followed by concrete recommendations.

## High‑Level Architecture

```
┌──────────────────────────────┐         ┌─────────────────────────────┐
│          Frontend            │         │           Backend            │
│  Next.js App Router (SSR/CSR)│         │ Next.js API Routes (nodejs) │
│  React 18 + TS + Tailwind    │  HTTP   │ Zod validation               │
│  React Query (TanStack)      │<──────▶ │ Auth (JWT access+refresh)   │
│  Zustand (UI state only)     │         │ MongoDB + Mongoose          │
│  next/image + uploads        │         │ GridFS (Busboy+Sharp)       │
│  sonner (toasts)             │         │ Privacy, Block, Highlights  │
└──────────────┬───────────────┘         └───────────────┬─────────────┘
               │                                          │
               │                                          │
               ▼                                          ▼
        CDN / Vercel Edge                         MongoDB Atlas / Local
        Next static assets                        ┌───────────────────┐
                                                  │  Users, Posts,   │
                                                  │  Follows, Blocks │
                                                  │  Comments, Likes │
                                                  │  Highlights,     │
                                                  │  Stories, Files  │
                                                  └───────────────────┘
```

- App Router pages render UI and call API routes via `lib/api/*` wrappers.
- API routes implement business logic over Mongoose models; images streamed via GridFS.
- Authentication is JWT (short‑lived access token + httpOnly refresh cookie) with middleware gating private pages.
- React Query handles client caching, pagination and optimistic updates.

---

## Database (Mongoose) Overview

Key schemas (paths in `lib/models/*`):

- `User.ts`
  - Core: `email` (unique), `username` (unique), `passwordHash`, `displayName`, `bio`, `isPrivate` (legacy), `privacy: 'public'|'private'` (authoritative)
  - Media: `avatarFileId`, `coverFileId`
  - Social: `socialLinks { instagram, snapchat, twitter, tiktok, website }`, `bioLinks: string[]`
  - Controls: `notificationPrefs { likes, comments, follows, messages }`, `contactEmail`, `contactPhone`
  - Indexes: `email`, `username`, `privacy`

- `Post.ts`
  - `userId`, `caption`, `imageFileId`, `location { name, city, coordinates [lng,lat] }`, `rating`, `hashtags[]`, counts
  - `taggedUserIds[]` to support tagged feed
  - Indexes: `userId`, `createdAt`, `hashtags`, `location.coordinates` (2dsphere)

- `Comment.ts`, `PostLike.ts`, `CommentLike.ts` (likes are idempotent via unique compound indexes)

- `Follow.ts`
  - `followerId`, `followingId`, `status: 'pending'|'accepted'` (unique compound index); basis for privacy/content gating

- `Conversation.ts`, `Message.ts` (messaging), `Notification.ts` (notifications)

- `UserBlock.ts`
  - `blockerId`, `blockedId` unique compound; used to enforce block policy in feed/lists/messaging

- `Highlight.ts` / `Story.ts`
  - Highlights grouped by user; stories reference `highlightId` and an `imageFileId`
  - Indexes: `Highlight.userId, updatedAt` and `Story.highlightId, createdAt`

Relations

- `User 1—* Post`, `User 1—* Follow`, `User 1—* Highlight`, `Highlight 1—* Story`
- Likes and comments reference posts; follows and blocks relate pairs of users

---

## Backend (API) Surface

App Router API routes (selected):

- Auth & Session
  - `app/api/auth/login|logout|me/route.ts` — JWT access + refresh cookie; `/me` can mint new access tokens
  - `middleware.ts` — redirects unauthenticated users to `/auth` outside public routes

- Users & Profiles
  - `app/api/users/[username]/route.ts` — fetch profile + recent posts; enforces private access
  - `app/api/users/me/route.ts` — GET current user; PATCH profile (username/bio/social/avatars/cover/contacts/notificationPrefs/privacy)
  - `app/api/users/check-username/route.ts` — availability probe for live validation
  - Followers / Following: `app/api/users/[username]/followers|following/route.ts` — pagination + `?q=` search; filters out blocked users
  - Blocks: `app/api/users/[username]/block|unblock/route.ts`, `app/api/users/me/blocks/route.ts`

- Posts & Comments
  - `app/api/posts/route.ts` — cursor feed; supports `?taggedUserId=`; enforces privacy; filters out posts from blocked owners
  - `app/api/posts/[postId]/route.ts` — fetch single post with privacy
  - `app/api/posts/[postId]/like|unlike/route.ts` — idempotent toggles via `PostLike`
  - Comments: `app/api/posts/[postId]/comments/route.ts`, `app/api/comments/[id]/like/route.ts`

- Follows & Requests
  - `app/api/follows/route.ts` — follow/unfollow; follow requests for private users; creates notifications

- Messaging & Notifications
  - `app/api/conversations/route.ts`, `app/api/conversations/[id]/messages/route.ts`
  - `app/api/notifications/*` — polling endpoints for notifications

- Uploads (GridFS)
  - `app/api/uploads/route.ts` — multipart (Busboy), Sharp transforms → GridFS store
  - `app/api/uploads/[id]/route.ts` — stream by fileId (content-type + cache headers)

- Highlights (Stories)
  - `app/api/highlights/route.ts` — list/create highlights
  - `app/api/highlights/[id]/route.ts` — patch/delete highlight
  - `app/api/highlights/[id]/stories/route.ts` — list/create stories

Enforcement helpers

- `lib/auth/permissions.ts` — `getViewerIdFromRequest`, `isFollowingAccepted`, `canMessage` (now denies when block exists)

---

## Frontend (Routes, Components, Hooks)

- Routes (App Router)
  - Public marketing: `app/(public)/landing`, `/about`, `/contact`
  - Auth: `app/auth/page.tsx` (login/register via API; redirect `next=`)
  - Private app: `/home` (feed), `/discover`, `/map`, `/create`, `/notifications`, `/messages`
  - Profile: `app/u/[username]/page.tsx` (public+owner view)

- Profile page (`app/u/[username]/page.tsx`)
  - Identity, social links, quick contact
  - Highlights row (covers via `/api/highlights?userId=`)
  - Slideshow modal (slides via `/api/highlights/[id]/stories`; framer‑motion transitions)
  - Owner create/edit/delete highlight flows
  - Tabs: Posts | Tagged | Highlights (ARIA roles + keyboard navigation + consistent states)
  - Private‑account notice; actions: Follow/Unfollow/Message; Edit Profile for owner

- Edit Profile (`components/profile/edit-profile-modal.tsx`)
  - Avatar/cover uploads; fields for username (debounced availability), bio, privacy, social links, contact fields, notification prefs
  - Save via PATCH `/api/users/me`; inline availability hint; disables when taken

- Followers/Following (`components/profile/followers-modal.tsx`)
  - Infinite queries; debounced `?q=` search; follow toggle; filtered by block rules on backend

- Create Post (`components/create/create-post.tsx`)
  - Uses Next.js router navigation (close X); uploads via `/api/uploads`

- Hooks & utilities
  - `lib/api/*` — Fetch wrappers (React Query friendly), auth token handling, `apiFetch`
  - `lib/auth/jwt.ts`, `lib/api/errors.ts`, `lib/env.ts` (Zod env validation), `lib/db.ts` (cached mongoose connect)

- State & Data
  - React Query: caching/pagination/optimistic updates across posts, comments, lists
  - Zustand reserved for UI‑only state

- UI libraries
  - Tailwind CSS, shadcn/radix primitives
  - `next/image` everywhere for media; `sonner` for toasts; `framer-motion` for highlights slideshow

---

## DevOps / Config / Tooling

- `package.json` — scripts for `dev`, `build`, `start`, `typecheck`, `lint`, `seed`, `loadtest`
- ESLint/Prettier flat configs; type‑checked TS; many warnings treated as non‑blocking for velocity
- GitHub Actions: CI installs deps, runs typecheck/lint/build; envs via GitHub secrets
- `next.config.mjs` — security headers (HSTS, X-CTO, XFO, Referrer, Permissions-Policy), images unoptimized (can switch to optimized on Vercel)
- `middleware.ts` — public route allowlist + redirect unauthenticated to `/auth`
- Seed/Load Testing: `scripts/seed.ts`, `seed-bulk.ts`, `loadtest.ts`
- Environment: `.env.example` defines Mongo URI, JWT secret, cookie name, upload limits, image defaults

---

## Capability Matrix

Implemented & mature

- Custom auth (JWT + refresh cookie), login/register/logout and autorefresh in client
- Posts feed (cursor), privacy gating for private profiles, likes (idempotent), comments (threaded one level), notifications
- Follows (requests for private), accept/reject, content gating
- Messaging (conversations/messages) with policy enforcement (now respects blocks)
- Uploads (Busboy + Sharp + GridFS) and streaming, cache headers
- Discover/search endpoints (users/posts/top destinations) with debounced UI
- Map (Leaflet with clustering); profile and feed performance with React Query
- Block system (model + enforcement across posts/followers/following/messaging)
- Highlights backend (models + CRUD) and production‑ready UI (covers + slideshow, owner CRUD)
- ARIA tabs and keyboard nav; toasts for highlight actions; inline username availability

Partially implemented / enhanced recently

- Notifications UI: polling; unread indicator; can expand for granular types
- Settings: modal with privacy + notifications + block list; (optional dedicated page in future)
- Error/loading/empty states are present; can deepen consistency

Missing or planned

- Story navigation features (prev/next, auto‑advance, progress bars), modals for create/edit highlight instead of prompt
- Rate limiting / abuse protection on write endpoints
- Comprehensive i18n extraction for all new strings; RTL review in all new UI
- Advanced security hardening (CSP suited to Next.js images and domains), consider CSRF for cookie‑based flows

---

## Schema Relations & Indexes (summary)

- Unique: `User.username`, `User.email`, `UserBlock (blockerId,blockedId)`, `PostLike (postId,userId)`, `CommentLike (commentId,userId)`
- Compound/Search: `Post.createdAt`, `Post.hashtags`, `Post.location.coordinates` (2dsphere), `Highlight.userId, updatedAt`, `Story.highlightId, createdAt`

---

## API Surface (summary)

- Auth: `/api/auth/login|logout|me`
- Users: `/api/users/[username]`, `/api/users/me (GET,PATCH)`, `/api/users/check-username`
- Follows: `/api/follows (POST,DELETE)`; follow‑requests accept/reject
- Blocks: `/api/users/[username]/block|unblock`, `/api/users/me/blocks`
- Posts: `/api/posts (GET cursor + taggedUserId, POST)`, `/api/posts/[postId]`, `/api/posts/[postId]/like|unlike`
- Comments: `/api/posts/[postId]/comments`, `/api/comments/[id]/like`
- Conversations: `/api/conversations`, `/api/conversations/[id]/messages`
- Notifications: `/api/notifications`, `/api/notifications/[id]/read`, `/api/notifications/read-all`
- Uploads: `/api/uploads`, `/api/uploads/[id]`
- Highlights: `/api/highlights (GET,POST)`, `/api/highlights/[id] (PATCH,DELETE)`, `/api/highlights/[id]/stories (GET,POST)`

---

## Frontend Route Map (summary)

- Public: `/`, `/about`, `/contact`
- Auth: `/auth`
- App: `/home`, `/discover`, `/map`, `/create`, `/notifications`, `/messages`, `/u/[username]`

Key components: profile page (tabs/highlights), modals (edit/settings/followers), feed (home), create post, map, notifications.

---

## Recommendations (next steps)

Production hardening

- Index audit & migration: ensure indexes exist in prod (username unique, block compound, highlight/story indexes)
- Add request rate limiting on write endpoints (auth, posts, comments, follows, highlights)
- Expand security headers (CSP suited to Next.js images and domains), consider CSRF for cookie‑based flows
- Centralize error codes (409 for duplicate username) and client handling

UX polish

- Replace highlight prompts with accessible dialogs; add story navigation/auto‑advance/progress
- Consistent toasts for profile saves, unblocks, and errors
- Rich empty/error states across pages; skeleton loading for grids

Scalability

- Introduce background jobs for heavy image work if needed (e.g., multiple sizes, video stories)
- Cache layer for read‑heavy endpoints (e.g., profile fetch, highlights list)
- Consider real‑time transport (Pusher/Ably) by implementing `lib/realtime.ts`

Developer Experience

- Add e2e smoke tests (Playwright) for auth, profile, post create, highlights
- Extend seed scripts with highlights/stories and realistic media

With the current codebase, the profile feature set (including Highlights UI) is production ready after a brief QA pass and index verification. Deploy to staging, run the seed, verify flows, then proceed to production.
