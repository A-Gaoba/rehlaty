import { apiFetch } from "./client";

export type ListPostsResponse = { items: any[]; nextCursor: string | null };
export async function listPosts(cursor?: string, limit = 10) {
	const qs = new URLSearchParams()
	if (cursor) qs.set('cursor', cursor)
	if (limit) qs.set('limit', String(limit))
	return await apiFetch<ListPostsResponse>(`/api/posts?${qs.toString()}`)
}

export async function getPost(id: string) {
	return await apiFetch<{ post: any }>(`/api/posts/${id}`)
}

export async function createPost(input: {
	caption: string
	imageFileId: string
	location: { name: string; city: string; coordinates: [number, number] }
	rating: number
}) {
	return await apiFetch<{ post: any }>(`/api/posts`, {
		method: 'POST',
		body: JSON.stringify(input),
	})
}

export async function likePost(id: string) {
	return await apiFetch<{ likesCount: number }>(`/api/posts/${id}/like`, { method: 'POST' })
}

export async function unlikePost(id: string) {
	return await apiFetch<{ likesCount: number }>(`/api/posts/${id}/unlike`, { method: 'POST' })
}
