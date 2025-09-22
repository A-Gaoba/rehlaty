import { connectToDatabase } from "@/lib/db";
import { Conversation } from "@/lib/models/Conversation";
import { Message } from "@/lib/models/Message";
import { getViewerIdFromRequest, canMessage } from "@/lib/auth/permissions";
import {
  badRequest,
  forbidden,
  serverError,
  unauthorized,
} from "@/lib/api/errors";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const viewerId = await getViewerIdFromRequest(req);
    if (!viewerId) return unauthorized("Not authenticated");
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const conv = await Conversation.findById(params.id).lean();
    if (
      !conv ||
      !conv.participants?.some((p: any) => p.toString() === viewerId)
    )
      return forbidden("Not allowed");

    const query: any = { conversationId: params.id };
    if (cursor) query.createdAt = { $lt: new Date(cursor) };

    const items = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(50 + 1)
      .lean();
    const hasMore = items.length > 50;
    const sliced = hasMore ? items.slice(0, 50) : items;
    const nextCursor = hasMore
      ? sliced[sliced.length - 1].createdAt.toISOString()
      : null;
    return Response.json({
      items: sliced.map((m: any) => ({
        id: m._id.toString(),
        conversationId: m.conversationId.toString(),
        senderId: m.senderId.toString(),
        content: m.content,
        type: m.type,
        isRead: m.isReadBy?.includes(viewerId),
        createdAt: m.createdAt,
      })),
      nextCursor,
    });
  } catch (e) {
    return serverError("Failed to fetch messages");
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const viewerId = await getViewerIdFromRequest(req);
    if (!viewerId) return unauthorized("Not authenticated");
    const conv = await Conversation.findById(params.id);
    if (
      !conv ||
      !conv.participants?.some((p: any) => p.toString() === viewerId)
    )
      return forbidden("Not allowed");
    const other = conv.participants
      .find((p: any) => p.toString() !== viewerId)
      ?.toString();
    if (!other) return badRequest("Invalid conversation");
    if (!(await canMessage(viewerId, other)))
      return forbidden("Messaging not allowed");

    const { content } = await req.json();
    if (!content || typeof content !== "string")
      return badRequest("content required");
    const message = await Message.create({
      conversationId: params.id,
      senderId: viewerId,
      content,
      type: "text",
      isRead: false,
    });
    conv.lastMessage = message._id;
    await conv.save();
    return Response.json({
      message: {
        id: message._id.toString(),
        conversationId: message.conversationId.toString(),
        senderId: message.senderId.toString(),
        content: message.content,
        type: message.type,
        isRead: false,
        createdAt: message.createdAt,
      },
    });
  } catch (e) {
    return serverError("Failed to send message");
  }
}
