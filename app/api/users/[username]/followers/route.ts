import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { Follow } from '@/lib/models/Follow'
import mongoose from 'mongoose'
import { badRequest, forbidden, notFound, serverError } from '@/lib/api/errors'
import { getViewerIdFromRequest, isFollowingAccepted } from '@/lib/auth/permissions'
import { UserBlock } from '@/lib/models/UserBlock'

export async function GET(req: Request, { params }: { params: { username: string } }) {
  try {
    await connectToDatabase()
    const owner = await User.findOne({ username: params.username }).lean()
    if (!owner) return notFound('User not found')

    const viewerId = await getViewerIdFromRequest(req)
    if (
      owner.isPrivate &&
      (!viewerId || !(await isFollowingAccepted(viewerId, owner._id.toString())))
    ) {
      return forbidden('Private account')
    }

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)
    const cursor = searchParams.get('cursor') || undefined
    const qstr = (searchParams.get('q') || '').trim()

    const query: any = { followingId: owner._id, status: 'accepted' }
    if (cursor) {
      try {
        query._id = { $lt: new mongoose.Types.ObjectId(cursor) }
      } catch {}
    }

    let items: any[] = await Follow.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate({
        path: 'followerId',
        model: User,
        select: 'username displayName avatarFileId isVerified',
      })
      .lean()

    if (qstr) {
      const rx = new RegExp(qstr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      items = items.filter(
        (f: any) =>
          rx.test(f.followerId?.username || '') || rx.test(f.followerId?.displayName || ''),
      )
    }

    let filteredItems: any[] = items
    if (viewerId) {
      const ids = items.map((f: any) => f.followerId._id)
      const blocks = await UserBlock.find({
        $or: [
          { blockerId: viewerId, blockedId: { $in: ids } },
          { blockerId: { $in: ids }, blockedId: viewerId },
        ],
      })
        .select('blockerId blockedId')
        .lean()
      const blockedSet = new Set(
        blocks.map((b: any) =>
          String(b.blockerId) === viewerId ? String(b.blockedId) : String(b.blockerId),
        ),
      )
      filteredItems = items.filter((f: any) => !blockedSet.has(f.followerId._id.toString()))
    }

    const hasMore = filteredItems.length > limit
    const slice = hasMore ? filteredItems.slice(0, limit) : filteredItems
    const nextCursor = hasMore ? slice[slice.length - 1]._id.toString() : null

    // Compute isFollowing relative to viewer (if logged in)
    let followMap: Record<string, boolean> = {}
    if (viewerId) {
      const ids = slice.map((f: any) => f.followerId._id)
      const rels = await Follow.find({
        followerId: viewerId,
        followingId: { $in: ids },
        status: 'accepted',
      })
        .select('followingId')
        .lean()
      followMap = Object.fromEntries(rels.map((r: any) => [r.followingId.toString(), true]))
    }

    return Response.json({
      items: slice.map((f: any) => ({
        id: f.followerId._id.toString(),
        username: f.followerId.username,
        displayName: f.followerId.displayName,
        avatar: f.followerId.avatarFileId
          ? `/api/uploads/${f.followerId.avatarFileId}`
          : '/placeholder-user.jpg',
        isVerified: f.followerId.isVerified,
        isFollowing: !!followMap[f.followerId._id.toString()],
      })),
      nextCursor,
    })
  } catch (e) {
    return serverError('Failed to fetch followers')
  }
}
