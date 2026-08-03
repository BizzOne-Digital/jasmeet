import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Product from "@/models/Product";
import { productUpdateSchema } from "@/lib/validations/api";
import { revalidateProductPaths } from "@/lib/revalidate";
import { sanitizeRichText } from "@/lib/sanitize";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    await connectDB();
    const product = await Product.findById(id)
      .populate("collection", "name slug")
      .populate("category", "name slug");

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

    if (data.description !== undefined) {
      data.description = sanitizeRichText(data.description);
    }

    const { sizeGuide, ...rest } = data;
    const update: Record<string, unknown> = { ...rest };
    if (sizeGuide === null) {
      update.$unset = { sizeGuide: 1 };
    } else if (sizeGuide !== undefined) {
      update.sizeGuide = sizeGuide;
    }

    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate("collection", "name slug")
      .populate("category", "name slug");

    if (!product) {
      return jsonError("Product not found", 404);
    }

    revalidateProductPaths(product.slug);
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
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return jsonError("Product not found", 404);
    }

    revalidateProductPaths(product.slug);
    return jsonSuccess({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
