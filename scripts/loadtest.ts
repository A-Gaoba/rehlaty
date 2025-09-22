/*
	Simple load test for paginated endpoints.
	Usage: pnpm tsx scripts/loadtest.ts --base http://localhost:3000 --token <ACCESS_TOKEN>
*/
import { setTimeout as wait } from 'node:timers/promises'

function arg(name: string, def?: string) {
  const idx = process.argv.findIndex((v) => v === `--${name}`)
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1]
  return def
}

const BASE = arg('base', 'http://localhost:3000')!
const TOKEN = arg('token') // optional, endpoints allow public reads; auth improves coverage

async function page<T>(path: string, cursor?: string) {
  const qs = new URLSearchParams()
  if (cursor) qs.set('cursor', cursor)
  const url = `${BASE}${path}${qs.toString() ? `?${qs}` : ''}`
  const res = await fetch(url, {
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : undefined,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return (await res.json()) as T
}

async function bench(name: string, fn: () => Promise<void>) {
  const t0 = performance.now()
  await fn()
  const t1 = performance.now()
  console.log(`${name}: ${(t1 - t0).toFixed(1)} ms`)
}

async function testPosts(limit = 20, pages = 5) {
  let cursor: string | undefined
  for (let i = 0; i < pages; i++) {
    await bench(`GET /api/posts page ${i + 1}` as const, async () => {
      const data = await page<{ items: any[]; nextCursor: string | null }>(
        `/api/posts?limit=${limit}`,
        cursor,
      )
      cursor = data.nextCursor || undefined
      if (!data.items.length) return
    })
    await wait(50)
    if (!cursor) break
  }
}

async function testCommentsPerRandomPost(limit = 20, pages = 3) {
  const first = await page<{ items: any[]; nextCursor: string | null }>(`/api/posts?limit=1`)
  const post = first.items[0]
  if (!post) return
  let cursor: string | undefined
  for (let i = 0; i < pages; i++) {
    await bench(`GET /api/posts/${post.id}/comments page ${i + 1}`, async () => {
      const data = await page<{ items: any[]; nextCursor: string | null }>(
        `/api/posts/${post.id}/comments?limit=${limit}`,
        cursor,
      )
      cursor = data.nextCursor || undefined
    })
    await wait(30)
    if (!cursor) break
  }
}

async function testNotifications(limit = 20, pages = 3) {
  let cursor: string | undefined
  for (let i = 0; i < pages; i++) {
    await bench(`GET /api/notifications page ${i + 1}`, async () => {
      const data = await page<{ items: any[]; nextCursor: string | null }>(
        `/api/notifications?limit=${limit}`,
        cursor,
      )
      cursor = data.nextCursor || undefined
    })
    await wait(20)
    if (!cursor) break
  }
}

async function main() {
  console.log(`Base: ${BASE}`)
  await testPosts(20, 8)
  await testCommentsPerRandomPost(20, 5)
  await testNotifications(20, 5)
  console.log('Load test complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
