export async function searchUsers(q: string) {
  const qs = new URLSearchParams({ q });
  return await fetch(`/api/search/users?${qs.toString()}`, {
    credentials: "include",
  }).then((r) => r.json());
}

export async function searchPosts(opts: {
  q?: string;
  city?: string;
  tag?: string;
  cursor?: string;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (opts.q) qs.set("q", opts.q);
  if (opts.city) qs.set("city", opts.city);
  if (opts.tag) qs.set("tag", opts.tag);
  if (opts.cursor) qs.set("cursor", opts.cursor);
  if (opts.limit) qs.set("limit", String(opts.limit));
  return await fetch(`/api/search/posts?${qs.toString()}`, {
    credentials: "include",
  }).then((r) => r.json());
}

export async function topDestinations(period = "7d") {
  const qs = new URLSearchParams({ period });
  return await fetch(`/api/destinations/top?${qs.toString()}`, {
    credentials: "include",
  }).then((r) => r.json());
}
