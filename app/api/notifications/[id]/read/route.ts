import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/lib/models/Notification";
import { getViewerIdFromRequest } from "@/lib/auth/permissions";
import { serverError, unauthorized } from "@/lib/api/errors";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const viewerId = await getViewerIdFromRequest(req);
    if (!viewerId) return unauthorized("Not authenticated");
    await Notification.updateOne(
      { _id: params.id, userId: viewerId },
      { $set: { isRead: true } }
    );
    return new Response(null, { status: 204 });
  } catch (e) {
    return serverError("Failed to mark read");
  }
}
