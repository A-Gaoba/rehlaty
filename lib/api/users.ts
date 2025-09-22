import { apiFetch } from './client'

export async function getMe(accessToken?: string) {
	return await apiFetch<{ user: any }>(`/api/auth/me`, { authToken: accessToken })
}


