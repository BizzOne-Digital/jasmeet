import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";
import {
  deleteStoredUploadByUrl,
  saveStoredUpload,
} from "@/lib/stored-uploads";
import { parseUploadFolderInput } from "@/lib/upload-folders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return jsonError("No file provided", 400);
    }

    const folder = parseUploadFolderInput(formData.get("folder") as string | null);
    if (!folder) {
      return jsonError(
        "Invalid folder. Use products, gallery, pages, or misc.",
        400
      );
    }

    const result = await saveStoredUpload(file, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
      size: result.size,
      folder: result.folder,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("allowed")) {
      return jsonError(error.message, 400);
    }
    if (error instanceof Error && error.message.includes("8MB")) {
      return jsonError(error.message, 400);
    }
    if (
      error instanceof Error &&
      error.message.includes("MONGODB_URI")
    ) {
      return jsonError(
        "Database is not configured. Set MONGODB_URI on the server.",
        503
      );
    }
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const body = (await request.json()) as { url?: string };
    if (!body.url) {
      return jsonError("URL is required", 400);
    }

    await deleteStoredUploadByUrl(body.url);
    return jsonSuccess({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
