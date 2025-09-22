# Social Post Detail Upgrade — Changelog

## Summary

Adds full Instagram-like post detail, likes listing, follow/unfollow toggle, and messaging entry from profiles. Links media to detail routes and scaffolds dynamic messages route.

## Backend

- `app/api/users/[username]/route.ts`
  - Returns `relationship` for viewer: `{ isFollowing, isPending, followId, canMessage }`.
- `app/api/conversations/route.ts`
  - Enforces messaging policy via `canMessage` before creating/returning a conversation.
- `app/api/posts/[postId]/likes/route.ts` (new)
  - `GET` paginated likes list with user minimal info.
- `app/api/posts/[postId]/route.ts`
  - DTO now includes `imageFileIds[]` for multi-image display on detail.

## Frontend

- Profile page `app/u/[username]/page.tsx`
  - Optimistic follow/unfollow with aria-pressed and pending state.
  - Message button: POST `/api/conversations` then navigate to `/messages/[conversationId]`, with blocked toast fallback.
  - Tabs a11y fixes and saved tab type corrections.
- Feed card `components/feed/post-card.tsx`
  - Wrap media and caption with `Link` to `/p/[postId]`.
- Profile grid `components/profile/post-grid.tsx`
  - Each tile links to `/p/[postId]`.
- Post detail `app/p/[postId]/page.tsx`
  - Carousel for multi-images, author header linking to profile, caption + hashtags, location snippet.
  - Likes list via `components/post/post-likes.tsx` (new).
  - Comments via existing `CommentsSection`.
  - OG/Twitter metadata preserved.
- Messages dynamic route `app/messages/[conversationId]/page.tsx` (new)
  - Loads `MessagesPage` to open chats directly by URL.

## A11y & UX

- Buttons have `aria-label` and pressed states.
- Carousel supports keyboard navigation (Arrow/Home/End) and focus ring.
- Toast on messaging blocked.

## Testing

- Follow/unfollow toggles immediately; pending shown for private.
- Message button navigates to conversation if allowed; shows toast otherwise.
- Clicking feed/profile media opens `/p/[postId]` with correct content.
- Likes list paginates; comments load and submit.

## Notes

- Saved tab is finite in this view; consider dedicated saved page for infinite scroll.
