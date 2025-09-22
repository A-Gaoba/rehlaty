import { apiFetch } from './client'

export type LoginInput = { emailOrUsername: string; password: string }
export type RegisterInput = { email: string; username: string; password: string; displayName: string }

export async function register(input: RegisterInput) {
	return await apiFetch<{ user: any }>(`/api/auth/register`, { method: 'POST', body: JSON.stringify(input) })
}

export async function login(input: LoginInput) {
	return await apiFetch<{ accessToken: string; user: any }>(`/api/auth/login`, {
		method: 'POST',
		body: JSON.stringify(input),
	})
}

export async function logout() {
	await apiFetch(`/api/auth/logout`, { method: 'POST' })
}

export async function me(accessToken?: string) {
	return await apiFetch<{ accessToken?: string; user: any }>(`/api/auth/me`, { method: 'GET', authToken: accessToken })
}


