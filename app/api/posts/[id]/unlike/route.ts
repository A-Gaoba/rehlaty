import { connectToDatabase } from "@/lib/db";
import { Post } from "@/lib/models/Post";
import { serverError, notFound, unauthorized } from "@/lib/api/errors";
import { env } from "@/lib/env";
import {
  parseBearerToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
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
    if (bearer) await verifyAccessToken(bearer);
    if (!bearer && refresh) await verifyRefreshToken(refresh);

    const post = await Post.findById(params.id);
    if (!post) return notFound("Post not found");
    post.likesCount = Math.max(0, post.likesCount - 1);
    await post.save();
    return Response.json({ likesCount: post.likesCount });
  } catch (e) {
    return serverError("Failed to unlike post");
  }
}
