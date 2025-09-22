import { connectToDatabase } from '@/lib/db'
import { Post } from '@/lib/models/Post'
import { PostLike } from '@/lib/models/PostLike'
import { Notification } from '@/lib/models/Notification'
import { serverError, notFound, unauthorized } from '@/lib/api/errors'
import { getViewerIdFromRequest } from '@/lib/auth/permissions'

export async function POST(req: Request, { params }: { params: { postId: string } }) {
  try {
    await connectToDatabase()
    const viewerId = await getViewerIdFromRequest(req)
    if (!viewerId) return unauthorized('Not authenticated')

    const post = await Post.findById(params.postId)
    if (!post) return notFound('Post not found')
    const existing = await PostLike.findOne({ postId: post._id, userId: viewerId })
    let isLiked: boolean
    if (existing) {
      await PostLike.deleteOne({ _id: existing._id })
      post.likesCount = Math.max(0, (post.likesCount || 0) - 1)
      isLiked = false
    } else {
      await PostLike.create({ postId: post._id, userId: viewerId })
      post.likesCount = (post.likesCount || 0) + 1
      isLiked = true
      if (post.userId.toString() !== viewerId) {
        await Notification.create({
          userId: post.userId,
          type: 'like',
          fromUserId: viewerId,
          postId: post._id,
          message: 'أعجب بمنشورك',
          isRead: false,
        })
      }
    }
    await post.save()
    return Response.json({ isLiked, likesCount: post.likesCount })
  } catch (e) {
    return serverError('Failed to toggle like')
  }
}
