import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import FAQ from "@/models/FAQ";
import { faqUpdateSchema } from "@/lib/validations/api";
import { revalidatePublicPaths } from "@/lib/revalidate";
import { sanitizeRichText } from "@/lib/sanitize";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = faqUpdateSchema.parse(body);

    await connectDB();

    if (data.answer !== undefined) {
      data.answer = sanitizeRichText(data.answer);
    }

    const faq = await FAQ.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!faq) {
      return jsonError("FAQ not found", 404);
    }

    revalidatePublicPaths(["/faq"]);
    return jsonSuccess(faq);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    await connectDB();
    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return jsonError("FAQ not found", 404);
    }

    revalidatePublicPaths(["/faq"]);
    return jsonSuccess({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
