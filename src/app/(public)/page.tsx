import type { Metadata } from "next";
import dynamic from "next/dynamic";
import {
  getPageBySlug,
  getPageSections,
  getCollections,
  getFeaturedProducts,
  getNewArrivals,
  getGalleryItems,
} from "@/lib/data/queries";
import { getSiteSettings } from "@/lib/data/settings";
import { serialize } from "@/lib/serialize";
import { absoluteUrl } from "@/lib/utils";
import { getCollectionImage } from "@/lib/images";
import type { PageSectionData } from "@/types";
import type { ProductCardData } from "@/components/product/ProductCard";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { MovementCategories } from "@/components/home/MovementCategories";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";

/** Below-fold sections — lazy-loaded to keep initial JS/LCP lighter. */
const CampaignBanner = dynamic(() =>
  import("@/components/home/CampaignBanner").then((m) => m.CampaignBanner)
);
const TestimonialsSection = dynamic(() =>
  import("@/components/home/TestimonialsSection").then(
    (m) => m.TestimonialsSection
  )
);
const GalleryPreview = dynamic(() =>
  import("@/components/home/GalleryPreview").then((m) => m.GalleryPreview)
);
const NewsletterSection = dynamic(() =>
  import("@/components/home/NewsletterSection").then((m) => m.NewsletterSection)
);

/** Fixed homepage order (Footer lives in the site layout). */
const HOME_LAYOUT = [
  "hero",
  "trust",
  "collections",
  "featured-products",
  "shop-by-movement",
  "new-arrivals",
  "campaign-banner",
  "testimonials",
  "gallery-preview",
  "newsletter",
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    getPageBySlug("home"),
    getSiteSettings(),
  ]);

  const title = page?.seoTitle || settings.seoTitle;
  const description =
    page?.seoDescription || page?.description || settings.seoDescription;
  const ogImage = absoluteUrl("/images/hero-1.png");

  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title: title || undefined,
      description: description || undefined,
      url: absoluteUrl("/"),
      images: [{ url: ogImage, alt: "DAYAURA" }],
    },
    twitter: {
      card: "summary_large_image",
      title: title || undefined,
      description: description || undefined,
      images: [ogImage],
    },
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
    backgroundImage: raw.backgroundImage
      ? String(raw.backgroundImage)
      : undefined,
    sideImage: raw.sideImage ? String(raw.sideImage) : undefined,
    mobileImage: raw.mobileImage ? String(raw.mobileImage) : undefined,
    imageAlt: raw.imageAlt ? String(raw.imageAlt) : undefined,
    backgroundColor: raw.backgroundColor
      ? String(raw.backgroundColor)
      : undefined,
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

  const byKey = new Map(
    serialize<Record<string, unknown>[]>(sectionsRaw)
      .map(toSection)
      .map((s) => [s.sectionKey, s] as const)
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
    image: getCollectionImage(c.slug),
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

  return (
    <div className="overflow-x-clip">
      {HOME_LAYOUT.map((key) => {
        const section = byKey.get(key);

        switch (key) {
          case "hero":
            return <HeroSection key="hero" />;
          case "trust":
            return <TrustSection key="trust" />;
          case "collections":
            return (
              <CollectionsShowcase
                key="collections"
                section={
                  section || {
                    eyebrow: "Featured Collections",
                    heading: "Shop by Collection",
                    subheading:
                      "Editorial silhouettes for every rhythm of movement.",
                  }
                }
                collections={collections}
              />
            );
          case "featured-products":
            return (
              <FeaturedProducts
                key="best-sellers"
                section={
                  section || {
                    eyebrow: "Bestsellers",
                    heading: "Best Sellers",
                    subheading:
                      "Pieces women return to — sculpted, soft, and performance-ready.",
                    ctaLabel: "Shop best sellers",
                    ctaUrl: "/shop?featured=true",
                  }
                }
                products={featured}
              />
            );
          case "shop-by-movement":
            return (
              <MovementCategories
                key="movement"
                section={
                  section || {
                    eyebrow: "Shop by movement",
                    heading: "Move your way.",
                    subheading:
                      "From high-intensity training to quiet mornings — find your rhythm.",
                  }
                }
              />
            );
          case "new-arrivals":
            return (
              <NewArrivalsSection
                key="new-arrivals"
                section={
                  section || {
                    eyebrow: "Just in",
                    heading: "New Arrivals",
                    subheading: "Fresh silhouettes for the season ahead.",
                    ctaLabel: "Shop new",
                    ctaUrl: "/shop?newArrival=true",
                  }
                }
                products={arrivals}
              />
            );
          case "campaign-banner":
            return (
              <CampaignBanner
                key="campaign"
                section={
                  section || {
                    eyebrow: "Campaign",
                    heading: "This season’s aura.",
                    body: "Bold lines. Soft strength. A collection made to be lived in — and remembered.",
                    ctaLabel: "Shop the campaign",
                    ctaUrl: "/shop",
                  }
                }
              />
            );
          case "testimonials":
            return (
              <TestimonialsSection
                key="reviews"
                section={
                  section || {
                    eyebrow: "Customer Reviews",
                    heading: "Loved by the community.",
                    subheading: "Real stories from women who wear DAYAURA.",
                  }
                }
              />
            );
          case "gallery-preview":
            return (
              <GalleryPreview
                key="instagram"
                section={
                  section || {
                    eyebrow: "Instagram",
                    heading: "In the wild.",
                    subheading:
                      "A glimpse of DAYAURA in motion — gym floors, studio light, city mornings.",
                    ctaLabel: "View gallery",
                    ctaUrl: "/gallery",
                  }
                }
                items={gallery}
              />
            );
          case "newsletter":
            return (
              <NewsletterSection
                key="newsletter"
                section={
                  section || {
                    eyebrow: "Newsletter",
                    heading: "Stay in the aura.",
                    subheading:
                      "New drops, exclusive offers, and motivational notes — straight to your inbox.",
                  }
                }
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
