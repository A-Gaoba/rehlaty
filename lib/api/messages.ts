export async function listConversations() {
  return await fetch(`/api/conversations`, { credentials: 'include' }).then((r) => r.json())
}

export async function listMessages(conversationId: string, cursor?: string) {
  const qs = new URLSearchParams()
  if (cursor) qs.set('cursor', cursor)
  return await fetch(`/api/conversations/${conversationId}/messages?${qs.toString()}`, {
    credentials: 'include',
  }).then((r) => r.json())
}

export async function sendMessage(conversationId: string, content: string) {
  return await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content }),
  }).then((r) => r.json())
}
