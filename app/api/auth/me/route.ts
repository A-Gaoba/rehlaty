import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { parseBearerToken, verifyAccessToken, verifyRefreshToken, signAccessToken } from '@/lib/auth/jwt'
import { env } from '@/lib/env'
import { unauthorized } from '@/lib/api/errors'

async function getTokensFromRequest(req: Request) {
	const authHeader = req.headers.get('authorization')
	const bearer = parseBearerToken(authHeader)
	const cookies = req.headers.get('cookie') || ''
	const refreshCookie = cookies
		.split(';')
		.map((c) => c.trim())
		.find((c) => c.startsWith(`${env.NEXTAUTH_COOKIE_NAME}=`))
	const refresh = refreshCookie ? refreshCookie.split('=')[1] : null
	return { bearer, refresh }
}

export async function GET(req: Request) {
	const { bearer, refresh } = await getTokensFromRequest(req)
	try {
		await connectToDatabase()
		if (bearer) {
			const payload = await verifyAccessToken(bearer)
			const user = await User.findById(payload.sub)
			if (!user) return unauthorized('User not found')
			return Response.json({
				user: {
					id: user._id.toString(),
					email: user.email,
					username: user.username,
					displayName: user.displayName,
					isVerified: user.isVerified,
					isPrivate: user.isPrivate,
				},
			})
		}
		if (refresh) {
			const refreshPayload = await verifyRefreshToken(refresh)
			const user = await User.findById(refreshPayload.sub)
			if (!user) return unauthorized('User not found')
			const access = await signAccessToken({
				sub: user._id.toString(),
				username: user.username,
				displayName: user.displayName,
				isVerified: user.isVerified,
				isPrivate: user.isPrivate,
			})
			return Response.json({
				accessToken: access,
				user: {
					id: user._id.toString(),
					email: user.email,
					username: user.username,
					displayName: user.displayName,
					isVerified: user.isVerified,
					isPrivate: user.isPrivate,
				},
			})
		}
		return unauthorized('Not authenticated')
	} catch {
		return unauthorized('Invalid or expired token')
	}
}


