export type ListCommentsResponse = { items: any[]; nextCursor: string | null }
export async function listComments(postId: string, opts?: { cursor?: string; limit?: number; parentId?: string }) {
	const qs = new URLSearchParams()
	if (opts?.cursor) qs.set('cursor', opts.cursor)
	if (opts?.limit) qs.set('limit', String(opts.limit))
	if (opts?.parentId) qs.set('parentId', opts.parentId)
	return await fetch(`/api/posts/${postId}/comments?${qs.toString()}`, { credentials: 'include' }).then((r) => r.json())
}

export async function createComment(postId: string, input: { content: string; parentId?: string }) {
	return await fetch(`/api/posts/${postId}/comments`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(input),
	}).then((r) => r.json())
}

export async function likeComment(id: string) {
	return await fetch(`/api/comments/${id}/like`, { method: 'POST', credentials: 'include' }).then((r) => r.json())
}

