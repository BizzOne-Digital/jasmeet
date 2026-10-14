import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Collection from "@/models/Collection";
import { collectionCreateSchema } from "@/lib/validations/api";
import { revalidatePublicPaths } from "@/lib/revalidate";
import { slugify } from "@/lib/utils";
import { jsonSuccess, handleRouteError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    await connectDB();
    const filter = includeInactive ? {} : { isActive: true };
    const collections = await Collection.find(filter).sort({ order: 1 }).lean();

    return jsonSuccess(collections);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const data = collectionCreateSchema.parse(body);

    await connectDB();

    const slug = data.slug || slugify(data.name);
    const collection = await Collection.create({ ...data, slug });

    revalidatePublicPaths(["/collections", "/shop"]);
    return jsonSuccess(collection, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
