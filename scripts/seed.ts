/*
	Dev seed script with realistic data and clearing option.
	Usage:
	  pnpm tsx scripts/seed.ts [--force]
*/
import 'dotenv/config'
import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { Post } from '@/lib/models/Post'
import { Comment } from '@/lib/models/Comment'
import { Follow } from '@/lib/models/Follow'
import { Conversation } from '@/lib/models/Conversation'
import { Message } from '@/lib/models/Message'
import { Notification } from '@/lib/models/Notification'
import { hashPassword } from '@/lib/auth/hash'

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`)
}

function randomArabicName() {
  const first = faker.person.firstName()
  const last = faker.person.lastName()
  return `${first} ${last}`
}

const CITIES = [
  { name: 'Red Square', city: 'Moscow', coordinates: [37.6208, 55.7539] },
  { name: 'Nevsky Prospekt', city: 'Saint Petersburg', coordinates: [30.3351, 59.9343] },
  { name: 'Lake Baikal', city: 'Irkutsk', coordinates: [104.2964, 53.5587] },
  { name: 'Kazan Kremlin', city: 'Kazan', coordinates: [49.1064, 55.7963] },
]

function objectId(): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId()
}

async function confirmOrExit() {
  if (hasFlag('force')) return
  process.stdout.write('This will clear existing data. Continue? (y/N) ')
  await new Promise<void>((resolve) => {
    process.stdin.setEncoding('utf8')
    process.stdin.once('data', (d) => {
      const ans = String(d).trim().toLowerCase()
      if (ans !== 'y' && ans !== 'yes') {
        console.log('Aborted.')
        process.exit(0)
      }
      resolve()
    })
  })
}

async function seed() {
  await connectToDatabase()
  await confirmOrExit()

  // Clear collections
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Follow.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
  ])

  // Users (~10)
  const users = [] as { _id: mongoose.Types.ObjectId; username: string }[]
  for (let i = 0; i < 10; i++) {
    const username = faker.internet.username().toLowerCase() + i
    const u = await User.create({
      username,
      email: faker.internet.email({ firstName: username }),
      displayName: randomArabicName(),
      passwordHash: await hashPassword('Password123!'),
      avatarFileId: undefined,
      isPrivate: i % 4 === 0,
      isVerified: i % 7 === 0,
      interests: faker.helpers.arrayElements(['#city', '#nature', '#food', '#museum'], 2),
    })
    users.push({ _id: u._id, username })
  }

  // Posts (~30) with single or multiple images
  const posts = [] as mongoose.Types.ObjectId[]
  for (let i = 0; i < 30; i++) {
    const author = faker.helpers.arrayElement(users)
    const loc = faker.helpers.arrayElement(CITIES)
    const multi = Math.random() < 0.35
    const imageFileIds = multi
      ? [objectId(), objectId(), objectId()].slice(0, faker.number.int({ min: 2, max: 3 }))
      : []
    const p = await Post.create({
      userId: author._id,
      caption: faker.lorem.sentence({ min: 5, max: 12 }),
      rating: faker.number.int({ min: 3, max: 5 }),
      location: loc,
      imageFileId: multi ? undefined : objectId(),
      imageFileIds,
      hashtags: faker.helpers.arrayElements(['#city', '#nature', '#food', '#museum', '#sunset'], 3),
      likesCount: faker.number.int({ min: 0, max: 50 }),
      commentsCount: 0,
      createdAt: faker.date.recent({ days: 30 }),
    })
    posts.push(p._id)
  }

  // Comments (2–3 per post)
  let totalComments = 0
  for (const pid of posts) {
    const count = faker.number.int({ min: 2, max: 3 })
    const cmts = [] as any[]
    for (let i = 0; i < count; i++) {
      const commenter = faker.helpers.arrayElement(users)
      cmts.push({
        postId: pid,
        userId: commenter._id,
        content: faker.lorem.sentence(),
        likesCount: faker.number.int({ min: 0, max: 5 }),
      })
    }
    await Comment.insertMany(cmts)
    totalComments += cmts.length
    await Post.updateOne({ _id: pid }, { $inc: { commentsCount: cmts.length } })
  }

  // Follows (random, some pending)
  const follows = [] as any[]
  for (const a of users) {
    for (const b of users) {
      if (a._id.equals(b._id) || Math.random() > 0.15) continue
      follows.push({
        followerId: a._id,
        followingId: b._id,
        status: Math.random() > 0.3 ? 'accepted' : 'pending',
      })
    }
  }
  await Follow.insertMany(follows)

  // Conversations (3) with 5–10 messages each
  let totalMessages = 0
  for (let i = 0; i < 3; i++) {
    const [u1, u2] = faker.helpers.arrayElements(users, 2)
    const convo = await Conversation.create({
      participantIds: [u1._id, u2._id],
      updatedAt: new Date(),
    })
    const n = faker.number.int({ min: 5, max: 10 })
    const msgs = [] as any[]
    for (let m = 0; m < n; m++) {
      const sender = m % 2 === 0 ? u1 : u2
      msgs.push({
        conversationId: convo._id,
        senderId: sender._id,
        content: faker.lorem.sentence(),
        type: 'text',
        isReadBy: [sender._id],
      })
    }
    const created = await Message.insertMany(msgs)
    totalMessages += created.length
    await Conversation.updateOne(
      { _id: convo._id },
      { lastMessageId: created[created.length - 1]._id, updatedAt: new Date() },
    )
  }

  // Notifications (sample)
  const notifTypes = ['like', 'comment', 'follow', 'follow_request', 'message'] as const
  const notifications = [] as any[]
  for (let i = 0; i < 20; i++) {
    const to = faker.helpers.arrayElement(users)
    const from = faker.helpers.arrayElement(users)
    if (to._id.equals(from._id)) continue
    const type = faker.helpers.arrayElement(notifTypes)
    notifications.push({
      userId: to._id,
      type,
      fromUserId: from._id,
      message: faker.lorem.sentence(),
      isRead: Math.random() > 0.5,
    })
  }
  await Notification.insertMany(notifications)

  // Summary
  const [uc, pc, cc, fc, convc, mc, nc] = await Promise.all([
    User.estimatedDocumentCount(),
    Post.estimatedDocumentCount(),
    Comment.estimatedDocumentCount(),
    Follow.estimatedDocumentCount(),
    Conversation.estimatedDocumentCount(),
    Message.estimatedDocumentCount(),
    Notification.estimatedDocumentCount(),
  ])
  console.log('Seed complete:', {
    users: uc,
    posts: pc,
    comments: cc,
    follows: fc,
    conversations: convc,
    messages: mc,
    notifications: nc,
  })
}

seed()
  .then(() => mongoose.connection.close())
  .catch((err) => {
    console.error(err)
    mongoose.connection.close().finally(() => process.exit(1))
  })
