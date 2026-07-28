import { connectDB } from "@/lib/mongodb";
import { auth, requireAdmin } from "@/lib/auth";
import Page from "@/models/Page";
import PageSection from "@/models/PageSection";
import { pageSectionCreateSchema } from "@/lib/validations/api";
import { revalidatePublicPaths } from "@/lib/revalidate";
import { sanitizeRichText } from "@/lib/sanitize";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";

type RouteParams = { params: Promise<{ slug: string }> };

const slugToPath: Record<string, string> = {
  home: "/",
  about: "/about",
  contact: "/contact",
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const session = await auth();
    const isAdmin = !!session?.user;

    await connectDB();
    const page = await Page.findOne({ slug }).lean();
    if (!page) {
      return jsonError("Page not found", 404);
    }

    const filter: Record<string, unknown> = { page: page._id };
    if (!isAdmin) {
      filter.status = "published";
      filter.isVisible = true;
    }

    const sections = await PageSection.find(filter).sort({ order: 1 }).lean();
    return jsonSuccess(sections);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { slug } = await params;
    const body = await request.json();
    const data = pageSectionCreateSchema.parse(body);

    await connectDB();
    const page = await Page.findOne({ slug });
    if (!page) {
      return jsonError("Page not found", 404);
    }

    const section = await PageSection.create({
      ...data,
      page: page._id,
      body: data.body ? sanitizeRichText(data.body) : undefined,
    });

    revalidatePublicPaths([slugToPath[slug] || `/${slug}`]);
    return jsonSuccess(section, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
