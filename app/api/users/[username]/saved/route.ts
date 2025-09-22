import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { PostSave } from '@/lib/models/PostSave'
import { Post } from '@/lib/models/Post'
import { notFound, serverError } from '@/lib/api/errors'

export async function GET(_req: Request, { params }: { params: { username: string } }) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ username: params.username }).lean()
    if (!user) return notFound('User not found')
    const saves = await PostSave.find({ userId: user._id }).sort({ createdAt: -1 }).lean()
    const ids = saves.map((s) => s.postId)
    const posts = await Post.find({ _id: { $in: ids } })
      .sort({ createdAt: -1 })
      .lean()
    return Response.json({
      items: posts.map((p) => ({
        id: p._id.toString(),
        image: p.imageFileIds?.[0]
          ? `/api/uploads/${p.imageFileIds[0]}`
          : p.imageFileId
            ? `/api/uploads/${p.imageFileId}`
            : '/placeholder.svg',
        caption: p.caption,
        createdAt: p.createdAt,
      })),
    })
  } catch (e) {
    return serverError('Failed to fetch saved posts')
  }
}
