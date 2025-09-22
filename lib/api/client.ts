export class ApiError extends Error {
  code: number
  constructor(message: string, code: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

function getBaseUrl() {
  if (typeof window === 'undefined')
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return ''
}

const tokenKey = 'access_token'
function getToken(): string | null {
  try {
    return localStorage.getItem(tokenKey)
  } catch {
    return null
  }
}
function setToken(t: string | null) {
  try {
    t ? localStorage.setItem(tokenKey, t) : localStorage.removeItem(tokenKey)
  } catch {}
}

let refreshing: Promise<string | null> | null = null
async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing
  refreshing = (async () => {
    const res = await fetch(`${getBaseUrl()}/api/auth/me`, { credentials: 'include' })
    if (!res.ok) return null
    const data = await res.json()
    if (data?.accessToken) {
      setToken(data.accessToken)
      return data.accessToken
    }
    return null
  })().finally(() => {
    refreshing = null
  })
  return refreshing
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const url = `${getBaseUrl()}${path}`
  const headers = new Headers({ 'Content-Type': 'application/json', ...(init.headers || {}) })
  const token = typeof window !== 'undefined' ? getToken() : null
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res = await fetch(url, { ...init, headers, credentials: 'include' })
  if (res.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      headers.set('Authorization', `Bearer ${refreshed}`)
      res = await fetch(url, { ...init, headers, credentials: 'include' })
    }
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : await res.text()
  if (!res.ok) {
    const message = isJson && (data as any)?.error ? (data as any).error : res.statusText
    throw new ApiError(message, res.status)
  }
  return data as T
}

export function storeToken(token: string) {
  setToken(token)
}
export function clearToken() {
  setToken(null)
}
