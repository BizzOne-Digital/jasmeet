import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Product from "@/models/Product";
import GalleryItem from "@/models/GalleryItem";
import FAQ from "@/models/FAQ";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";
import ContactSubmission from "@/models/ContactSubmission";
import { jsonSuccess, handleRouteError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const [
      totalProducts,
      publishedProducts,
      draftProducts,
      galleryCount,
      faqCount,
      newsletterCount,
      contactCount,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: "published" }),
      Product.countDocuments({ status: "draft" }),
      GalleryItem.countDocuments(),
      FAQ.countDocuments(),
      NewsletterSubscriber.countDocuments({ isActive: true }),
      ContactSubmission.countDocuments(),
    ]);

    return jsonSuccess({
      products: {
        total: totalProducts,
        published: publishedProducts,
        draft: draftProducts,
      },
      gallery: galleryCount,
      faqs: faqCount,
      newsletter: newsletterCount,
      contact: contactCount,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
