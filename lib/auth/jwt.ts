import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { env } from '@/lib/env'

const encoder = new TextEncoder()
const secret = encoder.encode(env.JWT_SECRET)

export interface AccessTokenPayload extends JWTPayload {
  sub: string
  username: string
  displayName: string
  isVerified: boolean
  isPrivate: boolean
}

export async function signAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp' | 'nbf' | 'jti'>, expiresIn = '15m') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export async function signRefreshToken(payload: { sub: string }, expiresIn = '30d') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify<AccessTokenPayload>(token, secret)
  return payload
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify<{ sub: string }>(token, secret)
  return payload
}

export function parseBearerToken(headerValue: string | null | undefined) {
  if (!headerValue) return null
  const parts = headerValue.split(' ')
  if (parts.length !== 2) return null
  const [scheme, token] = parts
  if (!/^Bearer$/i.test(scheme)) return null
  return token
}


