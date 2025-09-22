import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { Follow } from '@/lib/models/Follow'
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

    const q: any = { followerId: owner._id, status: 'accepted' }
    if (cursor) q._id = { $lt: cursor }

    const pipeline: any[] = [
      { $match: q },
      { $sort: { _id: -1 } },
      { $limit: limit + 1 },
      {
        $lookup: {
          from: 'users',
          localField: 'followingId',
          foreignField: '_id',
          as: 'followingId',
        },
      },
      { $unwind: '$followingId' },
    ]
    if (qstr) {
      const rx = new RegExp(qstr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      pipeline.push({
        $match: { $or: [{ 'followingId.username': rx }, { 'followingId.displayName': rx }] },
      })
    }
    const items = await Follow.aggregate(pipeline)

    let filteredItems: any[] = items
    if (viewerId) {
      const ids = items.map((f: any) => f.followingId._id)
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
      filteredItems = items.filter((f: any) => !blockedSet.has(f.followingId._id.toString()))
    }

    const hasMore = filteredItems.length > limit
    const slice = hasMore ? filteredItems.slice(0, -1) : filteredItems
    const nextCursor = hasMore ? slice[slice.length - 1]._id.toString() : null

    // Compute isFollowing relative to viewer (if logged in)
    let followMap: Record<string, boolean> = {}
    if (viewerId) {
      const ids = slice.map((f: any) => f.followingId._id)
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
        id: f.followingId._id.toString(),
        username: f.followingId.username,
        displayName: f.followingId.displayName,
        avatar: f.followingId.avatarFileId
          ? `/api/uploads/${f.followingId.avatarFileId}`
          : '/placeholder-user.jpg',
        isVerified: f.followingId.isVerified,
        isFollowing: !!followMap[f.followingId._id.toString()],
      })),
      nextCursor,
    })
  } catch (e) {
    return serverError('Failed to fetch following')
  }
}
