import { connectToDatabase } from '@/lib/db'
import { getViewerIdFromRequest } from '@/lib/auth/permissions'
import { badRequest, notFound, serverError, unauthorized } from '@/lib/api/errors'
import { UserBlock } from '@/lib/models/UserBlock'
import { User } from '@/lib/models/User'

export async function POST(req: Request, { params }: { params: { username: string } }) {
  try {
    await connectToDatabase()
    const me = await getViewerIdFromRequest(req)
    if (!me) return unauthorized('Not authenticated')
    const targetUser = await User.findOne({ username: params.username }).lean()
    if (!targetUser) return notFound('User not found')
    if (targetUser._id.toString() === me) return badRequest('Invalid target')
    await UserBlock.deleteOne({ blockerId: me, blockedId: targetUser._id })
    return Response.json({ ok: true })
  } catch (e) {
    return serverError('Failed to unblock user')
  }
}
