import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { Post } from '@/lib/models/Post'
import { Follow } from '@/lib/models/Follow'
import { forbidden, notFound, serverError } from '@/lib/api/errors'
import { getViewerIdFromRequest, isFollowingAccepted, canMessage } from '@/lib/auth/permissions'

export async function GET(_req: Request, { params }: { params: { username: string } }) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ username: params.username }).lean()
    if (!user) return notFound('User not found')
    const viewerId = await getViewerIdFromRequest(_req)
    // Enforce privacy for private accounts
    if (user.isPrivate || user.privacy === 'private') {
      if (!viewerId || !(await isFollowingAccepted(viewerId, user._id.toString()))) {
        return forbidden('Private account')
      }
    }

    const [followers, following] = await Promise.all([
      Follow.countDocuments({ followingId: user._id, status: 'accepted' }),
      Follow.countDocuments({ followerId: user._id, status: 'accepted' }),
    ])

    const posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 }).limit(48).lean()

    // Relationship with viewer
    let relationship: {
      isFollowing: boolean
      isPending: boolean
      followId: string | null
      canMessage: boolean
    } = {
      isFollowing: false,
      isPending: false,
      followId: null,
      canMessage: false,
    }
    if (viewerId && user._id.toString() !== viewerId) {
      const rel = await Follow.findOne({ followerId: viewerId, followingId: user._id }).lean()
      if (rel) {
        relationship.isFollowing = rel.status === 'accepted'
        relationship.isPending = rel.status === 'pending'
        // @ts-ignore
        relationship.followId = rel._id?.toString?.() || null
      }
      relationship.canMessage = await canMessage(viewerId, user._id.toString())
    }

    return Response.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        bio: user.bio || '',
        bioLinks: user.bioLinks || [],
        birthday: user.birthday || null,
        avatar: user.avatarFileId ? `/api/uploads/${user.avatarFileId}` : '/placeholder-user.jpg',
        coverPhoto: user.coverFileId ? `/api/uploads/${user.coverFileId}` : '/placeholder.jpg',
        isPrivate: user.isPrivate || user.privacy === 'private',
        isVerified: user.isVerified,
        socialLinks: user.socialLinks || {},
        followersCount: followers,
        followingCount: following,
        joinedAt: user.createdAt,
        interests: user.interests || [],
      },
      posts: posts.map((p) => ({
        id: p._id.toString(),
        caption: p.caption,
        image: p.imageFileId ? `/api/uploads/${p.imageFileId}` : '/placeholder.svg',
        rating: p.rating,
        createdAt: p.createdAt,
      })),
      relationship,
    })
  } catch (e) {
    return serverError('Failed to fetch profile')
  }
}
