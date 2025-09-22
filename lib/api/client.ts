import { env } from '@/lib/env'

export class ApiError extends Error {
	code: number
	constructor(message: string, code: number) {
		super(message)
		this.name = 'ApiError'
		this.code = code
	}
}

function getBaseUrl() {
	if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
	return ''
}

export async function apiFetch<T>(path: string, init?: RequestInit & { authToken?: string }) {
	const url = `${getBaseUrl()}${path}`
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...(init?.headers || {}),
	}
	if (init?.authToken) headers['Authorization'] = `Bearer ${init.authToken}`

	const res = await fetch(url, { ...init, headers, credentials: 'include' })
	const isJson = res.headers.get('content-type')?.includes('application/json')
	const data = isJson ? await res.json() : await res.text()
	if (!res.ok) {
		const message = isJson && data?.error ? data.error : res.statusText
		throw new ApiError(message, res.status)
	}
	return data as T
}


