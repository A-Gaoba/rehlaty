import { connectToDatabase } from "@/lib/db";
import { getGridFsBucket } from "@/lib/uploads/gridfs";
import mongoose from "mongoose";
import { notFound, serverError } from "@/lib/api/errors";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const bucket = getGridFsBucket();
    let fileId: mongoose.Types.ObjectId;
    try {
      fileId = new mongoose.Types.ObjectId(params.id);
    } catch {
      return notFound("Invalid file id");
    }
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) return notFound("File not found");
    const file = files[0];
    const stream = bucket.openDownloadStream(fileId);
    const headers = new Headers();
    const ct =
      (file.metadata && (file.metadata as any).contentType) ||
      (file as any).contentType;
    headers.set("Content-Type", ct || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return new Response(stream as any, { status: 200, headers });
  } catch (e) {
    return serverError("Failed to fetch file");
  }
}
