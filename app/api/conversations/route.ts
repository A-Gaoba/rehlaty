import { connectToDatabase } from '@/lib/db'
import { Conversation } from '@/lib/models/Conversation'
import { Message } from '@/lib/models/Message'
import { User } from '@/lib/models/User'
import { getViewerIdFromRequest, canMessage } from '@/lib/auth/permissions'
import { serverError, unauthorized, forbidden } from '@/lib/api/errors'

export async function GET(req: Request) {
  try {
    await connectToDatabase()
    const viewerId = await getViewerIdFromRequest(req)
    if (!viewerId) return unauthorized('Not authenticated')
    const convs = await Conversation.find({ participantIds: viewerId })
      .sort({ updatedAt: -1 })
      .populate({
        path: 'participants',
        model: User,
        select: 'username displayName isVerified createdAt',
      })
      .populate({ path: 'lastMessage', model: Message })
      .lean()

    const items = await Promise.all(
      convs.map(async (c: any) => {
        const unreadCount = await Message.countDocuments({
          conversationId: c._id,
          senderId: { $ne: viewerId },
          isReadBy: { $ne: viewerId },
        })
        return {
          id: c._id.toString(),
          participants: c.participants.map((p: any) => ({
            id: p._id.toString(),
            displayName: p.displayName,
            avatar: '/placeholder-user.jpg',
            isVerified: p.isVerified,
          })),
          lastMessage: c.lastMessage
            ? {
                id: c.lastMessage._id.toString(),
                content: c.lastMessage.content,
                createdAt: c.lastMessage.createdAt,
              }
            : undefined,
          unreadCount,
          updatedAt: c.updatedAt,
        }
      }),
    )

    return Response.json({ items })
  } catch (e) {
    return serverError('Failed to fetch conversations')
  }
}

// Create or get an existing conversation with another user
export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const viewerId = await getViewerIdFromRequest(req)
    if (!viewerId) return unauthorized('Not authenticated')
    const { userId } = await req.json()
    if (!userId) return serverError('Missing userId')

    // Enforce messaging policy and block rules
    if (!(await canMessage(viewerId, userId))) {
      return forbidden('Messaging not allowed')
    }

    let convo = await Conversation.findOne({ participantIds: { $all: [viewerId, userId] } })
    if (!convo) {
      convo = await Conversation.create({ participantIds: [viewerId, userId] })
    }
    return Response.json({ id: convo._id.toString() }, { status: 201 })
  } catch (e) {
    return serverError('Failed to create conversation')
  }
}
