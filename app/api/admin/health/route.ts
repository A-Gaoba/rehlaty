import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";
import { unauthorized } from "@/lib/api/errors";
import { getViewerIdFromRequest } from "@/lib/auth/permissions";

export async function GET(req: Request) {
  const uid = await getViewerIdFromRequest(req);
  if (!uid) return unauthorized("Not authenticated");
  await connectToDatabase();
  const state = mongoose.connection.readyState; // 1 = connected
  return Response.json({
    ok: true,
    dbState: state,
    now: new Date().toISOString(),
  });
}
