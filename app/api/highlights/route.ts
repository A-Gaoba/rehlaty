import { connectToDatabase } from '@/lib/db'
import { Highlight } from '@/lib/models/Highlight'
import { getViewerIdFromRequest } from '@/lib/auth/permissions'
import { badRequest, serverError, unauthorized } from '@/lib/api/errors'
import { z } from 'zod'

export async function GET(req: Request) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) return badRequest('userId required')
    const items = await Highlight.find({ userId }).sort({ updatedAt: -1 }).lean()
    return Response.json({
      items: items.map((h) => ({
        id: h._id.toString(),
        title: h.title,
        cover: h.coverImageId ? `/api/uploads/${h.coverImageId}` : null,
      })),
    })
  } catch (e) {
    return serverError('Failed to fetch highlights')
  }
}

const CreateSchema = z.object({ title: z.string().min(1), coverImageId: z.string().optional() })
export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const me = await getViewerIdFromRequest(req)
    if (!me) return unauthorized('Not authenticated')
    const body = await req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) return badRequest('Invalid payload')
    const created = await Highlight.create({
      userId: me,
      title: parsed.data.title,
      coverImageId: parsed.data.coverImageId,
    })
    return Response.json({ id: created._id.toString() }, { status: 201 })
  } catch (e) {
    return serverError('Failed to create highlight')
  }
}
