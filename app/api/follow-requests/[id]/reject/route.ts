import { connectToDatabase } from "@/lib/db";
import { Follow } from "@/lib/models/Follow";
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
    await fr.deleteOne();
    return new Response(null, { status: 204 });
  } catch (e) {
    return serverError("Failed to reject");
  }
}
