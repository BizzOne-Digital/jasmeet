import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Collection from "@/models/Collection";
import GalleryItem from "@/models/GalleryItem";
import { galleryCreateSchema } from "@/lib/validations/api";
import { revalidatePublicPaths } from "@/lib/revalidate";
import { jsonSuccess, handleRouteError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionSlug = searchParams.get("collection");
    const includeInactive = searchParams.get("all") === "true";

    if (includeInactive) {
      await requireAdmin();
    }

    await connectDB();

    const filter: Record<string, unknown> = includeInactive
      ? {}
      : { isActive: true };
    if (collectionSlug) {
      const col = await Collection.findOne({ slug: collectionSlug }).lean();
      if (col) filter.collection = col._id;
    }

    const items = await GalleryItem.find(filter)
      .populate("collection", "name slug")
      .populate("category", "name slug")
      .sort({ order: 1 })
      .lean();

    return jsonSuccess(items);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const data = galleryCreateSchema.parse(body);

    await connectDB();
    const item = await GalleryItem.create(data);

    revalidatePublicPaths(["/gallery"]);
    return jsonSuccess(item, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
