import { requireAdmin } from "@/lib/auth";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";
import {
  deleteStoredUploadByUrl,
  saveStoredUpload,
} from "@/lib/stored-uploads";
import { normalizeUploadFolder } from "@/lib/upload-folders";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return jsonError("No file provided", 400);
    }

    const folder = normalizeUploadFolder(formData.get("folder") as string | null);
    const result = await saveStoredUpload(file, folder);

    return jsonSuccess({
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
