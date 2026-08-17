import { NextResponse } from "next/server";
import { getStoredUpload } from "@/lib/stored-uploads";
import { isUploadFolder } from "@/lib/upload-folders";

export const runtime = "nodejs";

function isSafeFilename(filename: string): boolean {
  if (!filename || filename.includes("..") || filename.includes("/")) {
    return false;
  }
  return /^[a-zA-Z0-9._-]+$/.test(filename);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ folder: string; filename: string }> }
) {
  const { folder, filename } = await context.params;

  if (
    !isUploadFolder(folder) ||
    folder.includes("..") ||
    folder.includes("/") ||
    !isSafeFilename(filename)
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const doc = await getStoredUpload(folder, filename);
  if (!doc) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(doc.data), {
    status: 200,
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(doc.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
