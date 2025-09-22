import { connectToDatabase } from '@/lib/db'
import { Post } from '@/lib/models/Post'
import { User } from '@/lib/models/User'
import { serverError, notFound } from '@/lib/api/errors'

function toClientPost(doc: any) {
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
		image: '/placeholder.svg',
		location: doc.location,
		rating: doc.rating,
		likesCount: doc.likesCount,
		commentsCount: doc.commentsCount,
		isLiked: false,
		isSaved: false,
		createdAt: doc.createdAt.toISOString(),
		hashtags: doc.hashtags || [],
	}
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
	try {
		await connectToDatabase()
		const post = await Post.findById(params.id).populate({ path: 'userId', model: User, select: 'username displayName isPrivate isVerified createdAt' })
		if (!post) return notFound('Post not found')
		return Response.json({ post: toClientPost(post) })
	} catch (e) {
		return serverError('Failed to fetch post')
	}
}

// Like/unlike handled in nested routes


