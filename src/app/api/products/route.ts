import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Product from "@/models/Product";
import Collection from "@/models/Collection";
import Category from "@/models/Category";
import { productCreateSchema } from "@/lib/validations/api";
import { getProducts, getProductsByIds } from "@/lib/data/queries";
import { revalidateProductPaths } from "@/lib/revalidate";
import { slugify, generateSKU } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitize";
import { sanitizeProductImagePayload } from "@/lib/product-images-server";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";
import type { ProductFilters } from "@/types";

function parseProductFilters(searchParams: URLSearchParams): ProductFilters {
  const sizes = searchParams.get("sizes");
  const status = searchParams.get("status") as ProductFilters["status"];
  return {
    search: searchParams.get("search") || undefined,
    collection: searchParams.get("collection") || undefined,
    category: searchParams.get("category") || undefined,
    sizes: sizes ? sizes.split(",").filter(Boolean) : undefined,
    minPrice: searchParams.has("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.has("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    inStock: searchParams.get("inStock") === "true" ? true : undefined,
    featured: searchParams.get("featured") === "true" ? true : undefined,
    newArrival: searchParams.get("newArrival") === "true" ? true : undefined,
    onSale: searchParams.get("onSale") === "true" ? true : undefined,
    status: status || "published",
    sort: (searchParams.get("sort") as ProductFilters["sort"]) || "newest",
    page: searchParams.has("page") ? Number(searchParams.get("page")) : 1,
    limit: searchParams.has("limit") ? Number(searchParams.get("limit")) : 12,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (idsParam) {
      const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);
      const limit = searchParams.has("limit")
        ? Number(searchParams.get("limit"))
        : 8;
      const products = await getProductsByIds(ids, limit);
      return jsonSuccess({ products, total: products.length });
    }

    const filters = parseProductFilters(searchParams);

    if (filters.status && filters.status !== "published") {
      await requireAdmin();
    }

    const result = await getProducts(filters);
    return jsonSuccess(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const data = productCreateSchema.parse(body);

    await connectDB();

    const [collection, category] = await Promise.all([
      Collection.findById(data.collection),
      Category.findById(data.category),
    ]);

    if (!collection) {
      return jsonError("Collection not found", 404);
    }
    if (!category) {
      return jsonError("Category not found", 404);
    }

    const slug = data.slug || slugify(data.name);
    const sku = data.sku || generateSKU();

    const parsed = { ...data } as Record<string, unknown>;
    await sanitizeProductImagePayload(parsed);

    const { sizeGuide, ...rest } = parsed as typeof data;
    const product = await Product.create({
      ...rest,
      slug,
      sku,
      description: sanitizeRichText(data.description),
      ...(sizeGuide ? { sizeGuide } : {}),
    });

    revalidateProductPaths(slug);
    return jsonSuccess(product, 201);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return jsonError("Product with this slug or SKU already exists", 409);
    }
    return handleRouteError(error);
  }
}
