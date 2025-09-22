import { connectToDatabase } from "@/lib/db";
import { Comment } from "@/lib/models/Comment";
import { Post } from "@/lib/models/Post";
import { Notification } from "@/lib/models/Notification";
import { User } from "@/lib/models/User";
import { z } from "zod";
import { badRequest, serverError, unauthorized } from "@/lib/api/errors";
import { env } from "@/lib/env";
import {
  parseBearerToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";

function toClientComment(doc: any) {
  return {
    id: doc._id.toString(),
    postId: doc.postId.toString(),
    userId: doc.userId?._id?.toString?.() || doc.userId?.toString?.(),
    user: doc.userId
      ? {
          id: doc.userId._id.toString(),
          username: doc.userId.username,
          displayName: doc.userId.displayName,
          avatar: "/placeholder-user.jpg",
          bio: "",
          coverPhoto: "/placeholder.jpg",
          isPrivate: doc.userId.isPrivate,
          isVerified: doc.userId.isVerified,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          joinedAt: new Date(doc.userId.createdAt || Date.now()).toISOString(),
          interests: [],
        }
      : undefined,
    content: doc.content,
    likesCount: doc.likesCount,
    isLiked: false,
    createdAt: doc.createdAt.toISOString(),
    parentId: doc.parentId ? doc.parentId.toString() : undefined,
  };
}

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      100
    );
    const parentId = searchParams.get("parentId");

    const query: any = { postId: params.postId };
    if (parentId) {
      query.parentId = parentId;
    } else {
      query.$or = [{ parentId: null }, { parentId: { $exists: false } }];
    }
    if (cursor) query.createdAt = { $lt: new Date(cursor) };

    const items = await Comment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate({
        path: "userId",
        model: User,
        select: "username displayName isPrivate isVerified createdAt",
      })
      .lean();

    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore
      ? sliced[sliced.length - 1].createdAt.toISOString()
      : null;

    return Response.json({ items: sliced.map(toClientComment), nextCursor });
  } catch (e) {
    return serverError("Failed to fetch comments");
  }
}

const CreateSchema = z.object({
  content: z.string().min(1),
  parentId: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    await connectToDatabase();
    const authHeader = req.headers.get("authorization");
    const bearer = parseBearerToken(authHeader);
    const cookies = req.headers.get("cookie") || "";
    const refreshCookie = cookies
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${env.NEXTAUTH_COOKIE_NAME}=`));
    const refresh = refreshCookie ? refreshCookie.split("=")[1] : null;
    if (!bearer && !refresh) return unauthorized("Not authenticated");
    let userId: string;
    if (bearer) userId = (await verifyAccessToken(bearer)).sub as string;
    else userId = (await verifyRefreshToken(refresh!)).sub as string;

    const json = await req.json();
    const parsed = CreateSchema.safeParse(json);
    if (!parsed.success) return badRequest("Invalid payload");

    const created = await Comment.create({
      postId: params.postId,
      userId,
      content: parsed.data.content,
      parentId: parsed.data.parentId,
      likesCount: 0,
    });
    await Post.updateOne(
      { _id: params.postId },
      { $inc: { commentsCount: 1 } }
    );
    const post = await Post.findById(params.postId);
    if (post && post.userId.toString() !== userId) {
      await Notification.create({
        userId: post.userId,
        type: "comment",
        fromUserId: userId,
        postId: post._id,
        message: "علّق على منشورك",
        isRead: false,
      });
    }
    const populated = await created.populate({
      path: "userId",
      model: User,
      select: "username displayName isPrivate isVerified createdAt",
    });
    return Response.json(
      { comment: toClientComment(populated) },
      { status: 201 }
    );
  } catch (e) {
    return serverError("Failed to add comment");
  }
}
