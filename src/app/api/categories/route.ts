import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { jsonSuccess, handleRouteError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    await connectDB();
    const filter = includeInactive ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ order: 1 }).lean();

    return jsonSuccess(categories);
  } catch (error) {
    return handleRouteError(error);
  }
}
