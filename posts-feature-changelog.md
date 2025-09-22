# Posts Feature Changelog (صور فقط حالياً)

This document summarizes the complete state of the Posts feature across backend, database, and frontend. It lists file locations, responsibilities, implemented behavior, partial gaps, and recommended next steps to reach a production‑ready Instagram‑like posts system (images today; videos later).

## Database Models & Indexes

- `lib/models/Post.ts`
  - Purpose: Core post entity.
  - Fields: `userId`, `caption`, `imageFileId`, `location { name, city, coordinates: [lng, lat] }`, `rating (1–5)`, `hashtags[]`, `likesCount`, `commentsCount`, `taggedUserIds[]`.
  - Indexes: `userId`, `createdAt`, `hashtags`, `location.coordinates` (2dsphere), `taggedUserIds`.
  - Notes: Designed for image posts; supports tagged users and geospatial queries.

- `lib/models/Comment.ts`
  - Purpose: Comments on posts; supports one‑level threading via `parentId`.
  - Fields: `postId`, `userId`, `content`, `parentId?`, `likesCount`, timestamps.
  - Indexes: default `_id` and typical lookups by `postId`.

- `lib/models/PostLike.ts`
  - Purpose: Idempotent post likes.
  - Fields: `postId`, `userId`.
  - Indexes: unique compound `(postId, userId)`.

- `lib/models/CommentLike.ts`
  - Purpose: Idempotent comment likes.
  - Fields: `commentId`, `userId`.
  - Indexes: unique compound `(commentId, userId)`.

- Related models that affect posts visibility & UX
  - `lib/models/Follow.ts` — governs privacy gating for private profiles.
  - `lib/models/UserBlock.ts` — `(blockerId, blockedId)` unique; used to filter blocked users across feeds and lists.
  - `lib/models/User.ts` — owner privacy via `privacy: 'public'|'private'` (and legacy `isPrivate`).

## API Endpoints (Posts & Related)

- Feed & Create
  - `app/api/posts/route.ts`
    - `GET /api/posts?cursor=&limit=&taggedUserId=` — cursor‑based feed; supports tagged user filter.
      - Enforces privacy: hides posts from private owners unless viewer is accepted follower.
      - Enforces blocks: hides posts where viewer blocked/was blocked by the owner.
    - `POST /api/posts` — create a post; requires `imageFileId` from uploads. Validates via Zod.

- Single Post & Likes
  - `app/api/posts/[postId]/route.ts` — `GET /api/posts/:postId` with privacy enforcement.
  - `app/api/posts/[postId]/like/route.ts` — `POST /api/posts/:postId/like` toggle (idempotent via `PostLike`).
  - `app/api/posts/[postId]/unlike/route.ts` — `POST` proxies to toggle like route.

- Comments
  - `app/api/posts/[postId]/comments/route.ts` —
    - `GET` paginated comments; `parentId` filter for replies.
    - `POST` create comment/reply; atomically increments `Post.commentsCount`.
  - `app/api/comments/[id]/like/route.ts` — `POST` toggle comment like (idempotent via `CommentLike`).

- Uploads (images)
  - `app/api/uploads/route.ts` — `POST` multipart parse (Busboy), image transform (Sharp), store to GridFS.
  - `app/api/uploads/[id]/route.ts` — `GET` stream image by fileId with content-type + cache headers.

- Supporting policies
  - `lib/auth/permissions.ts` — `isFollowingAccepted`, `canMessage`, `getViewerIdFromRequest`. Used by feed/privacy logic.

## Frontend UI & Hooks

- Feed & Post Cards
  - `components/feed/home-feed.tsx`
    - Purpose: Infinite posts feed using React Query `useInfiniteQuery` against `/api/posts` (cursor pagination).
    - Shows loading/empty states; integrates with post card components.
  - `components/feed/post-card.tsx`
    - Purpose: Display a single post card with like button; optimistic like toggle using React Query cache updates; calls `/api/posts/:id/like`.

- Create Post
  - `components/create/create-post.tsx`
    - Purpose: Image selection + caption/location/rating; uploads image to `/api/uploads` then `POST /api/posts`.
    - Uses Next.js router for navigation and includes accessible labels/aria where applicable.

- Comments
  - `components/feed/comments-section.tsx`
    - Purpose: Root comments (infinite) + replies; optimistic insert and like toggles for comments.
    - Calls `/api/posts/:postId/comments` and `/api/comments/:id/like`.

- Profile Pages (where posts appear)
  - `app/u/[username]/page.tsx`
    - Tabs (ARIA): Posts | Tagged | Highlights.
    - Posts tab renders a responsive grid from `/api/users/[username]` response.
    - Tagged tab fetches `/api/posts?taggedUserId={user.id}` with `useInfiniteQuery`.

- Client API wrappers
  - `lib/api/posts.ts`
    - `listPosts(cursor?, limit?, taggedUserId?)` → `GET /api/posts`
    - `getPost(id)` → `GET /api/posts/:id`
    - `createPost(input)` → `POST /api/posts`
    - `likePost(id)` / `unlikePost(id)` → toggle like

## Implemented & Working

- Image posts creation via GridFS + Sharp transform, then `POST /api/posts`.
- Feed pagination with cursor; privacy gating and block enforcement applied server‑side.
- Single post fetch with privacy check.
- Likes: idempotent toggling for posts and comments with counts updated.
- Comments: paginated root/replies with optimistic insert and like toggles.
- Tagged posts listing via `?taggedUserId=` in feed endpoint and profile UI tab.
- Client caching with React Query; optimistic updates for likes/comments; accessible UI improvements.

## Partial or Missing

- Multiple images per post (carousel) — not implemented (current schema stores a single `imageFileId`).
- Save/Bookmark / Collection features — endpoints and UI not present.
- Share (deep links, copy link, external share) — not present.
- Video support (upload/transcode/stream) — not implemented; upload/serve pipeline currently optimized for images.
- Reporting/Moderation (report post/comment, hide, admin tools) — not present.
- Advanced search (hashtags, location radius, combined filters) — basic filters exist via APIs; could expand.
- Rich analytics (views/impressions) — not present.

## Database / Index Overview (posts related)

- `Post`: indexes on `userId`, `createdAt` (feed), `hashtags` (search), `location.coordinates` (2dsphere for map), `taggedUserIds` (tagged feed).
- `PostLike`: unique `(postId, userId)` ensures idempotency.
- `CommentLike`: unique `(commentId, userId)` ensures idempotency.
- `Follow`: unique `(followerId, followingId)`; used by privacy gating.
- `UserBlock`: unique `(blockerId, blockedId)`; used by block enforcement in feed/lists/messaging.

## Recommended Next Steps (toward Instagram‑like posts)

**Near‑term (images)**

- Add Save/Bookmark endpoint + UI (collections later):
  - `POST /api/posts/:postId/save` / `DELETE .../save` (or toggle) and profile tab for saved posts (owner only).
- Multiple images per post (carousel):
  - Extend `Post` with `imageFileIds: ObjectId[]` and a dedicated array ordering.
  - Update uploads to accept multiple files; UI carousel with accessible controls.
- Share actions: copy link, share to external networks; generate OpenGraph meta.
- Improve error/loading/empty states consistently; add skeleton grids for feed/profile.

**Medium‑term (videos & performance)**

- Video support (MVP):
  - Accept video uploads; offload transcode (FFmpeg) to background workers; store variants (HLS/MP4) and thumbnails.
  - Add `mediaType` + `videoFileId`/`playlistUrl` to `Post`.
- Image optimization pipeline: pre‑generate sizes (e.g., 320/640/1080) and auto‑select via `next/image`.
- Rate limiting on write endpoints (auth, posts, comments, follows, likes, saves).
- Caching for read endpoints (ISR/revalidate or in‑memory/edge caches for hot profiles).

**Long‑term**

- Moderation/reporting tools (report post/comment, flags, admin review endpoints).
- Advanced discovery (hashtag pages, location radius queries, combined filters, trends).
- Analytics (basic views/impressions per post) with privacy in mind.
- E2E tests (Playwright) for compose/like/comment flows and regressions.

## Summary

The Posts system (صور فقط) is functional and production‑leaning for images: creation, uploads, feed pagination, privacy/block enforcement, likes, comments, and tagged posts are in place. To reach an Instagram‑like experience, prioritize multi‑image carousels, save/bookmark, share UX, and eventually videos with a background processing pipeline. Indexes and models are well prepared for scaling; next steps focus on richer media, feature breadth, and production hardening.
