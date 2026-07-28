import type { Metadata } from "next";
import Link from "next/link";
import { getCollections, getPageBySlug } from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { PageHero } from "@/components/layout/PageHero";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeText } from "@/lib/utils";
import { getCollectionImage, getPageHeroImage, resolveImage } from "@/lib/images";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("collections");
  return {
    title: page?.seoTitle || "Collections",
    description:
      page?.seoDescription ||
      page?.description ||
      "Explore AuraWave, AuraImpact, AuraFlow, AuraMesh, and more.",
    alternates: { canonical: "/collections" },
  };
}

export default async function CollectionsPage() {
  const collections = serialize<
    Array<{
      _id: string;
      name: string;
      slug: string;
      description?: string;
      image?: string;
      imageAlt?: string;
    }>
  >(await getCollections());

  return (
    <div>
      <PageHero
        eyebrow="Collections"
        title="Shop by Collection"
        description="Four signatures and finishing layers — find the energy that matches how you move."
        align="center"
        image={getPageHeroImage("collections")}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {collections.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">
            Collections are being prepared.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((col) => (
              <Link
                key={col._id}
                href={`/collections/${col.slug}`}
                className="group relative aspect-[3/4] overflow-hidden bg-surface"
              >
                <SafeImage
                  src={resolveImage(getCollectionImage(col.slug), col.image)}
                  alt={safeText(col.imageAlt, col.name)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  fallbackLabel={col.name}
                  sizes="(max-width:1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h2 className="font-heading text-3xl text-beige">{col.name}</h2>
                  {col.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-beige/70">
                      {col.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
