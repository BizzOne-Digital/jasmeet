import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Product from "@/models/Product";
import { productUpdateSchema } from "@/lib/validations/api";
import { revalidateProductPaths } from "@/lib/revalidate";
import { sanitizeRichText } from "@/lib/sanitize";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";
import { sanitizeProductImagePayload } from "@/lib/product-images-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    await connectDB();
    const product = await Product.findById(id)
      .populate("collection", "name slug")
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return jsonError("Product not found", 404);
    }

    return jsonSuccess(product);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = productUpdateSchema.parse(body);

    await connectDB();

    const parsed = { ...data } as Record<string, unknown>;

    if (parsed.description !== undefined) {
      parsed.description = sanitizeRichText(String(parsed.description));
    }

    await sanitizeProductImagePayload(parsed);

    const { sizeGuide, ...rest } = parsed;
    const $set: Record<string, unknown> = { ...rest };
    const update: Record<string, unknown> = { $set };

    if (sizeGuide === null) {
      update.$unset = { sizeGuide: 1 };
    } else if (sizeGuide !== undefined) {
      $set.sizeGuide = sizeGuide;
    }

    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate("collection", "name slug")
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return jsonError("Product not found", 404);
    }

    try {
      revalidateProductPaths(product.slug);
    } catch (revalidateError) {
      console.error("[products PUT] revalidate failed:", revalidateError);
    }

    return jsonSuccess(product);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    await connectDB();
    const product = await Product.findByIdAndDelete(id).lean();

    if (!product) {
      return jsonError("Product not found", 404);
    }

    try {
      revalidateProductPaths(product.slug);
    } catch (revalidateError) {
      console.error("[products DELETE] revalidate failed:", revalidateError);
    }

    return jsonSuccess({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
