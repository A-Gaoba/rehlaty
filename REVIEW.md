## Arabic Tourism Social – Frontend Expert Review (Next.js 14, React, Tailwind)

### High-level project summary

- **Stack**: Next.js 14 (App Router), React 18, Tailwind CSS, Radix UI, Zustand, TypeScript.
- **Architecture**: Single root route `app/page.tsx` renders a client-side `MainLayout` and switches views via a Zustand `activeTab` (no multi-route navigation yet).
- **State**: Global client store in `lib/store.ts` (Zustand + persist) initialized with mock data from `lib/mock-data.ts` and types in `lib/types.ts`.
- **i18n/RTL**: Simple `LanguageProvider` toggles between Arabic and English, sets `dir` and `lang` attributes; app root sets `<html lang="ar" dir="rtl">`.
- **UI**: Feature-oriented components under `components/*` (feed, discover, map, profile, messages, notifications, create, layout, ui). Assets in `public/`.
- **Networking**: None. All data is mocked in memory; no API calls/server actions.

Key entry points

- `app/layout.tsx`: Themes, language provider, Vercel Analytics.
- `app/page.tsx`: Decides between `AuthPage` and `MainLayout` based on `currentUser` in store.
- `components/layout/main-layout.tsx`: Renders tabs: home, discover, map, create, profile, messages, notifications.

### Structure and component/page overview

- `components/feed`
  - `home-feed.tsx`: Lists posts from store; mock “refresh”; story strip; “load more” button placeholder.
  - `post-card.tsx`: Post UI (like/save/share, caption, hashtags, counts) and toggles via store; opens `CommentsSection`.
  - `comments-section.tsx`: Displays/post comments. Uses `getMockCommentsForPost` helper (static), while mutations go to store.
- `components/discover`
  - `discover-page.tsx`: Search/filter across cities, users, posts using `mockCities`, `mockUsers`, store `posts`. Tabs: cities/users/trending.
  - `city-card.tsx`: City tile with rating and counts.
  - `user-card.tsx`: Follow/unfollow actions using store and helper checks (`isFollowing`, `hasPendingFollowRequest`).
  - `trending-posts.tsx`: Sorts posts by engagement; opens `profile/post-modal`.
- `components/map`
  - `map-page.tsx`: Map placeholder with positioned city pins from `mockCities`; sidebar with recent posts per selected city.
- `components/create`
  - `create-post.tsx`: Form to create a post; mock image upload picker; location from `mockCities`; calls `addPost` on store.
- `components/profile`
  - `profile-page.tsx`: Current user profile (cover, avatar, stats, tabs). Uses helpers for followers/following count and posts.
  - `post-grid.tsx`: Grid of user posts with engagement overlay; opens `post-modal`.
  - `post-modal.tsx`: Post details actions.
  - `visited-map.tsx`: Map placeholder + list of cities from the user’s posts; computes averages.
  - `ratings-list.tsx`: User’s rated posts sorted by rating.
- `components/messages`
  - `messages-page.tsx`: Conversation list and chat pane; search filter; selects `ChatWindow`.
  - `chat-window.tsx`: Local mock message history, send/typing simulation; marks conversation as read in store.
- `components/notifications`
  - `notifications-page.tsx`: Lists notifications for current user from store, mark read/all-read; basic follow request accept.
- `components/auth`
  - `auth-page.tsx`: Tabs for sign-in/sign-up; mock login sets `currentUser` to first mock user.
- `components/layout`
  - `top-navbar.tsx`: Brand, desktop search input only, notifications/messages buttons show counts.
  - `bottom-navigation.tsx`: Mobile nav tabs (home/discover/create/map/profile).
  - `main-layout.tsx`: Switches views by `activeTab`.
- `lib`
  - `types.ts`: Strong TypeScript models: `User`, `Post`, `Comment` (threading-ready), `Follow`, `Message`, `Conversation`, `Notification`, `City`.
  - `mock-data.ts`: Mock datasets + helper selectors (users, cities, posts, comments, follows, messages, conversations, notifications).
  - `store.ts`: Zustand store + `persist` with actions for likes, saves, comments, follows, notifications, conversations, tab state.
  - `utils.ts`: `cn` util.

Data mocking/fetching

- All data comes from `lib/mock-data.ts` and is injected into `lib/store.ts` as initial state.
- Some components bypass store-derived state and call helpers directly from `mock-data` (notably `comments-section.tsx`), creating divergence.
- No `fetch`, `react-query`, `SWR`, or server actions; no API boundaries.

### Quality and completeness evaluation

Routing and organization

- Uses a single route with tab switching via global state. This is fine for a prototype but will limit deep-linking, SEO, and proper data fetching.
- File organization is feature-oriented and clear. Naming is consistent (`kebab-case` for files, PascalCase exports).
- All major features exist as UI stubs with reasonable UX.

Feature coverage vs product spec

- **User profiles**: Current user profile only (`profile-page.tsx`). No dedicated routes for viewing other users (e.g., `/u/[username]`). No profile edit flow.
- **Follow/friend system**: Basic follow/unfollow and pending states in store; no real follow requests approval UX beyond notifications accept; no privacy-enforced gating of content.
- **Likes & threaded comments**: Like toggles exist. `Comment` type supports `replies`/`parentId`, but UI shows flat comments only; no reply threading, pagination, or load-on-demand.
- **Interactive map**: Presentational only; no real map (Leaflet/Mapbox/Google Maps) or geocoding; city positions are arbitrary CSS.
- **Notifications**: UI list and mark read/all read. No background delivery or real-time updates.
- **Direct messages**: UI works with local mock messages; no real-time or persistence; typing and responses are simulated.
- **Search/discover**: Client-side filter over mocks; no backend search, no ranking, no debounced queries.
- **Image upload**: Mock selection only in `create-post.tsx`; no real upload, processing, or storage.

Correctness and state issues

- **Comments source of truth mismatch**: `components/feed/comments-section.tsx` reads comments via `getMockCommentsForPost(postId)` from `lib/mock-data.ts`, but mutations go to `store.comments`. New comments/likes will not reflect because the displayed list isn’t derived from store state. This should be shifted to store or server state selectors.
- **Counts consistency**: `addComment` updates `posts.commentsCount` but `comments-section` doesn’t derive from that store slice; once moved to server state, keep counts in sync via backend or by aggregating on read.
- **Map city keying**: `map-page.tsx` sometimes keys by `city.nameAr` while mock posts use `location.city` set to Arabic names; ensure consistent keys when moving to backend data.

Performance

- All views are client components. No streaming/server components or partial SSR for faster TTFB.
- Lists (feed, trending, conversations, notifications) render fully with no pagination/virtualization. Fine for demo, but will not scale.
- Uses raw `<img>` tags instead of `next/image`, losing automatic optimization and responsive behavior.
- Persisting large arrays in Zustand to localStorage can bloat storage and slow hydration; treat post/comment/message data as server state.

Accessibility (a11y)

- Icon-only buttons often lack `aria-label` (e.g., like, save, share, close). Add labels for screen readers.
- Inputs have visible labels in places, but ensure all form controls are properly labeled.
- Color contrast appears reasonable; verify with tooling once themes are finalized.

Responsive design

- Tailwind classes show good responsive considerations (hidden/visible blocks for md+). Should test on small devices; feed cards and modals appear adaptable.

### Backend integration points and replacements

Replace mocks and store-managed server state with API calls/server actions and React Query. Concrete locations:

- **Auth**
  - `components/auth/auth-page.tsx` → replace mock sign-in/up with API: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`. Store `currentUser` from server, not local mock.
- **Users / Profiles**
  - `components/profile/profile-page.tsx` (current user) → fetch `GET /api/users/me`, user posts `GET /api/posts?userId=...`, counts from backend.
  - Add route/view for other profiles (e.g., `/u/[username]`) → `GET /api/users/:id|:username`.
- **Follows**
  - `components/discover/user-card.tsx`, `components/notifications/notifications-page.tsx` → replace helper checks and local actions with `POST /api/follows`, `DELETE /api/follows/:id`, `POST /api/follow-requests/:id/accept|reject`, `GET /api/follows?userId=...`.
- **Posts**
  - `components/feed/home-feed.tsx`, `components/discover/trending-posts.tsx`, `components/profile/post-grid.tsx` → `GET /api/posts` with pagination, sort; `POST /api/posts` on create.
- **Comments**
  - `components/feed/comments-section.tsx` → `GET /api/posts/:postId/comments` (paginated), `POST /api/posts/:postId/comments`, `POST /api/comments/:id/like`, and support threaded replies (`parentId`). Remove `getMockCommentsForPost` dependency.
- **Likes / Saves**
  - `post-card.tsx`, `post-modal.tsx` → `POST /api/posts/:id/like|unlike`, `POST /api/posts/:id/save|unsave`.
- **Notifications**
  - `notifications-page.tsx` → `GET /api/notifications?userId=...`, `POST /api/notifications/:id/read`, `POST /api/notifications/read-all`.
- **Messages / Conversations**
  - `messages-page.tsx`, `chat-window.tsx` → `GET /api/conversations`, `GET /api/conversations/:id/messages` (paginated), `POST /api/conversations/:id/messages`. Real-time delivery via WebSockets/Pusher.
- **Discover / Search**
  - `discover-page.tsx` → `GET /api/cities`, `GET /api/users?search=...`, `GET /api/posts?search=...`, trending endpoint with ranking.
- **Map / Places**
  - `map-page.tsx`, `visited-map.tsx` → `GET /api/cities` (with coordinates, counts), or derive from posts; adopt real map SDK.
- **Image upload**
  - `create-post.tsx` → upload to `POST /api/uploads` (GridFS or object storage), then `POST /api/posts` referencing file IDs/URLs.

Mock patterns to replace

- Direct imports from `lib/mock-data.ts` inside components (`discover-page`, `user-card`, `comments-section`, `create-post`, `map-page`). Replace with typed service functions that call real APIs (or server actions), and use React Query.
- Zustand store currently persists large server data arrays; keep only ephemeral UI state in Zustand (e.g., `activeTab`, modals). Treat posts/comments/messages/notifications as server state.

### Refactors and improvements (frontend)

1. Introduce an API/service layer

- Create `lib/api/client.ts` (fetch with base URL, auth header, error handling) and feature services: `lib/api/auth.ts`, `users.ts`, `posts.ts`, `comments.ts`, `follows.ts`, `messages.ts`, `notifications.ts`, `uploads.ts`.
- Centralize types in `lib/types.ts` and align with backend DTOs.

2. Adopt React Query (TanStack Query) for server state

- Wrap app with `QueryClientProvider`. Use queries/mutations throughout: feed, comments, follows, notifications, messages.
- Add optimistic updates for likes, follow, message send.

3. Routing

- Migrate tabs to real routes for deep-linking/SEO:
  - `/` (home feed), `/discover`, `/map`, `/create`, `/u/[username]`, `/messages`, `/notifications`.
- Keep mobile bottom nav but navigate via `next/link` rather than Zustand `activeTab`.

4. UI/Performance

- Replace `<img>` with `next/image` for all images.
- Add pagination/infinite scroll for feed, comments, messages, notifications; consider list virtualization for large lists.
- Add loading and error states per query; add `ErrorBoundary` and route-level loading templates.

5. Accessibility

- Add `aria-label` to icon-only buttons (like, save, share, close, phone, video, info, etc.).
- Ensure all inputs have associated labels.

6. Environment/config

- Add `.env.local` with `MONGODB_URI`, `JWT_SECRET`, `PUSHER_*`/`ABLY_*`, `NEXT_PUBLIC_*` vars as needed. Use `process.env` with Zod-based validation in a `lib/env.ts`.

7. State responsibilities

- Keep Zustand for UI state only (language, theme, active modal/tab if still needed). Move server-derived data to React Query.

8. Code hygiene

- Extract repeated UI fragments (e.g., verified badge) into small components.
- Add ESLint/Prettier configs if not yet present; run type-check in CI.

### Backend architecture (Next.js API + MongoDB + GridFS)

API design (App Router route handlers)

- Base under `app/api/*`:
  - `auth`: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
  - `users`: `GET /api/users/:id`, `GET /api/users?search=...`, `PATCH /api/users/:id` (profile update).
  - `follows`: `POST /api/follows`, `DELETE /api/follows/:id`, `GET /api/follows?userId=...`, `POST /api/follow-requests/:id/accept|reject`.
  - `posts`: `GET /api/posts`, `GET /api/posts/:id`, `POST /api/posts`, `DELETE /api/posts/:id`, `POST /api/posts/:id/like|unlike`, `POST /api/posts/:id/save|unsave`.
  - `comments`: `GET /api/posts/:postId/comments`, `POST /api/posts/:postId/comments`, `POST /api/comments/:id/like`.
  - `notifications`: `GET /api/notifications`, `POST /api/notifications/:id/read`, `POST /api/notifications/read-all`.
  - `conversations`: `GET /api/conversations`, `GET /api/conversations/:id/messages`, `POST /api/conversations/:id/messages`.
  - `uploads`: `POST /api/uploads` (multipart/form-data) → store to GridFS; returns file ID and URL.

Database and models (MongoDB + Mongoose)

- `User`
  - Fields: `_id`, `username` (unique), `email` (unique), `passwordHash`, `displayName`, `bio`, `avatarUrl`, `coverUrl`, `isPrivate`, `isVerified`, `interests[]`, `createdAt`.
  - Indexes: `username` (unique), `email` (unique), text index on `displayName`/`bio` for search.
- `Post`
  - Fields: `_id`, `userId` (ref User), `caption`, `imageUrl` or `imageFileId`, `location` { `name`, `city`, `coordinates` [lng, lat] }, `rating`, `hashtags[]`, `likesCount`, `commentsCount`, `createdAt`.
  - Indexes: `userId`, `createdAt` (desc), `hashtags`, 2dsphere on `location.coordinates`.
- `Comment`
  - Fields: `_id`, `postId` (ref Post), `userId` (ref User), `content`, `parentId` (nullable, ref Comment), `likesCount`, `createdAt`.
  - Indexes: `postId`, `parentId`, `createdAt`.
- `Follow`
  - Fields: `_id`, `followerId`, `followingId`, `status` (accepted|pending), `createdAt`.
  - Indexes: compound unique `(followerId, followingId)`, `status`.
- `Conversation`
  - Fields: `_id`, `participantIds[]`, `lastMessageId`, `updatedAt`.
  - Indexes: compound on `participantIds` (for membership queries), `updatedAt`.
- `Message`
  - Fields: `_id`, `conversationId`, `senderId`, `content`, `type` (text|image), `isReadBy[]`, `createdAt`.
  - Indexes: `conversationId`, `createdAt`.
- `Notification`
  - Fields: `_id`, `userId` (recipient), `type`, `fromUserId`, `postId?`, `message`, `isRead`, `createdAt`.
  - Indexes: `userId`, `isRead`, `createdAt`.
- `City` (optional seed)
  - Fields: `_id`, `name`, `nameAr`, `imageUrl`, `averageRating`, `postsCount`, `coordinates` [lng, lat].

Image storage

- Use **GridFS** buckets in MongoDB for images (`uploads` bucket). Alternative: object storage (S3/Cloudflare R2) with signed URLs for better scalability.

Authentication

- Custom email/password with **JWT**:
  - Register: hash with bcrypt, store `passwordHash`.
  - Login: verify, issue access token (short TTL) and refresh token (httpOnly cookie). Alternatively, use stateless JWT in cookies and rotate refresh tokens.
  - Middleware to protect API routes; `GET /api/auth/me` returns the current user from token.

Real-time messaging

- Prefer managed service (Pusher/Ably) for simplicity and reliability. Publish message events on `POST /api/conversations/:id/messages` to subscribed channels.
- Alternative: self-hosted WebSocket (Socket.IO) via a separate Node server; coordinate with Next.js deployment.

Caching and performance

- Use React Query caching for lists; paginate aggressively. Add server-side route handlers with database queries and lean projections.
- For feed and discover, consider prefetching and `staleTime` to balance freshness and performance.

### Actionable next steps

1. Routing: create real routes for each tab; migrate navigation from Zustand to `next/link`.
2. API layer: scaffold `app/api/*` route handlers; add `lib/db.ts` (Mongoose connection) and models.
3. Auth: implement register/login/me with JWT cookies; secure route handlers.
4. Posts: implement `GET/POST /api/posts` with pagination; switch `home-feed` to React Query.
5. Comments: implement endpoints; refactor `comments-section` to query/mutate; enable threaded replies.
6. Follows/notifications: implement endpoints; wire user-card and notifications page; enforce privacy on backend.
7. Messaging: implement conversations/messages endpoints; integrate Pusher/Ably for real-time delivery.
8. Uploads: implement `POST /api/uploads` (GridFS) and use in `create-post`.
9. Replace `<img>` with `next/image`; add loading/error states, aria-labels, and pagination.
10. Environment: add `.env.local` and `lib/env.ts` with Zod validation.

Notes on minimal refactor path

- Start by introducing the API/service layer and React Query without major UI rewrites.
- Gradually move features off mocks (posts → comments → follows → messages → notifications → uploads).
- Only after APIs are stable, migrate routing to multi-route pages to preserve UX during the transition.

### Known issues to fix early

- `comments-section.tsx`: derive comments from server/store query, not `getMockCommentsForPost`.
- Replace all direct imports from `lib/mock-data` in components with API hooks/services.
- Add `aria-label` to icon-only buttons across the app.
- Switch all images to `next/image` and ensure responsive sizes.

This review focuses on actionable integration steps to evolve the prototype into a production-ready app while preserving the current UX.
