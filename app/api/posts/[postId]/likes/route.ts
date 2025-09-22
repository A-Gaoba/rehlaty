import { connectToDatabase } from '@/lib/db'
import { PostLike } from '@/lib/models/PostLike'
import { User } from '@/lib/models/User'
import { badRequest, serverError } from '@/lib/api/errors'

export async function GET(req: Request, { params }: { params: { postId: string } }) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)
    const cursor = searchParams.get('cursor')

    const query: any = { postId: params.postId }
    if (cursor) {
      const cursorDate = new Date(cursor)
      if (Number.isNaN(cursorDate.getTime())) return badRequest('Invalid cursor')
      query.createdAt = { $lt: cursorDate }
    }

    const likes = await PostLike.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate({
        path: 'userId',
        model: User,
        select: 'username displayName isVerified avatarFileId createdAt',
      })
      .lean()

    const hasMore = likes.length > limit
    const items = hasMore ? likes.slice(0, limit) : likes
    const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null

    return Response.json({
      items: items.map((l: any) => ({
        id: l.userId?._id?.toString?.() || '',
        username: l.userId?.username,
        displayName: l.userId?.displayName,
        isVerified: !!l.userId?.isVerified,
        avatar: l.userId?.avatarFileId
          ? `/api/uploads/${l.userId.avatarFileId}`
          : '/placeholder-user.jpg',
      })),
      nextCursor,
    })
  } catch (e) {
    return serverError('Failed to fetch likes')
  }
}
