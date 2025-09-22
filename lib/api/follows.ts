export async function follow(followingId: string) {
  return await fetch(`/api/follows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ followingId }),
  }).then((r) => r.json())
}

export async function unfollow(followId: string) {
  return await fetch(`/api/follows?id=${encodeURIComponent(followId)}`, {
    method: 'DELETE',
    credentials: 'include',
  })
}

export async function unfollowByUserId(userId: string) {
  return await fetch(`/api/follows`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId }),
  })
}

export async function acceptFollowRequest(id: string) {
  return await fetch(`/api/follow-requests/${id}/accept`, {
    method: 'POST',
    credentials: 'include',
  }).then((r) => r.json())
}

export async function rejectFollowRequest(id: string) {
  return await fetch(`/api/follow-requests/${id}/reject`, {
    method: 'POST',
    credentials: 'include',
  })
}
