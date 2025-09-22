import { connectToDatabase } from '@/lib/db'
import { Highlight } from '@/lib/models/Highlight'
import { getViewerIdFromRequest } from '@/lib/auth/permissions'
import { badRequest, notFound, serverError, unauthorized } from '@/lib/api/errors'
import { z } from 'zod'

const PatchSchema = z.object({
  title: z.string().min(1).optional(),
  coverImageId: z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const me = await getViewerIdFromRequest(req)
    if (!me) return unauthorized('Not authenticated')
    const body = await req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) return badRequest('Invalid payload')
    const h = await Highlight.findById(params.id)
    if (!h) return notFound('Highlight not found')
    if (h.userId.toString() !== me) return unauthorized('Not permitted')
    if (parsed.data.title !== undefined) h.title = parsed.data.title
    if (parsed.data.coverImageId !== undefined) (h as any).coverImageId = parsed.data.coverImageId
    await h.save()
    return Response.json({ ok: true })
  } catch (e) {
    return serverError('Failed to update highlight')
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const me = await getViewerIdFromRequest(req)
    if (!me) return unauthorized('Not authenticated')
    const h = await Highlight.findById(params.id)
    if (!h) return notFound('Highlight not found')
    if (h.userId.toString() !== me) return unauthorized('Not permitted')
    await h.deleteOne()
    return Response.json({ ok: true })
  } catch (e) {
    return serverError('Failed to delete highlight')
  }
}
