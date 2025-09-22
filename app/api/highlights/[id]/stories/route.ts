import { connectToDatabase } from '@/lib/db'
import { Story } from '@/lib/models/Story'
import { Highlight } from '@/lib/models/Highlight'
import { getViewerIdFromRequest } from '@/lib/auth/permissions'
import { badRequest, notFound, serverError, unauthorized } from '@/lib/api/errors'
import { z } from 'zod'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const highlight = await Highlight.findById(params.id).lean()
    if (!highlight) return notFound('Highlight not found')
    const items = await Story.find({ highlightId: highlight._id }).sort({ createdAt: 1 }).lean()
    return Response.json({
      items: items.map((s) => ({
        id: s._id.toString(),
        image: `/api/uploads/${s.imageFileId}`,
        createdAt: s.createdAt,
      })),
    })
  } catch (e) {
    return serverError('Failed to fetch stories')
  }
}

const CreateSchema = z.object({ imageFileId: z.string().min(1) })
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const me = await getViewerIdFromRequest(req)
    if (!me) return unauthorized('Not authenticated')
    const highlight = await Highlight.findById(params.id)
    if (!highlight) return notFound('Highlight not found')
    if (highlight.userId.toString() !== me) return unauthorized('Not permitted')
    const body = await req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) return badRequest('Invalid payload')
    const created = await Story.create({
      highlightId: highlight._id,
      userId: me,
      imageFileId: parsed.data.imageFileId,
    })
    return Response.json({ id: created._id.toString() }, { status: 201 })
  } catch (e) {
    return serverError('Failed to create story')
  }
}
