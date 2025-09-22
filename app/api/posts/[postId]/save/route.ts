import { connectToDatabase } from '@/lib/db'
import { PostSave } from '@/lib/models/PostSave'
import { getViewerIdFromRequest } from '@/lib/auth/permissions'
import { notFound, serverError, unauthorized } from '@/lib/api/errors'
import { Post } from '@/lib/models/Post'

export async function POST(req: Request, { params }: { params: { postId: string } }) {
  try {
    await connectToDatabase()
    const me = await getViewerIdFromRequest(req)
    if (!me) return unauthorized('Not authenticated')
    const post = await Post.findById(params.postId)
    if (!post) return notFound('Post not found')
    const existing = await PostSave.findOne({ userId: me, postId: post._id })
    if (existing) {
      await PostSave.deleteOne({ _id: existing._id })
      return Response.json({ saved: false })
    }
    await PostSave.create({ userId: me, postId: post._id })
    return Response.json({ saved: true })
  } catch (e) {
    return serverError('Failed to toggle save')
  }
}
