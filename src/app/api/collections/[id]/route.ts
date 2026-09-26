import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Collection from "@/models/Collection";
import { collectionUpdateSchema } from "@/lib/validations/api";
import { revalidatePublicPaths } from "@/lib/revalidate";
import { slugify } from "@/lib/utils";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();
    const collection = await Collection.findById(id).lean();
    if (!collection) return jsonError("Collection not found", 404);
    return jsonSuccess(collection);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const data = collectionUpdateSchema.parse(body);

    await connectDB();

    const update = { ...data };
    if (data.name && !data.slug) {
      update.slug = slugify(data.name);
    }

    const collection = await Collection.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!collection) return jsonError("Collection not found", 404);

    revalidatePublicPaths(["/", "/collections", `/collections/${collection.slug}`, "/shop"]);
    return jsonSuccess(collection);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    await connectDB();
    const collection = await Collection.findByIdAndDelete(id).lean();
    if (!collection) return jsonError("Collection not found", 404);

    revalidatePublicPaths(["/", "/collections", "/shop"]);
    return jsonSuccess({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
