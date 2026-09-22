import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import GalleryItem from "@/models/GalleryItem";
import { galleryUpdateSchema } from "@/lib/validations/api";
import { revalidatePublicPaths } from "@/lib/revalidate";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = galleryUpdateSchema.parse(body);

    await connectDB();
    const item = await GalleryItem.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("collection", "name slug");

    if (!item) {
      return jsonError("Gallery item not found", 404);
    }

    revalidatePublicPaths(["/gallery"]);
    return jsonSuccess(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    await connectDB();
    const item = await GalleryItem.findByIdAndDelete(id);

    if (!item) {
      return jsonError("Gallery item not found", 404);
    }

    revalidatePublicPaths(["/gallery"]);
    return jsonSuccess({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
