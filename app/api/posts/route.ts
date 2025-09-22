import { connectToDatabase } from '@/lib/db'
import { Post } from '@/lib/models/Post'
import { User } from '@/lib/models/User'
import { z } from 'zod'
import { badRequest, serverError, unauthorized } from '@/lib/api/errors'
import { getViewerIdFromRequest, isFollowingAccepted } from '@/lib/auth/permissions'
import { PostLike } from '@/lib/models/PostLike'
import { UserBlock } from '@/lib/models/UserBlock'
import {
  parseBearerToken,
  signAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/auth/jwt'
import { env } from '@/lib/env'

async function toClientPostWithLike(doc: any, viewerId: string | null) {
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

async function getAuthUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('authorization')
  const bearer = parseBearerToken(authHeader)
  const cookies = req.headers.get('cookie') || ''
  const refreshCookie = cookies
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${env.NEXTAUTH_COOKIE_NAME}=`))
  const refresh = refreshCookie ? refreshCookie.split('=')[1] : null
  try {
    if (bearer) {
      const payload = await verifyAccessToken(bearer)
      return payload.sub as string
    }
    if (refresh) {
      const payload = await verifyRefreshToken(refresh)
      return payload.sub as string
    }
    return null
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  try {
    await connectToDatabase()
    const viewerId = await getViewerIdFromRequest(req)
    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50)
    const taggedUserId = searchParams.get('taggedUserId')

    const query: any = {}
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) }
    }
    if (taggedUserId) {
      query.taggedUserIds = taggedUserId
    }

    let items = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate({
        path: 'userId',
        model: User,
        select: 'username displayName isPrivate isVerified createdAt',
      })
      .lean()

    // Privacy filter: hide private user posts if viewer not accepted
    if (viewerId) {
      const filtered: any[] = []
      const ownerIds = items.map((doc: any) => doc.userId?._id).filter(Boolean)
      const blocks = await UserBlock.find({
        $or: [
          { blockerId: viewerId, blockedId: { $in: ownerIds } },
          { blockerId: { $in: ownerIds }, blockedId: viewerId },
        ],
      })
        .select('blockerId blockedId')
        .lean()
      const blockedSet = new Set(
        blocks.map((b: any) =>
          String(b.blockerId) === viewerId ? String(b.blockedId) : String(b.blockerId),
        ),
      )
      for (const doc of items) {
        const owner = doc.userId
        const isPrivate = !!(owner?.isPrivate || owner?.privacy === 'private')
        if (owner?._id && blockedSet.has(owner._id.toString())) continue
        if (!isPrivate) {
          filtered.push(doc)
          continue
        }
        if (owner._id && (await isFollowingAccepted(viewerId, owner._id.toString()))) {
          filtered.push(doc)
        }
      }
      items = filtered
    } else {
      items = items.filter(
        (doc: any) => !(doc.userId?.isPrivate || doc.userId?.privacy === 'private'),
      )
    }

    const hasMore = items.length > limit
    const sliced = hasMore ? items.slice(0, limit) : items
    const nextCursor = hasMore ? sliced[sliced.length - 1].createdAt.toISOString() : null

    const mapped = [] as any[]
    for (const it of sliced) {
      mapped.push(await toClientPostWithLike(it, viewerId))
    }
    return Response.json({ items: mapped, nextCursor })
  } catch (e) {
    return serverError('Failed to fetch posts')
  }
}

const CreateSchema = z.object({
  caption: z.string().min(1),
  imageFileId: z.string().min(1).optional(),
  imageFileIds: z.array(z.string().min(1)).min(1).optional(),
  location: z.object({
    name: z.string().min(1),
    city: z.string().min(1),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  rating: z.number().min(1).max(5),
})

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const userId = await getAuthUserId(req)
    if (!userId) return unauthorized('Not authenticated')
    const json = await req.json()
    const parsed = CreateSchema.safeParse(json)
    if (!parsed.success) return badRequest('Invalid payload')
    const created = await Post.create({
      userId,
      caption: parsed.data.caption,
      imageFileId: parsed.data.imageFileId,
      imageFileIds:
        parsed.data.imageFileIds || (parsed.data.imageFileId ? [parsed.data.imageFileId] : []),
      location: parsed.data.location,
      rating: parsed.data.rating,
      hashtags: [],
      likesCount: 0,
      commentsCount: 0,
    })
    const populated = await created.populate({
      path: 'userId',
      model: User,
      select: 'username displayName isPrivate isVerified createdAt',
    })
    return Response.json({ post: toClientPost(populated) }, { status: 201 })
  } catch (e) {
    return serverError('Failed to create post')
  }
}
