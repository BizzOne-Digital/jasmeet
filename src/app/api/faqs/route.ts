import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import FAQ from "@/models/FAQ";
import { faqCreateSchema } from "@/lib/validations/api";
import { revalidatePublicPaths } from "@/lib/revalidate";
import { sanitizeRichText } from "@/lib/sanitize";
import { jsonSuccess, handleRouteError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    if (includeInactive) {
      await requireAdmin();
    }

    await connectDB();
    const filter = includeInactive ? {} : { isActive: true };
    const faqs = await FAQ.find(filter)
      .sort({ category: 1, order: 1 })
      .lean();

    return jsonSuccess(faqs);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const data = faqCreateSchema.parse(body);

    await connectDB();
    const faq = await FAQ.create({
      ...data,
      answer: sanitizeRichText(data.answer),
    });

    revalidatePublicPaths(["/faq"]);
    return jsonSuccess(faq, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
