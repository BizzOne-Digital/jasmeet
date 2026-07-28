import type { Metadata } from "next";
import { getGalleryItems, getCollections, getPageBySlug } from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage, GALLERY_IMAGES } from "@/lib/images";
import { GalleryClient } from "@/components/gallery/GalleryClient";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("gallery");
  return {
    title: page?.seoTitle || "Gallery",
    description:
      page?.seoDescription ||
      page?.description ||
      "Campaign imagery and movement moments from DAYAURA.",
    alternates: { canonical: "/gallery" },
  };
}

export default async function GalleryPage() {
  const [itemsRaw, collectionsRaw] = await Promise.all([
    getGalleryItems(),
    getCollections(),
  ]);

  const items = (
    itemsRaw.length
      ? serialize<
          Array<{
            _id: string;
            image: string;
            caption?: string;
            altText?: string;
            collection?: { name?: string; slug?: string } | null;
          }>
        >(itemsRaw)
      : GALLERY_IMAGES.map((image, i) => ({
          _id: `fallback-${i}`,
          image,
          caption: `DAYAURA campaign ${i + 1}`,
          altText: `DAYAURA gallery ${i + 1}`,
          collection: null,
        }))
  );
  const collections = serialize<Array<{ name: string; slug: string }>>(collectionsRaw);

  return (
    <div>
      <PageHero
        eyebrow="Gallery"
        title="In Motion"
        description="Campaign frames and community moments from the DAYAURA world."
        align="center"
        image={getPageHeroImage("gallery")}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <GalleryClient items={items} collections={collections} />
      </div>
    </div>
  );
}
