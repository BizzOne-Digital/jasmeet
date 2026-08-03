import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError("Unauthorized", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return jsonError("No file provided", 400);
    }

    if (!file.type.startsWith("image/")) {
      return jsonError("Only image files are allowed", 400);
    }

    const folder = (formData.get("folder") as string) || "dayaura";
    const result = await uploadImage(file, folder);

    return jsonSuccess({ url: result.url, publicId: result.publicId ?? null });
  } catch (error) {
    return handleRouteError(error);
  }
}
