import { connectToDatabase } from '@/lib/db'
import { getViewerIdFromRequest } from '@/lib/auth/permissions'
import { unauthorized, serverError } from '@/lib/api/errors'
import { UserBlock } from '@/lib/models/UserBlock'
import { User } from '@/lib/models/User'

export async function GET(req: Request) {
  try {
    await connectToDatabase()
    const me = await getViewerIdFromRequest(req)
    if (!me) return unauthorized('Not authenticated')
    const blocks = await UserBlock.find({ blockerId: me })
      .populate({ path: 'blockedId', model: User, select: 'username displayName avatarFileId' })
      .lean()
    return Response.json({
      items: blocks.map((b: any) => ({
        id: b.blockedId._id.toString(),
        username: b.blockedId.username,
        displayName: b.blockedId.displayName,
        avatar: b.blockedId.avatarFileId
          ? `/api/uploads/${b.blockedId.avatarFileId}`
          : '/placeholder-user.jpg',
      })),
    })
  } catch (e) {
    return serverError('Failed to fetch blocks')
  }
}
