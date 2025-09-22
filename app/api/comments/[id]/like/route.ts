import { connectToDatabase } from '@/lib/db'
import { Comment } from '@/lib/models/Comment'
import { serverError, notFound, unauthorized } from '@/lib/api/errors'
import { env } from '@/lib/env'
import { parseBearerToken, verifyAccessToken, verifyRefreshToken } from '@/lib/auth/jwt'

export async function POST(req: Request, { params }: { params: { id: string } }) {
	try {
		await connectToDatabase()
		const authHeader = req.headers.get('authorization')
		const bearer = parseBearerToken(authHeader)
		const cookies = req.headers.get('cookie') || ''
		const refreshCookie = cookies
			.split(';')
			.map((c) => c.trim())
			.find((c) => c.startsWith(`${env.NEXTAUTH_COOKIE_NAME}=`))
		const refresh = refreshCookie ? refreshCookie.split('=')[1] : null
		if (!bearer && !refresh) return unauthorized('Not authenticated')
		if (bearer) await verifyAccessToken(bearer)
		if (!bearer && refresh) await verifyRefreshToken(refresh)

		const comment = await Comment.findById(params.id)
		if (!comment) return notFound('Comment not found')
		comment.likesCount = Math.max(0, comment.likesCount + 1)
		await comment.save()
		return Response.json({ likesCount: comment.likesCount })
	} catch (e) {
		return serverError('Failed to like comment')
	}
}


