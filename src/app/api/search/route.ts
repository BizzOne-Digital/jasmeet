import { instantSearch } from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { jsonSuccess, handleRouteError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const productLimit = Math.min(
      Number(searchParams.get("productLimit") || 6) || 6,
      12
    );
    const collectionLimit = Math.min(
      Number(searchParams.get("collectionLimit") || 4) || 4,
      8
    );

    if (q.length < 1) {
      return jsonSuccess({ products: [], collections: [], totalProducts: 0 });
    }

    const result = await instantSearch(q, productLimit, collectionLimit);

    return jsonSuccess({
      products: serialize(result.products),
      collections: serialize(result.collections),
      totalProducts: result.totalProducts,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
