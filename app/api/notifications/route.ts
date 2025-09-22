import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/lib/models/Notification";
import { User } from "@/lib/models/User";
import { Post } from "@/lib/models/Post";
import { getViewerIdFromRequest } from "@/lib/auth/permissions";
import { serverError, unauthorized } from "@/lib/api/errors";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const viewerId = await getViewerIdFromRequest(req);
    if (!viewerId) return unauthorized("Not authenticated");
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      100
    );
    const query: any = { userId: viewerId };
    if (cursor) query.createdAt = { $lt: new Date(cursor) };
    else if (since) query.createdAt = { $gt: new Date(since) };
    const docs = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate({
        path: "fromUserId",
        model: User,
        select: "username displayName isPrivate isVerified createdAt",
      })
      .populate({ path: "postId", model: Post, select: "caption imageFileId" })
      .lean();

    const hasMore = docs.length > limit;
    const sliced = hasMore ? docs.slice(0, limit) : docs;
    const nextCursor = hasMore
      ? sliced[sliced.length - 1].createdAt.toISOString()
      : null;

    const items = sliced.map((n: any) => ({
      id: n._id.toString(),
      userId: n.userId.toString(),
      type: n.type,
      fromUser: n.fromUserId
        ? {
            id: n.fromUserId._id.toString(),
            displayName: n.fromUserId.displayName,
            avatar: "/placeholder-user.jpg",
          }
        : undefined,
      post: n.postId
        ? {
            id: n.postId._id.toString(),
            caption: n.postId.caption,
            image: n.postId.imageFileId
              ? `/api/uploads/${n.postId.imageFileId.toString()}`
              : "/placeholder.svg",
          }
        : undefined,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
    return Response.json({ items, nextCursor });
  } catch (e) {
    return serverError("Failed to fetch notifications");
  }
}
