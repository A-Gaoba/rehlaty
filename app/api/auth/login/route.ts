import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { verifyPassword } from '@/lib/auth/hash'
import { badRequest, unauthorized, serverError } from '@/lib/api/errors'
import { env } from '@/lib/env'
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'

const LoginSchema = z.object({
	emailOrUsername: z.string().min(1),
	password: z.string().min(8),
})

export async function POST(req: Request) {
	try {
		const json = await req.json()
		const parsed = LoginSchema.safeParse(json)
		if (!parsed.success) return badRequest('Invalid payload')

		await connectToDatabase()
		const query = parsed.data.emailOrUsername.includes('@')
			? { email: parsed.data.emailOrUsername }
			: { username: parsed.data.emailOrUsername }
		const user = await User.findOne(query)
		if (!user) return unauthorized('Invalid credentials')

		const ok = await verifyPassword(parsed.data.password, user.passwordHash)
		if (!ok) return unauthorized('Invalid credentials')

		const access = await signAccessToken({
			sub: user._id.toString(),
			username: user.username,
			displayName: user.displayName,
			isVerified: user.isVerified,
			isPrivate: user.isPrivate,
		})
		const refresh = await signRefreshToken({ sub: user._id.toString() })

		const cookie = `${env.NEXTAUTH_COOKIE_NAME}=${refresh}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}; ${env.NODE_ENV === 'production' ? 'Secure; ' : ''}`

		return new Response(
			JSON.stringify({
				accessToken: access,
				user: {
					id: user._id.toString(),
					email: user.email,
					username: user.username,
					displayName: user.displayName,
					isVerified: user.isVerified,
					isPrivate: user.isPrivate,
				},
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
			},
		)
	} catch (err) {
		return serverError('Failed to login')
	}
}


