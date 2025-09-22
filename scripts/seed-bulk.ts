/*
	Bulk seed script for load testing.
	Usage examples:
	  pnpm tsx scripts/seed-bulk.ts --users 200 --postsPerUser 20 --commentsPerPost 5
*/
import path from 'node:path'
import { Readable } from 'node:stream'
import fs from 'node:fs/promises'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { Post } from '@/lib/models/Post'
import { Comment } from '@/lib/models/Comment'
import { getGridFsBucket } from '@/lib/uploads/gridfs'
import sharp from 'sharp'

function argNum(name: string, def: number) {
  const idx = process.argv.findIndex((v) => v === `--${name}`)
  if (idx !== -1 && process.argv[idx + 1]) {
    const n = parseInt(process.argv[idx + 1], 10)
    if (!Number.isNaN(n)) return n
  }
  return def
}

const NUM_USERS = argNum('users', 100)
const POSTS_PER_USER = argNum('postsPerUser', 20)
const COMMENTS_PER_POST = argNum('commentsPerPost', 3)

async function ensureSampleImageFileId(): Promise<string> {
  const bucket = getGridFsBucket()
  // Try to use scripts/sample-images/one.webp if present; else generate tiny webp
  let buffer: Buffer
  try {
    const abs = path.join(process.cwd(), 'scripts/sample-images/one.webp')
    buffer = await fs.readFile(abs)
  } catch {
    buffer = await sharp({
      create: { width: 4, height: 4, channels: 3, background: { r: 220, g: 220, b: 220 } },
    })
      .webp({ quality: 60 })
      .toBuffer()
  }
  return await new Promise<string>((resolve, reject) => {
    const upload = bucket.openUploadStream('seed.webp', { metadata: { contentType: 'image/webp' } })
    Readable.from(buffer).pipe(upload)
    upload.on('finish', () => resolve(upload.id.toString()))
    upload.on('error', reject)
  })
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function randomFrom<T>(arr: T[], n: number): T[] {
  const a = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && a.length; i++) {
    out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0])
  }
  return out
}

const CITIES = [
  { name: 'Red Square', city: 'Moscow', coordinates: [37.6208, 55.7539] },
  { name: 'Nevsky Prospekt', city: 'Saint Petersburg', coordinates: [30.3351, 59.9343] },
  { name: 'Lake Baikal', city: 'Irkutsk', coordinates: [104.2964, 53.5587] },
  { name: 'Kazan Kremlin', city: 'Kazan', coordinates: [49.1064, 55.7963] },
]
const TAGS = ['#nature', '#city', '#food', '#museum', '#sunset', '#hike', '#river']

async function seedBulk() {
  await connectToDatabase()
  console.log(
    `Seeding ${NUM_USERS} users × ${POSTS_PER_USER} posts/user (comments/post: ${COMMENTS_PER_POST})...`,
  )
  const imgId = await ensureSampleImageFileId()

  // Users
  const users = [] as mongoose.Types.ObjectId[]
  for (let i = 0; i < NUM_USERS; i++) {
    const username = `user${i}`
    const u = await User.create({
      username,
      email: `${username}@example.com`,
      displayName: `User ${i}`,
      passwordHash: 'seeded',
      isPrivate: i % 7 === 0,
      isVerified: i % 13 === 0,
      interests: randomFrom(TAGS, 2),
    })
    users.push(u._id)
  }

  // Posts (batch per user)
  const postIds = [] as mongoose.Types.ObjectId[]
  for (const uid of users) {
    const docs = [] as any[]
    for (let j = 0; j < POSTS_PER_USER; j++) {
      const loc = randomChoice(CITIES)
      docs.push({
        userId: uid,
        caption: `Exploring ${loc.city} #${j}`,
        imageFileId: imgId,
        location: loc,
        rating: 3 + Math.floor(Math.random() * 3),
        hashtags: randomFrom(TAGS, 3),
        likesCount: Math.floor(Math.random() * 50),
        commentsCount: 0,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)),
      })
    }
    const created = await Post.insertMany(docs)
    postIds.push(...created.map((p) => p._id))
  }

  // Comments (root only, for speed)
  for (const pid of postIds) {
    const n = COMMENTS_PER_POST
    if (n <= 0) continue
    const sampleUsers = randomFrom(users, Math.min(5, users.length))
    const cmts = [] as any[]
    for (let k = 0; k < n; k++) {
      cmts.push({
        postId: pid,
        userId: randomChoice(sampleUsers),
        content: `Nice #${k}`,
        likesCount: Math.floor(Math.random() * 5),
      })
    }
    await Comment.insertMany(cmts)
    await Post.updateOne({ _id: pid }, { $inc: { commentsCount: cmts.length } })
  }

  console.log('Bulk seed complete.')
}

seedBulk()
  .then(() => mongoose.connection.close())
  .catch((err) => {
    console.error(err)
    mongoose.connection.close().finally(() => process.exit(1))
  })
