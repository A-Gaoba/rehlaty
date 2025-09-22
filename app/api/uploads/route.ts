import { connectToDatabase } from "@/lib/db";
import { getGridFsBucket } from "@/lib/uploads/gridfs";
import sharp from "sharp";
import Busboy from "busboy";
import { badRequest, serverError, unauthorized } from "@/lib/api/errors";
import { env } from "@/lib/env";
import {
  parseBearerToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";

export const runtime = "nodejs";

export async function POST(req: Request) {
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

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.startsWith("multipart/form-data")) {
      return badRequest("Content-Type must be multipart/form-data");
    }

    const bb = Busboy({ headers: { "content-type": contentType } });
    const chunks: Uint8Array[] = [];
    let mimetype = "";
    let filename = "";
    const maxBytes =
      (parseInt(process.env.UPLOADS_MAX_FILE_SIZE_MB || "10", 10) || 10) *
      1024 *
      1024;

    const busboyPromise = new Promise<{
      buffer: Buffer;
      mimetype: string;
      filename: string;
    }>((resolve, reject) => {
      bb.on("file", (_name, file, info) => {
        mimetype = info.mimeType;
        filename = info.filename;
        file.on("data", (data: Buffer) => {
          chunks.push(data);
          if (chunks.reduce((a, b) => a + b.length, 0) > maxBytes) {
            reject(new Error("File too large"));
            file.resume();
          }
        });
        file.on("limit", () => reject(new Error("File too large")));
        file.on("end", () =>
          resolve({ buffer: Buffer.concat(chunks), mimetype, filename })
        );
      });
      bb.on("error", (err) => reject(err));
    });

    const arrayBuffer = await req.arrayBuffer();
    bb.end(Buffer.from(arrayBuffer));
    const { buffer } = await busboyPromise;

    if (!["image/jpeg", "image/png", "image/webp"].includes(mimetype)) {
      return badRequest("Unsupported file type");
    }

    // Resize/process
    const width = parseInt(process.env.IMAGE_MAX_WIDTH || "2000", 10);
    const height = parseInt(process.env.IMAGE_MAX_HEIGHT || "2000", 10);
    const quality = parseInt(process.env.IMAGE_QUALITY || "80", 10);
    const webp = await sharp(buffer)
      .rotate()
      .resize({ width, height, fit: "inside" })
      .webp({ quality })
      .toBuffer();

    const bucket = getGridFsBucket();
    const uploadStream = bucket.openUploadStream(filename || "upload.webp", {
      metadata: { contentType: "image/webp" },
    });

    const idPromise = new Promise<string>((resolve, reject) => {
      uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
      uploadStream.on("error", reject);
    });
    uploadStream.end(webp);
    const fileId = await idPromise;

    return Response.json({ fileId });
  } catch (e) {
    return serverError("Failed to upload image");
  }
}
