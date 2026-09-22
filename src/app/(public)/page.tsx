import type { Metadata } from "next";
import dynamic from "next/dynamic";
import {
  getPageBySlug,
  getPageSections,
  getCollections,
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/data/queries";
import { getSiteSettings } from "@/lib/data/settings";
import { serialize } from "@/lib/serialize";
import { absoluteUrl } from "@/lib/utils";
import { getCollectionImage } from "@/lib/images";
import { resolveHeroSlides } from "@/lib/hero-cms";
import type { PageSectionData } from "@/types";
import type { ProductCardData } from "@/components/product/ProductCard";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";

const TestimonialsSection = dynamic(() =>
  import("@/components/home/TestimonialsSection").then(
    (m) => m.TestimonialsSection
  )
);
const NewsletterSection = dynamic(() =>
  import("@/components/home/NewsletterSection").then(
    (m) => m.NewsletterSection
  )
);

/** Fixed homepage order (Footer lives in the site layout). */
const HOME_LAYOUT = [
  "hero",
  "trust",
  "collections",
  "new-arrivals",
  "featured-products",
  "testimonials",
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
  const [sectionsRaw, collectionsRaw, featuredRaw, newRaw] = await Promise.all([
    getPageSections("home"),
    getCollections(),
    getFeaturedProducts(8),
    getNewArrivals(8),
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
    image: getCollectionImage(c.slug, c.image),
  }));
  const featured = serialize<ProductCardData[]>(featuredRaw);
  const arrivals = serialize<ProductCardData[]>(newRaw);

  const heroSlides = resolveHeroSlides(byKey);

  return (
    <div className="overflow-x-clip">
      {HOME_LAYOUT.map((key) => {
        const section = byKey.get(key);

        switch (key) {
          case "hero":
            return <HeroSection key="hero" />;
          case "trust":
            return <TrustSection key="trust" section={section} />;
          case "collections":
            return (
              <CollectionsShowcase
                key="collections"
                section={
                  section || {
                    eyebrow: "Featured Collections",
                    heading: "Shop by Collection",
                    subheading:
                      "Six curated worlds — each designed for a different rhythm of movement.",
                  }
                }
                collections={collections}
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
                    subheading:
                      "Fresh pieces designed for movement, confidence and everyday wear.",
                    ctaLabel: "Shop new",
                    ctaUrl: "/shop?newArrival=true",
                  }
                }
                products={arrivals}
              />
            );
          case "featured-products":
            return (
              <FeaturedProducts
                key="featured-picks"
                section={
                  section || {
                    eyebrow: "Curated for you",
                    heading: "Featured Picks",
                    subheading:
                      "Hand-selected styles from across the DAYAURA collections.",
                    ctaLabel: "Shop featured",
                    ctaUrl: "/shop?featured=true",
                  }
                }
                products={featured}
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
