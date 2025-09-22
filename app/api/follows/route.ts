import { connectToDatabase } from '@/lib/db'
import { Follow } from '@/lib/models/Follow'
import { User } from '@/lib/models/User'
import { Notification } from '@/lib/models/Notification'
import { badRequest, serverError, unauthorized } from '@/lib/api/errors'
import { getViewerIdFromRequest } from '@/lib/auth/permissions'

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const viewerId = await getViewerIdFromRequest(req)
    if (!viewerId) return unauthorized('Not authenticated')
    const json = await req.json()
    const { followingId } = json as { followingId: string }
    if (!followingId) return badRequest('followingId required')
    if (followingId === viewerId) return badRequest('Cannot follow yourself')
    const target = await User.findById(followingId)
    if (!target) return badRequest('User not found')
    const status = target.isPrivate ? 'pending' : 'accepted'
    const created = await Follow.findOneAndUpdate(
      { followerId: viewerId, followingId },
      { $setOnInsert: { followerId: viewerId, followingId, status } },
      { new: true, upsert: true },
    )
    if (status === 'pending') {
      await Notification.create({
        userId: target._id,
        type: 'follow_request',
        fromUserId: viewerId,
        message: 'طلب متابعة جديد',
        isRead: false,
      })
    } else {
      await Notification.create({
        userId: target._id,
        type: 'follow',
        fromUserId: viewerId,
        message: 'بدأ بمتابعتك',
        isRead: false,
      })
    }
    return Response.json(
      { follow: { id: created._id.toString(), status: created.status } },
      { status: 201 },
    )
  } catch (e) {
    return serverError('Failed to follow')
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase()
    const viewerId = await getViewerIdFromRequest(req)
    if (!viewerId) return unauthorized('Not authenticated')
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (id) {
      await Follow.deleteOne({ _id: id, followerId: viewerId })
      return new Response(null, { status: 204 })
    }
    // Fallback: allow unfollow by userId in JSON body
    let userId: string | undefined
    try {
      const body = await req.json()
      userId = body?.userId
    } catch {}
    if (!userId) return badRequest('id or userId required')
    await Follow.deleteOne({ followerId: viewerId, followingId: userId })
    return new Response(null, { status: 204 })
  } catch (e) {
    return serverError('Failed to unfollow')
  }
}
