import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'

export async function GET(req: Request) {
  await connectToDatabase()
  const { searchParams } = new URL(req.url)
  const username = (searchParams.get('username') || '').trim().toLowerCase()
  if (!username) return Response.json({ ok: false, available: false })
  const exists = await User.exists({ username })
  return Response.json({ ok: true, available: !exists })
}
