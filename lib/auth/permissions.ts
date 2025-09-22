/* eslint-disable no-empty */
import { Follow } from '@/lib/models/Follow'
import { UserBlock } from '@/lib/models/UserBlock'

export async function getViewerIdFromRequest(req: Request): Promise<string | null> {
  const auth = req.headers.get('authorization')
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const { verifyAccessToken } = await import('@/lib/auth/jwt')
      const payload = await verifyAccessToken(auth.slice(7))
      return (payload.sub as string) || null
    } catch {}
  }
  const cookie = req.headers.get('cookie') || ''
  if (cookie) {
    try {
      const { env } = await import('@/lib/env')
      const { verifyRefreshToken } = await import('@/lib/auth/jwt')
      const token = cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${env.NEXTAUTH_COOKIE_NAME}=`))
        ?.split('=')[1]
      if (token) {
        const payload = await verifyRefreshToken(token)
        return (payload.sub as string) || null
      }
    } catch {}
  }
  return null
}

export async function isFollowingAccepted(viewerId: string, ownerId: string): Promise<boolean> {
  const rel = await Follow.findOne({
    followerId: viewerId,
    followingId: ownerId,
    status: 'accepted',
  }).lean()
  return !!rel
}

export async function canMessage(userA: string, userB: string): Promise<boolean> {
  const blocked = await UserBlock.findOne({
    $or: [
      { blockerId: userA, blockedId: userB },
      { blockerId: userB, blockedId: userA },
    ],
  }).lean()
  if (blocked) return false

  const rel = await Follow.findOne({
    $or: [
      { followerId: userA, followingId: userB, status: 'accepted' },
      { followerId: userB, followingId: userA, status: 'accepted' },
    ],
  }).lean()
  return !!rel
}
