import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import PageSection from "@/models/PageSection";
import { pageSectionUpdateSchema } from "@/lib/validations/api";
import { revalidatePublicPaths } from "@/lib/revalidate";
import { sanitizeRichText } from "@/lib/sanitize";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

const slugToPath: Record<string, string> = {
  home: "/",
  about: "/about",
  contact: "/contact",
};

async function revalidatePageForSection(sectionId: string) {
  const section = await PageSection.findById(sectionId).populate("page");
  if (section?.page && typeof section.page === "object" && "slug" in section.page) {
    const slug = (section.page as { slug: string }).slug;
    revalidatePublicPaths([slugToPath[slug] || `/${slug}`]);
  } else {
    revalidatePublicPaths();
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = pageSectionUpdateSchema.parse(body);

    await connectDB();

    if (data.body !== undefined) {
      data.body = sanitizeRichText(data.body);
    }

    const section = await PageSection.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!section) {
      return jsonError("Section not found", 404);
    }

    await revalidatePageForSection(id);
    return jsonSuccess(section);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    await connectDB();
    const section = await PageSection.findById(id).populate<{ page: { slug: string } | null }>("page");
    if (!section) {
      return jsonError("Section not found", 404);
    }

    const pageSlug = section.page?.slug;
    await PageSection.findByIdAndDelete(id);

    if (pageSlug) {
      revalidatePublicPaths([slugToPath[pageSlug] || `/${pageSlug}`]);
    } else {
      revalidatePublicPaths();
    }

    return jsonSuccess({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
