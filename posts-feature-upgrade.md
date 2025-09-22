# Posts Feature Upgrade — Changelog

This changelog covers the latest upgrade of the Posts feature to add clickable authors, improved like UI, multiple images per post (carousel), sharing, and bookmarks, with backend, database, and frontend updates.

## Database

- `lib/models/Post.ts`
  - Added `imageFileIds: ObjectId[]` (kept legacy `imageFileId` fallback).
  - Index on `imageFileIds` for convenience.

- `lib/models/PostSave.ts` (new)
  - `{ userId, postId }` with unique compound index; records saved posts.

- Seed updates: `scripts/seed.ts`
  - Creates some posts with multiple images (`imageFileIds`) and some with single image.

## Backend API

- Feed/Create: `app/api/posts/route.ts`
  - `GET /api/posts?cursor=&limit=&taggedUserId=` (unchanged behavior + existing privacy/block enforcement)
  - `POST /api/posts` now accepts `imageFileIds` (or legacy `imageFileId`).

- Save/Bookmark:
  - `POST /api/posts/[postId]/save` — toggle save for the authenticated user.
  - `GET /api/users/[username]/saved` — list saved posts for a user (used in owner profile).

- Single post view (share targets):
  - `app/p/[postId]/page.tsx` — dynamic route with OpenGraph/Twitter meta tags (title, first image, description) for rich previews.

## Frontend UI

- Post card: `components/feed/post-card.tsx`
  - Author avatar/username now link to `/u/[username]`.
  - Heart icon fills red when liked; optimistic count updates via React Query cache.
  - Share button uses native `navigator.share()` when available; fallback copies `/p/{postId}` to clipboard.
  - Bookmark icon toggles saved state via `POST /api/posts/[postId]/save`.
  - Media rendering uses a carousel when `imageFileIds` exist (see below).

- Carousel: `components/feed/post-carousel.tsx` (new)
  - Accessible image carousel with keyboard navigation (Arrow/Home/End) and touch swipe.
  - Uses `next/image` with explicit sizes and small indicators.

- Profile (owner saved tab): `app/u/[username]/page.tsx`
  - Added “Saved” tab (owner only) backed by `GET /api/users/[username]/saved`.
  - Consistent loading/empty/error states across tabs.

## Client API

- `lib/api/posts.ts`
  - `listPosts(cursor?, limit?, taggedUserId?)` — unchanged contract.
  - `createPost` continues to work; when sending multiple images, pass `imageFileIds: string[]` in body.
  - Likes remain via `/api/posts/:id/like` toggle.

## UX & Accessibility

- Heart like button: clear color feedback + optimistic updates.
- Post author navigation: avatar/username are links with focus outlines and aria labels.
- Carousel: keyboard navigable (Arrow/Home/End), swipe on touch, focusable container with visible focus ring.
- Share: copies URL when Web Share is unavailable.
- Tabs (profile): ARIA roles, keyboard support, consistent states.

## Testing / QA Checklist

- Likes: click heart toggles color and count instantly; persists on refresh.
- Author link: clicking avatar/username navigates to `/u/[username]`.
- Multiple images: create a post with `imageFileIds` and verify carousel navigation on desktop/mobile.
- Share: share copies `/p/{postId}` when native share is unavailable; OG/Twitter meta resolves on `/p/[postId]`.
- Bookmarks: toggle save; Saved tab lists saved posts for owner.

## How to Create Multi‑Image Posts (API example)

```bash
curl -X POST http://localhost:3000/api/posts \
  -H 'Content-Type: application/json' \
  -d '{
    "caption":"رحلة جديدة!",
    "imageFileIds":["<fileId1>","<fileId2>"],
    "location": {"name":"Red Square","city":"Moscow","coordinates":[37.6208,55.7539]},
    "rating":5
  }'
```

(Use `/api/uploads` to obtain `fileId`s.)

## Next Recommendations

- Replace carousel placeholder in post card with full gallery controls (thumbnails, progress, auto‑advance optional).
- Add collections for saved posts and Saved tab on a dedicated page (optional).
- Add OG tags for profile and discovery pages as needed; enhance single post view (`/p/[postId]`) with comments and actions.
- Add tests for like/bookmark/share/carousel flows (Playwright).

---

Release Owner: Posts upgrade (multi‑image, save, share, author links) — complete.
