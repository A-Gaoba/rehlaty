import { connectToDatabase } from "@/lib/db";
import { Post } from "@/lib/models/Post";
import { badRequest, serverError } from "@/lib/api/errors";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "7d";
    const now = new Date();
    let since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (period.endsWith("d")) {
      const days = parseInt(period);
      if (!isNaN(days))
        since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    const results = await Post.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: "$location.city",
          postsCount: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
      { $sort: { postsCount: -1 } },
      { $limit: 20 },
    ]);

    const items = results.map((r) => ({
      city: r._id,
      postsCount: r.postsCount,
      averageRating: Number(r.averageRating?.toFixed?.(1) || 0),
    }));

    return Response.json({ items });
  } catch (e) {
    return serverError("Failed to aggregate destinations");
  }
}
