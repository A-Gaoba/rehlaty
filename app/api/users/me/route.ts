import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { Post } from '@/lib/models/Post'
import { Follow } from '@/lib/models/Follow'
import { z } from 'zod'
import { badRequest, serverError, unauthorized } from '@/lib/api/errors'
import { getViewerIdFromRequest } from '@/lib/auth/permissions'

const PatchSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  bio: z.string().max(280).optional(),
  bioLinks: z.array(z.string().url()).max(5).optional(),
  privacy: z.enum(['public', 'private']).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(5).max(20).optional(),
  notificationPrefs: z
    .object({
      likes: z.boolean().optional(),
      comments: z.boolean().optional(),
      follows: z.boolean().optional(),
      messages: z.boolean().optional(),
    })
    .optional(),
  birthday: z.string().datetime().optional(),
  avatarFileId: z.string().optional(),
  coverFileId: z.string().optional(),
  socialLinks: z
    .object({
      instagram: z.string().url().or(z.string().min(1)).optional(),
      snapchat: z.string().url().or(z.string().min(1)).optional(),
      twitter: z.string().url().or(z.string().min(1)).optional(),
      tiktok: z.string().url().or(z.string().min(1)).optional(),
      website: z.string().url().or(z.string().min(1)).optional(),
    })
    .optional(),
})

export async function PATCH(req: Request) {
  try {
    await connectToDatabase()
    const userId = await getViewerIdFromRequest(req)
    if (!userId) return unauthorized('Not authenticated')

    const body = await req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) return badRequest('Invalid payload')
    const update: any = {}
    if (parsed.data.displayName !== undefined) update.displayName = parsed.data.displayName
    if (parsed.data.username !== undefined) update.username = parsed.data.username
    if (parsed.data.bio !== undefined) update.bio = parsed.data.bio
    if (parsed.data.bioLinks !== undefined) update.bioLinks = parsed.data.bioLinks
    if (parsed.data.privacy !== undefined) update.privacy = parsed.data.privacy
    if (parsed.data.contactEmail !== undefined) update.contactEmail = parsed.data.contactEmail
    if (parsed.data.contactPhone !== undefined) update.contactPhone = parsed.data.contactPhone
    if (parsed.data.notificationPrefs !== undefined)
      update.notificationPrefs = { ...parsed.data.notificationPrefs }
    if (parsed.data.avatarFileId) update.avatarFileId = parsed.data.avatarFileId
    if (parsed.data.coverFileId) update.coverFileId = parsed.data.coverFileId
    if (parsed.data.birthday) update.birthday = new Date(parsed.data.birthday)
    if (parsed.data.socialLinks) {
      const toUrl = (val?: string, kind?: 'ig' | 'sc' | 'tw' | 'tt' | 'web') => {
        if (!val) return undefined
        const v = String(val).trim()
        if (!v) return undefined
        const hasProtocol = /^https?:\/\//i.test(v)
        const stripAt = v.replace(/^@/, '')
        if (kind === 'ig') return hasProtocol ? v : `https://instagram.com/${stripAt}`
        if (kind === 'sc') return hasProtocol ? v : `https://snapchat.com/add/${stripAt}`
        if (kind === 'tw') {
          if (hasProtocol) return v
          // accept twitter.com or x.com without protocol
          if (/^(twitter\.com|x\.com)\//i.test(stripAt)) return `https://${stripAt}`
          return `https://x.com/${stripAt}`
        }
        if (kind === 'tt')
          return hasProtocol
            ? v
            : stripAt.startsWith('tiktok.com')
              ? `https://${stripAt}`
              : `https://tiktok.com/@${stripAt}`
        // website: add protocol if missing
        return hasProtocol ? v : `https://${v}`
      }
      const s = parsed.data.socialLinks
      update.socialLinks = {
        instagram: toUrl(s.instagram, 'ig'),
        snapchat: toUrl(s.snapchat, 'sc'),
        twitter: toUrl(s.twitter, 'tw'),
        tiktok: toUrl(s.tiktok, 'tt'),
        website: toUrl(s.website, 'web'),
      }
    }

    const saved = await User.findByIdAndUpdate(userId, update, { new: true, lean: true })
    return Response.json({ ok: true, user: saved })
  } catch (e) {
    return serverError('Failed to update profile')
  }
}

export async function GET(req: Request) {
  try {
    await connectToDatabase()
    const userId = await getViewerIdFromRequest(req)
    if (!userId) return unauthorized('Not authenticated')

    const user = await User.findById(userId).lean()
    if (!user) return unauthorized('Not authenticated')

    const [followers, following] = await Promise.all([
      Follow.countDocuments({ followingId: user._id, status: 'accepted' }),
      Follow.countDocuments({ followerId: user._id, status: 'accepted' }),
    ])

    const posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 }).limit(48).lean()

    return Response.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        bio: user.bio || '',
        birthday: user.birthday || null,
        avatar: user.avatarFileId ? `/api/uploads/${user.avatarFileId}` : '/placeholder-user.jpg',
        coverPhoto: user.coverFileId ? `/api/uploads/${user.coverFileId}` : '/placeholder.jpg',
        isPrivate: user.isPrivate,
        isVerified: user.isVerified,
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
    })
  } catch (e) {
    return serverError('Failed to fetch profile')
  }
}
