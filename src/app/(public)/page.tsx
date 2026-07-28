import type { Metadata } from "next";
import { getPageBySlug, getPageSections, getCollections, getFeaturedProducts, getNewArrivals, getGalleryItems } from "@/lib/data/queries";
import { getSiteSettings } from "@/lib/data/settings";
import { serialize } from "@/lib/serialize";
import { getCollectionImage, resolveImage } from "@/lib/images";
import type { PageSectionData } from "@/types";
import type { ProductCardData } from "@/components/product/ProductCard";
import { HeroSection } from "@/components/home/HeroSection";
import { AnnouncementStrip } from "@/components/home/AnnouncementStrip";
import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandStory } from "@/components/home/BrandStory";
import { HiddenMessageSection } from "@/components/home/HiddenMessageSection";
import { MovementCategories } from "@/components/home/MovementCategories";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import { CampaignBanner } from "@/components/home/CampaignBanner";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    getPageBySlug("home"),
    getSiteSettings(),
  ]);

  return {
    title: page?.seoTitle || settings.seoTitle,
    description: page?.seoDescription || page?.description || settings.seoDescription,
    alternates: { canonical: "/" },
  };
}

function toSection(raw: Record<string, unknown>): PageSectionData {
  return {
    _id: String(raw._id),
    sectionKey: String(raw.sectionKey || ""),
    internalName: String(raw.internalName || ""),
    eyebrow: raw.eyebrow ? String(raw.eyebrow) : undefined,
    heading: raw.heading ? String(raw.heading) : undefined,
    subheading: raw.subheading ? String(raw.subheading) : undefined,
    body: raw.body ? String(raw.body) : undefined,
    ctaLabel: raw.ctaLabel ? String(raw.ctaLabel) : undefined,
    ctaUrl: raw.ctaUrl ? String(raw.ctaUrl) : undefined,
    backgroundImage: raw.backgroundImage ? String(raw.backgroundImage) : undefined,
    sideImage: raw.sideImage ? String(raw.sideImage) : undefined,
    mobileImage: raw.mobileImage ? String(raw.mobileImage) : undefined,
    imageAlt: raw.imageAlt ? String(raw.imageAlt) : undefined,
    backgroundColor: raw.backgroundColor ? String(raw.backgroundColor) : undefined,
    theme: (raw.theme as PageSectionData["theme"]) || "dark",
    alignment: (raw.alignment as PageSectionData["alignment"]) || "left",
    isVisible: Boolean(raw.isVisible),
    order: Number(raw.order || 0),
    status: (raw.status as PageSectionData["status"]) || "published",
  };
}

export default async function HomePage() {
  const [sectionsRaw, collectionsRaw, featuredRaw, newRaw, galleryRaw] =
    await Promise.all([
      getPageSections("home"),
      getCollections(),
      getFeaturedProducts(8),
      getNewArrivals(8),
      getGalleryItems(),
    ]);

  const sections = serialize<Record<string, unknown>[]>(sectionsRaw).map((s) =>
    toSection(s)
  );
  const collections = serialize<
    Array<{
      _id: string;
      name: string;
      slug: string;
      description?: string;
      image?: string;
      imageAlt?: string;
    }>
  >(collectionsRaw).map((c) => ({
    ...c,
    image: resolveImage(getCollectionImage(c.slug), c.image),
  }));
  const featured = serialize<ProductCardData[]>(featuredRaw);
  const arrivals = serialize<ProductCardData[]>(newRaw);
  const gallery = serialize<
    Array<{
      _id: string;
      image: string;
      altText?: string;
      caption?: string;
    }>
  >(galleryRaw);

  if (!sections.length) {
    return <HeroSection />;
  }

  return (
    <div>
      {sections.map((section) => {
        switch (section.sectionKey) {
          case "hero":
            return <HeroSection key={section._id} />;
          case "announcement":
            return <AnnouncementStrip key={section._id} section={section} />;
          case "collections":
            return (
              <CollectionsShowcase
                key={section._id}
                section={section}
                collections={collections}
              />
            );
          case "featured-products":
            return (
              <FeaturedProducts
                key={section._id}
                section={section}
                products={featured}
              />
            );
          case "brand-story":
            return <BrandStory key={section._id} section={section} />;
          case "hidden-message":
            return <HiddenMessageSection key={section._id} section={section} />;
          case "shop-by-movement":
            return <MovementCategories key={section._id} section={section} />;
          case "new-arrivals":
            return (
              <NewArrivalsSection
                key={section._id}
                section={section}
                products={arrivals}
              />
            );
          case "campaign-banner":
            return <CampaignBanner key={section._id} section={section} />;
          case "testimonials":
            return <TestimonialsSection key={section._id} section={section} />;
          case "gallery-preview":
            return (
              <GalleryPreview
                key={section._id}
                section={section}
                items={gallery}
              />
            );
          case "newsletter":
            return <NewsletterSection key={section._id} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
