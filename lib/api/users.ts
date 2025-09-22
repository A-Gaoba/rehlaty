import { apiFetch } from './client'

export async function getMe(accessToken?: string) {
  return await apiFetch<{ user: any }>(`/api/auth/me`, {
    authToken: accessToken,
  })
}

export async function listFollowers(username: string, cursor?: string, limit = 20, q?: string) {
  const qs = new URLSearchParams()
  if (cursor) qs.set('cursor', cursor)
  if (limit) qs.set('limit', String(limit))
  if (q) qs.set('q', q)
  return await apiFetch<{ items: any[]; nextCursor: string | null }>(
    `/api/users/${username}/followers?${qs.toString()}`,
  )
}

export async function listFollowing(username: string, cursor?: string, limit = 20, q?: string) {
  const qs = new URLSearchParams()
  if (cursor) qs.set('cursor', cursor)
  if (limit) qs.set('limit', String(limit))
  if (q) qs.set('q', q)
  return await apiFetch<{ items: any[]; nextCursor: string | null }>(
    `/api/users/${username}/following?${qs.toString()}`,
  )
}
