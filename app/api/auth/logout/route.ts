import { env } from '@/lib/env'

export async function POST() {
	const cookie = `${env.NEXTAUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${env.NODE_ENV === 'production' ? 'Secure; ' : ''}`
	return new Response(null, { status: 204, headers: { 'Set-Cookie': cookie } })
}


