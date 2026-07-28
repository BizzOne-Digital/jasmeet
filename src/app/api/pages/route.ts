import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Page from "@/models/Page";
import { jsonSuccess, handleRouteError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();

    await connectDB();
    const pages = await Page.find().sort({ title: 1 }).lean();

    return jsonSuccess(pages);
  } catch (error) {
    return handleRouteError(error);
  }
}
