import { connectToDatabase } from "@/lib/db";
import { unauthorized, serverError } from "@/lib/api/errors";
import { getViewerIdFromRequest } from "@/lib/auth/permissions";
import { User } from "@/lib/models/User";
import { Post } from "@/lib/models/Post";
import { Comment } from "@/lib/models/Comment";
import { Follow } from "@/lib/models/Follow";
import { Conversation } from "@/lib/models/Conversation";
import { Message } from "@/lib/models/Message";
import { Notification } from "@/lib/models/Notification";

export async function GET(req: Request) {
  try {
    const uid = await getViewerIdFromRequest(req);
    if (!uid) return unauthorized("Not authenticated");
    await connectToDatabase();
    const [
      users,
      posts,
      comments,
      follows,
      conversations,
      messages,
      notifications,
    ] = await Promise.all([
      User.estimatedDocumentCount(),
      Post.estimatedDocumentCount(),
      Comment.estimatedDocumentCount(),
      Follow.estimatedDocumentCount(),
      Conversation.estimatedDocumentCount(),
      Message.estimatedDocumentCount(),
      Notification.estimatedDocumentCount(),
    ]);
    return Response.json({
      users,
      posts,
      comments,
      follows,
      conversations,
      messages,
      notifications,
    });
  } catch (e) {
    return serverError("Failed to fetch stats");
  }
}
