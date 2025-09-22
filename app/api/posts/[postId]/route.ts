import { connectToDatabase } from '@/lib/db'
import { Post } from '@/lib/models/Post'
import { User } from '@/lib/models/User'
import { serverError, notFound, forbidden } from '@/lib/api/errors'
import { getViewerIdFromRequest, isFollowingAccepted } from '@/lib/auth/permissions'
import { PostLike } from '@/lib/models/PostLike'

async function toClientPost(doc: any, viewerId: string | null) {
  let isLiked = false
  if (viewerId) {
    try {
      const liked = await PostLike.findOne({ postId: doc._id, userId: viewerId }).lean()
      isLiked = !!liked
    } catch {}
  }
  return {
    id: doc._id.toString(),
    userId: doc.userId?._id?.toString?.() || doc.userId?.toString?.(),
    user: doc.userId
      ? {
          id: doc.userId._id.toString(),
          username: doc.userId.username,
          displayName: doc.userId.displayName,
          avatar: '/placeholder-user.jpg',
          bio: '',
          coverPhoto: '/placeholder.jpg',
          isPrivate: doc.userId.isPrivate,
          isVerified: doc.userId.isVerified,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          joinedAt: new Date(doc.userId.createdAt || Date.now()).toISOString(),
          interests: [],
        }
      : undefined,
    caption: doc.caption,
    image: doc.imageFileId ? `/api/uploads/${doc.imageFileId.toString()}` : '/placeholder.svg',
    location: doc.location,
    rating: doc.rating,
    likesCount: doc.likesCount,
    commentsCount: doc.commentsCount,
    isLiked,
    isSaved: false,
    createdAt: doc.createdAt.toISOString(),
    hashtags: doc.hashtags || [],
  }
}

export async function GET(req: Request, { params }: { params: { postId: string } }) {
  try {
    await connectToDatabase()
    const viewerId = await getViewerIdFromRequest(req)
    const post = await Post.findById(params.postId).populate({
      path: 'userId',
      model: User,
      select: 'username displayName isPrivate isVerified createdAt',
    })
    if (!post) return notFound('Post not found')
    const owner: any = post.userId
    if (owner?.isPrivate) {
      if (!viewerId) return forbidden('Private account')
      const allowed = await isFollowingAccepted(viewerId, owner._id.toString())
      if (!allowed) return forbidden('Private account')
    }
    const client = await toClientPost(post, viewerId)
    return Response.json({ post: client })
  } catch (e) {
    return serverError('Failed to fetch post')
  }
}
