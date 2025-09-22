import { connectToDatabase } from "@/lib/db";
import { Follow } from "@/lib/models/Follow";
import { Notification } from "@/lib/models/Notification";
import { serverError, unauthorized, notFound } from "@/lib/api/errors";
import { getViewerIdFromRequest } from "@/lib/auth/permissions";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const viewerId = await getViewerIdFromRequest(req);
    if (!viewerId) return unauthorized("Not authenticated");
    const fr = await Follow.findById(params.id);
    if (!fr) return notFound("Request not found");
    if (fr.followingId.toString() !== viewerId)
      return unauthorized("Not authorized");
    fr.status = "accepted";
    await fr.save();
    await Notification.create({
      userId: fr.followerId,
      type: "follow",
      fromUserId: viewerId,
      message: "تم قبول طلب المتابعة",
      isRead: false,
    });
    return Response.json({ id: fr._id.toString(), status: fr.status });
  } catch (e) {
    return serverError("Failed to accept");
  }
}
