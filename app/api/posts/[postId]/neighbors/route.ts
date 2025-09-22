import { connectToDatabase } from '@/lib/db'
import { Post } from '@/lib/models/Post'
import { User } from '@/lib/models/User'
import { UserBlock } from '@/lib/models/UserBlock'
import { getViewerIdFromRequest, isFollowingAccepted } from '@/lib/auth/permissions'
import { notFound, serverError } from '@/lib/api/errors'

async function canView(doc: any, viewerId: string | null): Promise<boolean> {
  const owner = doc.userId as any
  const isPrivate = owner?.isPrivate || owner?.privacy === 'private'
  if (!isPrivate) return true
  if (!viewerId) return false
  return await isFollowingAccepted(viewerId, owner._id.toString())
}

export async function GET(req: Request, { params }: { params: { postId: string } }) {
  try {
    await connectToDatabase()
    const viewerId = await getViewerIdFromRequest(req)
    const current = await Post.findById(params.postId)
      .populate({ path: 'userId', model: User, select: 'isPrivate privacy' })
      .lean()
    if (!current) return notFound('Post not found')

    // Block filtering
    let excludedUserIds: string[] = []
    if (viewerId) {
      const blocks = await UserBlock.find({
        $or: [{ blockerId: viewerId }, { blockedId: viewerId }],
      })
        .select('blockerId blockedId')
        .lean()
      for (const b of blocks) {
        const blocker = String(b.blockerId)
        const blocked = String(b.blockedId)
        excludedUserIds.push(blocker === viewerId ? blocked : blocker)
      }
    }

    // Find previous (older) post
    let prevId: string | null = null
    const prevCandidates = await Post.find({
      createdAt: { $lt: current.createdAt },
      ...(excludedUserIds.length ? { userId: { $nin: excludedUserIds } } : {}),
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({ path: 'userId', model: User, select: 'isPrivate privacy' })
      .lean()
    for (const p of prevCandidates) {
      if (await canView(p, viewerId)) {
        prevId = p._id.toString()
        break
      }
    }

    // Find next (newer) post
    let nextId: string | null = null
    const nextCandidates = await Post.find({
      createdAt: { $gt: current.createdAt },
      ...(excludedUserIds.length ? { userId: { $nin: excludedUserIds } } : {}),
    })
      .sort({ createdAt: 1 })
      .limit(10)
      .populate({ path: 'userId', model: User, select: 'isPrivate privacy' })
      .lean()
    for (const p of nextCandidates) {
      if (await canView(p, viewerId)) {
        nextId = p._id.toString()
        break
      }
    }

    return Response.json({ prevId, nextId })
  } catch (e) {
    return serverError('Failed to load neighbors')
  }
}
