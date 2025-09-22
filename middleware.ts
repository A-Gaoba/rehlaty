import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { env } from '@/lib/env'
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth/jwt'

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  try {
    const auth = req.headers.get('authorization')
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.slice(7)
      await verifyAccessToken(token)
      return true
    }
  } catch {}
  try {
    const cookieName = env.NEXTAUTH_COOKIE_NAME
    const token = req.cookies.get(cookieName)?.value
    if (!token) return false
    await verifyRefreshToken(token)
    return true
  } catch {}
  return false
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow these paths without auth
  const publicPrefixes = ['/auth', '/api', '/_next', '/favicon', '/public', '/leaflet']
  const publicExact = new Set(['/', '/about', '/contact'])
  if (publicExact.has(pathname) || publicPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const ok = await isAuthenticated(req)
  if (!ok) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|public/).*)'],
}
