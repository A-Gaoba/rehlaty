/*
 * Complete seed script for Arabic Tourism Social App
 * Usage: pnpm tsx scripts/seed.ts [--drop]
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { Post } from '@/lib/models/Post'
import { Comment } from '@/lib/models/Comment'
import { Follow } from '@/lib/models/Follow'
import { Highlight } from '@/lib/models/Highlight'
import { Story } from '@/lib/models/Story'
import { Message } from '@/lib/models/Message'
import { Conversation } from '@/lib/models/Conversation'
import { Notification } from '@/lib/models/Notification'
import { PostLike } from '@/lib/models/PostLike'
import { CommentLike } from '@/lib/models/CommentLike'
import { PostSave } from '@/lib/models/PostSave'
import { UserBlock } from '@/lib/models/UserBlock'
import { hashPassword } from '@/lib/auth/hash'

// Arabic names and content generators
const ARABIC_FIRST_NAMES = [
  'أحمد',
  'محمد',
  'علي',
  'حسن',
  'حسين',
  'عبدالله',
  'عمر',
  'خالد',
  'سعد',
  'يوسف',
  'فاطمة',
  'عائشة',
  'زينب',
  'مريم',
  'خديجة',
  'نور',
  'سارة',
  'ليلى',
  'ريم',
  'هند',
]

const ARABIC_LAST_NAMES = [
  'الرحمن',
  'الرحيم',
  'المالك',
  'الملك',
  'القدوس',
  'السلام',
  'المؤمن',
  'المهيمن',
  'العزيز',
  'الجبار',
  'المتكبر',
  'الخالق',
  'البارئ',
  'المصور',
  'الغفار',
  'القهار',
]

const RUSSIAN_CITIES = [
  { name: 'الكرملين', city: 'موسكو', coordinates: [37.6175, 55.752] },
  { name: 'الميدان الأحمر', city: 'موسكو', coordinates: [37.6208, 55.7539] },
  { name: 'متحف الهيرميتاج', city: 'سانت بطرسبرغ', coordinates: [30.3146, 59.9398] },
  { name: 'شارع نيفسكي', city: 'سانت بطرسبرغ', coordinates: [30.3351, 59.9343] },
  { name: 'بحيرة بايكال', city: 'إيركوتسك', coordinates: [104.2964, 53.5587] },
  { name: 'كرملين قازان', city: 'قازان', coordinates: [49.1064, 55.7963] },
  { name: 'شاطئ سوتشي', city: 'سوتشي', coordinates: [39.7342, 43.6028] },
  { name: 'جبال القوقاز', city: 'سوتشي', coordinates: [39.7342, 43.6028] },
  { name: 'جامعة موسكو', city: 'موسكو', coordinates: [37.5309, 55.7031] },
  { name: 'مسرح البولشوي', city: 'موسكو', coordinates: [37.6196, 55.7596] },
]

const TOURISM_INTERESTS = [
  'سياحة',
  'ثقافة',
  'تاريخ',
  'فن',
  'مطاعم',
  'طبيعة',
  'مغامرات',
  'تصوير',
  'متاحف',
  'معمار',
  'موسيقى',
  'باليه',
  'أوبرا',
  'جبال',
  'بحيرات',
  'شواطئ',
]

const HASHTAGS = [
  'موسكو',
  'سانت_بطرسبرغ',
  'قازان',
  'سوتشي',
  'روسيا',
  'سياحة',
  'ثقافة',
  'تاريخ',
  'فن',
  'طبيعة',
  'مغامرة',
  'تصوير',
  'طعام',
  'حلال',
  'شروق',
  'غروب',
]

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

function generateArabicName(): string {
  const firstName = faker.helpers.arrayElement(ARABIC_FIRST_NAMES)
  const lastName = faker.helpers.arrayElement(ARABIC_LAST_NAMES)
  return `${firstName} ${lastName}`
}

function generateArabicBio(): string {
  const templates = [
    'أحب اكتشاف الثقافة الروسية والأماكن التاريخية 📸',
    'خبير في الطعام الروسي والحلال 🍽️ | دليلك للمطاعم الحلال',
    'مصورة محترفة | أوثق جمال روسيا بعدستي 📷',
    'مغامر ومتسلق جبال | سيبيريا والقوقاز 🏔️',
    'باحثة في الثقافة الروسية | أحب الباليه والأوبرا 🎭',
    'رجل أعمال | أسافر لروسيا للعمل والسياحة 💼',
    'طالبة طب في موسكو | أشارككم تجربتي الدراسية 📚',
    'مستكشف للمدن الروسية | أحب التاريخ والثقافة 🏛️',
  ]
  return faker.helpers.arrayElement(templates)
}

function generateArabicCaption(): string {
  const templates = [
    'زيارة مذهلة لـ {location} في {city}! المكان يحكي تاريخ روسيا العريق 🏰',
    'متحف {location} في {city} - كنز من الفن والثقافة! قضيت يوماً كاملاً هنا 🎨',
    'أفضل مطعم حلال في {city}! الطعام هنا لذيذ جداً والخدمة ممتازة 🍲',
    'شروق الشمس على {location} في {city} - منظر لا يُنسى! 🌅',
    'مغامرة تسلق في {location} قرب {city}! التحدي كان صعباً لكن المنظر يستحق 🏔️',
    'جولة في {location} في {city} - تجربة لا تُنسى مع الأصدقاء 👥',
    'تصوير {location} في {city} - الجمال الطبيعي هنا لا يوصف 📸',
    'زيارة {location} في {city} - التاريخ والثقافة في مكان واحد 🏛️',
  ]

  const template = faker.helpers.arrayElement(templates)
  const location = faker.helpers.arrayElement(RUSSIAN_CITIES)

  return template.replace('{location}', location.name).replace('{city}', location.city)
}

function generateArabicComment(): string {
  const comments = [
    'مكان رائع! زرته العام الماضي وكان تجربة لا تُنسى',
    'هل تنصح بالجولة المرشدة أم الزيارة الحرة؟',
    'متحف مذهل! كم من الوقت احتجت لزيارته كاملاً؟',
    'شكراً للمشاركة! سأضيفه لقائمة الأماكن التي أريد زيارتها',
    'الصور جميلة جداً! أي وقت من السنة أفضل للزيارة؟',
    'زرت نفس المكان الشهر الماضي، كان رائعاً حقاً!',
    'هل يوجد مطاعم حلال قريبة من المكان؟',
    'أحب هذا النوع من الأماكن التاريخية، شكراً للمشاركة',
    'كم تكلفة التذاكر؟ وهل يمكن الحجز مسبقاً؟',
    'منظر خلاب! أتمنى أن أزوره قريباً',
  ]
  return faker.helpers.arrayElement(comments)
}

function generateArabicMessage(): string {
  const messages = [
    'مرحباً! شاهدت منشورك عن {location}، هل يمكنك إعطائي نصائح للزيارة؟',
    'أهلاً وسهلاً! بالطبع، أنصحك بحجز التذاكر مسبقاً والذهاب صباحاً',
    'شكراً جزيلاً! وما رأيك في الجولة المرشدة؟',
    'هل جربت المطعم الجديد في الحي الأحمر؟',
    'متى ستزور {city} مرة أخرى؟',
    'هل يمكنك مشاركة المزيد من الصور؟',
    'أين يمكنني العثور على دليل سياحي باللغة العربية؟',
    'شكراً للمعلومات المفيدة!',
    'هل تخطط لزيارة مدن أخرى في روسيا؟',
    'أحب متابعة رحلاتك، استمر في المشاركة!',
  ]

  const template = faker.helpers.arrayElement(messages)
  const location = faker.helpers.arrayElement(RUSSIAN_CITIES)

  return template.replace('{location}', location.name).replace('{city}', location.city)
}

function generateNotificationMessage(type: string, fromUser: string): string {
  const messages = {
    like: 'أعجبت بمنشورك',
    comment: 'علقت على منشورك',
    follow: 'بدأت بمتابعتك',
    follow_request: 'طلبت متابعتك',
    message: 'أرسل لك رسالة',
  }
  return messages[type as keyof typeof messages] || 'إشعار جديد'
}

function generateGridFSObjectId(): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId()
}

async function confirmOrExit(): Promise<void> {
  if (hasFlag('drop')) return

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

async function main(): Promise<void> {
  try {
    console.log('🌱 Starting seed process...')

    await connectToDatabase()
    await confirmOrExit()

    // Clear collections if --drop flag is provided
    if (hasFlag('drop')) {
      console.log('🗑️  Clearing existing data...')
      await Promise.all([
        User.deleteMany({}),
        Post.deleteMany({}),
        Comment.deleteMany({}),
        Follow.deleteMany({}),
        Highlight.deleteMany({}),
        Story.deleteMany({}),
        Message.deleteMany({}),
        Conversation.deleteMany({}),
        Notification.deleteMany({}),
        PostLike.deleteMany({}),
        CommentLike.deleteMany({}),
        PostSave.deleteMany({}),
        UserBlock.deleteMany({}),
      ])
    }

    // 1. Create Users (15-20)
    console.log('👥 Creating users...')
    const users: Array<{ _id: mongoose.Types.ObjectId; username: string }> = []
    const userCountToCreate = faker.number.int({ min: 15, max: 20 })

    for (let i = 0; i < userCountToCreate; i++) {
      const username = faker.internet.username().toLowerCase() + i
      const user = await User.create({
        email: faker.internet.email({ firstName: username }),
        username,
        passwordHash: await hashPassword('Password123!'),
        displayName: generateArabicName(),
        bio: generateArabicBio(),
        avatarFileId: faker.datatype.boolean() ? generateGridFSObjectId() : undefined,
        coverFileId: faker.datatype.boolean() ? generateGridFSObjectId() : undefined,
        birthday: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        isPrivate: faker.datatype.boolean({ probability: 0.2 }),
        isVerified: faker.datatype.boolean({ probability: 0.3 }),
        interests: faker.helpers.arrayElements(
          TOURISM_INTERESTS,
          faker.number.int({ min: 2, max: 5 }),
        ),
        socialLinks: {
          instagram: faker.datatype.boolean() ? faker.internet.username() : undefined,
          snapchat: faker.datatype.boolean() ? faker.internet.username() : undefined,
          twitter: faker.datatype.boolean() ? faker.internet.username() : undefined,
          tiktok: faker.datatype.boolean() ? faker.internet.username() : undefined,
          website: faker.datatype.boolean() ? faker.internet.url() : undefined,
        },
        bioLinks: faker.helpers.arrayElements(
          [faker.internet.url(), faker.internet.url()],
          faker.number.int({ min: 0, max: 2 }),
        ),
        privacy: faker.helpers.arrayElement(['public', 'private']),
        contactEmail: faker.datatype.boolean() ? faker.internet.email() : undefined,
        contactPhone: faker.datatype.boolean() ? faker.phone.number() : undefined,
        notificationPrefs: {
          likes: faker.datatype.boolean({ probability: 0.8 }),
          comments: faker.datatype.boolean({ probability: 0.9 }),
          follows: faker.datatype.boolean({ probability: 0.7 }),
          messages: faker.datatype.boolean({ probability: 0.9 }),
        },
      })
      users.push({ _id: user._id, username })
    }

    // 2. Create Follows (30-50)
    console.log('👥 Creating follows...')
    const follows: any[] = []
    const followCountToCreate = faker.number.int({ min: 30, max: 50 })

    for (let i = 0; i < followCountToCreate; i++) {
      const follower = faker.helpers.arrayElement(users)
      const following = faker.helpers.arrayElement(users)

      // Don't follow yourself
      if (follower._id.equals(following._id)) continue

      // Check if follow already exists
      const exists = follows.some(
        (f) => f.followerId.equals(follower._id) && f.followingId.equals(following._id),
      )
      if (exists) continue

      follows.push({
        followerId: follower._id,
        followingId: following._id,
        status: faker.helpers.arrayElement(['accepted', 'pending']),
      })
    }
    await Follow.insertMany(follows)

    // 3. Create Highlights (2-4 per user)
    console.log('⭐ Creating highlights...')
    const highlights: Array<{ _id: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId }> = []

    for (const user of users) {
      const highlightCount = faker.number.int({ min: 2, max: 4 })
      for (let i = 0; i < highlightCount; i++) {
        const highlight = await Highlight.create({
          userId: user._id,
          title: faker.helpers.arrayElement([
            'رحلاتي في موسكو',
            'مغامرات سانت بطرسبرغ',
            'طعام روسيا الحلال',
            'تصوير الطبيعة',
            'المتاحف والثقافة',
            'الجبال والمغامرات',
          ]),
          coverImageId: faker.datatype.boolean() ? generateGridFSObjectId() : undefined,
        })
        highlights.push({ _id: highlight._id, userId: user._id })
      }
    }

    // 4. Create Stories (3-8 per highlight)
    console.log('📸 Creating stories...')
    for (const highlight of highlights) {
      const storyCount = faker.number.int({ min: 3, max: 8 })
      for (let i = 0; i < storyCount; i++) {
        await Story.create({
          highlightId: highlight._id,
          userId: highlight.userId,
          imageFileId: generateGridFSObjectId(),
        })
      }
    }

    // 5. Create Posts (50-80)
    console.log('📝 Creating posts...')
    const posts: Array<{ _id: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId }> = []
    const postCountToCreate = faker.number.int({ min: 50, max: 80 })

    for (let i = 0; i < postCountToCreate; i++) {
      const author = faker.helpers.arrayElement(users)
      const location = faker.helpers.arrayElement(RUSSIAN_CITIES)
      const isMultiImage = faker.datatype.boolean({ probability: 0.3 })

      const post = await Post.create({
        userId: author._id,
        caption: generateArabicCaption(),
        imageFileId: isMultiImage ? undefined : generateGridFSObjectId(),
        imageFileIds: isMultiImage
          ? faker.helpers.arrayElements(
              [generateGridFSObjectId(), generateGridFSObjectId(), generateGridFSObjectId()],
              faker.number.int({ min: 2, max: 3 }),
            )
          : [],
        location,
        rating: faker.number.int({ min: 3, max: 5 }),
        hashtags: faker.helpers.arrayElements(HASHTAGS, faker.number.int({ min: 2, max: 5 })),
        taggedUserIds: faker.helpers.arrayElements(
          users.map((u) => u._id),
          faker.number.int({ min: 0, max: 3 }),
        ),
        likesCount: 0,
        commentsCount: 0,
        createdAt: faker.date.recent({ days: 30 }),
      })
      posts.push({ _id: post._id, userId: author._id })
    }

    // 6. Create Comments (2-5 per post)
    console.log('💬 Creating comments...')
    const comments: Array<{ _id: mongoose.Types.ObjectId; postId: mongoose.Types.ObjectId }> = []

    for (const post of posts) {
      const commentCountToCreate = faker.number.int({ min: 2, max: 5 })
      const postComments: any[] = []

      for (let i = 0; i < commentCountToCreate; i++) {
        const commenter = faker.helpers.arrayElement(users)
        const comment = {
          postId: post._id,
          userId: commenter._id,
          content: generateArabicComment(),
          parentId:
            faker.datatype.boolean({ probability: 0.2 }) && postComments.length > 0
              ? faker.helpers.arrayElement(postComments)._id
              : undefined,
          likesCount: 0,
        }
        postComments.push(comment)
      }

      const createdComments = await Comment.insertMany(postComments)

      // Add created comments to the comments array
      for (const createdComment of createdComments) {
        comments.push({ _id: createdComment._id, postId: post._id })
      }

      // Update post comments count
      await Post.updateOne({ _id: post._id }, { $inc: { commentsCount: postComments.length } })
    }

    // 7. Create PostLikes (100-200)
    console.log('❤️ Creating post likes...')
    const postLikes: any[] = []
    const likeCountToCreate = faker.number.int({ min: 100, max: 200 })

    for (let i = 0; i < likeCountToCreate; i++) {
      const post = faker.helpers.arrayElement(posts)
      const user = faker.helpers.arrayElement(users)

      // Don't like your own post
      if (post.userId.equals(user._id)) continue

      // Check if like already exists
      const exists = postLikes.some(
        (pl) => pl.postId.equals(post._id) && pl.userId.equals(user._id),
      )
      if (exists) continue

      postLikes.push({
        postId: post._id,
        userId: user._id,
      })
    }
    await PostLike.insertMany(postLikes)

    // Update post likes counts
    for (const post of posts) {
      const likes = postLikes.filter((pl) => pl.postId.equals(post._id)).length
      if (likes > 0) {
        await Post.updateOne({ _id: post._id }, { $inc: { likesCount: likes } })
      }
    }

    // 8. Create CommentLikes (30-50)
    console.log('👍 Creating comment likes...')
    const commentLikes: any[] = []
    const commentLikeCountToCreate = faker.number.int({ min: 30, max: 50 })

    for (let i = 0; i < commentLikeCountToCreate; i++) {
      const comment = faker.helpers.arrayElement(comments)
      const user = faker.helpers.arrayElement(users)

      // Check if like already exists
      const exists = commentLikes.some(
        (cl) => cl.commentId.equals(comment._id) && cl.userId.equals(user._id),
      )
      if (exists) continue

      commentLikes.push({
        commentId: comment._id,
        userId: user._id,
      })
    }
    await CommentLike.insertMany(commentLikes)

    // Update comment likes counts
    for (const comment of comments) {
      const likes = commentLikes.filter((cl) => cl.commentId.equals(comment._id)).length
      if (likes > 0) {
        await Comment.updateOne({ _id: comment._id }, { $inc: { likesCount: likes } })
      }
    }

    // 9. Create PostSaves (50-100)
    console.log('💾 Creating post saves...')
    const postSaves: any[] = []
    const saveCountToCreate = faker.number.int({ min: 50, max: 100 })

    for (let i = 0; i < saveCountToCreate; i++) {
      const post = faker.helpers.arrayElement(posts)
      const user = faker.helpers.arrayElement(users)

      // Don't save your own post
      if (post.userId.equals(user._id)) continue

      // Check if save already exists
      const exists = postSaves.some(
        (ps) => ps.postId.equals(post._id) && ps.userId.equals(user._id),
      )
      if (exists) continue

      postSaves.push({
        postId: post._id,
        userId: user._id,
      })
    }
    await PostSave.insertMany(postSaves)

    // 10. Create Conversations (8-12)
    console.log('💬 Creating conversations...')
    const conversations: Array<{
      _id: mongoose.Types.ObjectId
      participantIds: mongoose.Types.ObjectId[]
    }> = []
    const conversationCountToCreate = faker.number.int({ min: 8, max: 12 })

    for (let i = 0; i < conversationCountToCreate; i++) {
      const participants = faker.helpers.arrayElements(users, faker.number.int({ min: 2, max: 4 }))
      const conversation = await Conversation.create({
        participantIds: participants.map((p) => p._id),
        updatedAt: new Date(),
      })
      conversations.push({ _id: conversation._id, participantIds: participants.map((p) => p._id) })
    }

    // 11. Create Messages (5-15 per conversation)
    console.log('📨 Creating messages...')
    for (const conversation of conversations) {
      const messageCountToCreate = faker.number.int({ min: 5, max: 15 })
      const messages: any[] = []

      for (let i = 0; i < messageCountToCreate; i++) {
        const sender = faker.helpers.arrayElement(conversation.participantIds)
        const message = {
          conversationId: conversation._id,
          senderId: sender,
          content: generateArabicMessage(),
          type: faker.helpers.arrayElement(['text', 'image']),
          isReadBy: faker.helpers.arrayElements(
            conversation.participantIds,
            faker.number.int({ min: 1, max: conversation.participantIds.length }),
          ),
        }
        messages.push(message)
      }

      const createdMessages = await Message.insertMany(messages)

      // Update conversation with last message
      if (createdMessages.length > 0) {
        await Conversation.updateOne(
          { _id: conversation._id },
          {
            lastMessageId: createdMessages[createdMessages.length - 1]._id,
            updatedAt: new Date(),
          },
        )
      }
    }

    // 12. Create Notifications (40-60)
    console.log('🔔 Creating notifications...')
    const notificationTypes = ['like', 'comment', 'follow', 'follow_request', 'message'] as const
    const notificationCountToCreate = faker.number.int({ min: 40, max: 60 })

    for (let i = 0; i < notificationCountToCreate; i++) {
      const toUser = faker.helpers.arrayElement(users)
      const fromUser = faker.helpers.arrayElement(users)

      // Don't notify yourself
      if (toUser._id.equals(fromUser._id)) continue

      const type = faker.helpers.arrayElement(notificationTypes)
      const post =
        type === 'like' || type === 'comment' ? faker.helpers.arrayElement(posts) : undefined

      await Notification.create({
        userId: toUser._id,
        type,
        fromUserId: fromUser._id,
        postId: post?._id,
        message: generateNotificationMessage(type, fromUser.username),
        isRead: faker.datatype.boolean({ probability: 0.6 }),
      })
    }

    // 13. Create UserBlocks (5-10)
    console.log('🚫 Creating user blocks...')
    const userBlocks: any[] = []
    const blockCountToCreate = faker.number.int({ min: 5, max: 10 })

    for (let i = 0; i < blockCountToCreate; i++) {
      const blocker = faker.helpers.arrayElement(users)
      const blocked = faker.helpers.arrayElement(users)

      // Don't block yourself
      if (blocker._id.equals(blocked._id)) continue

      // Check if block already exists
      const exists = userBlocks.some(
        (ub) => ub.blockerId.equals(blocker._id) && ub.blockedId.equals(blocked._id),
      )
      if (exists) continue

      userBlocks.push({
        blockerId: blocker._id,
        blockedId: blocked._id,
      })
    }
    await UserBlock.insertMany(userBlocks)

    // Summary
    console.log('📊 Seed complete! Summary:')
    const [
      userCount,
      postCount,
      commentCount,
      followCount,
      highlightCount,
      storyCount,
      conversationCount,
      messageCount,
      notificationCount,
      postLikeCount,
      commentLikeCount,
      postSaveCount,
      userBlockCount,
    ] = await Promise.all([
      User.estimatedDocumentCount(),
      Post.estimatedDocumentCount(),
      Comment.estimatedDocumentCount(),
      Follow.estimatedDocumentCount(),
      Highlight.estimatedDocumentCount(),
      Story.estimatedDocumentCount(),
      Conversation.estimatedDocumentCount(),
      Message.estimatedDocumentCount(),
      Notification.estimatedDocumentCount(),
      PostLike.estimatedDocumentCount(),
      CommentLike.estimatedDocumentCount(),
      PostSave.estimatedDocumentCount(),
      UserBlock.estimatedDocumentCount(),
    ])

    console.log({
      users: userCount,
      posts: postCount,
      comments: commentCount,
      follows: followCount,
      highlights: highlightCount,
      stories: storyCount,
      conversations: conversationCount,
      messages: messageCount,
      notifications: notificationCount,
      postLikes: postLikeCount,
      commentLikes: commentLikeCount,
      postSaves: postSaveCount,
      userBlocks: userBlockCount,
    })

    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

// Run the seed function
if (require.main === module) {
  main()
    .then(() => {
      console.log('🎉 Seed process completed!')
      mongoose.connection.close()
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seed process failed:', error)
      mongoose.connection.close()
      process.exit(1)
    })
}

export { main }
