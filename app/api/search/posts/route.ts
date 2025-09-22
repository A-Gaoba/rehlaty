import { connectToDatabase } from "@/lib/db";
import { Post } from "@/lib/models/Post";
import { User } from "@/lib/models/User";
import { badRequest, serverError } from "@/lib/api/errors";

function toClientPost(doc: any) {
  return {
    id: doc._id.toString(),
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
    caption: doc.caption,
    image: doc.imageFileId
      ? `/api/uploads/${doc.imageFileId.toString()}`
      : "/placeholder.svg",
    location: doc.location,
    rating: doc.rating,
    likesCount: doc.likesCount,
    commentsCount: doc.commentsCount,
    isLiked: false,
    isSaved: false,
    createdAt: doc.createdAt.toISOString(),
    hashtags: doc.hashtags || [],
  };
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const city = (searchParams.get("city") || "").trim();
    const tag = (searchParams.get("tag") || "").trim();
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50);

    const query: any = {};
    if (q)
      query.caption = {
        $regex: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      };
    if (city) query["location.city"] = city;
    if (tag) query.hashtags = tag;
    if (cursor) query.createdAt = { $lt: new Date(cursor) };

    const items = await Post.find(query)
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

    return Response.json({ items: sliced.map(toClientPost), nextCursor });
  } catch (e) {
    return serverError("Failed to search posts");
  }
}
