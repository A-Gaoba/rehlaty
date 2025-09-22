import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { badRequest, serverError } from "@/lib/api/errors";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (!q) return badRequest("q required");
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const users = await User.find({
      $or: [{ username: rx }, { displayName: rx }],
    })
      .select("username displayName isVerified createdAt")
      .limit(20)
      .lean();
    const items = users.map((u: any) => ({
      id: u._id.toString(),
      username: u.username,
      displayName: u.displayName,
      avatar: "/placeholder-user.jpg",
      isVerified: u.isVerified,
      bio: "",
      coverPhoto: "/placeholder.jpg",
      isPrivate: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      joinedAt: u.createdAt,
      interests: [],
    }));
    return Response.json({ items });
  } catch (e) {
    return serverError("Failed to search users");
  }
}
