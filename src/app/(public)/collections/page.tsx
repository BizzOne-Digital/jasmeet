import type { Metadata } from "next";
import Link from "next/link";
import { getCollections, getPageBySlug } from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { PageHero } from "@/components/layout/PageHero";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeText } from "@/lib/utils";
import { getCollectionDescription } from "@/lib/collections";
import { getCollectionImage, getPageHeroImage } from "@/lib/images";

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
    <div className="overflow-x-clip">
      <PageHero
        eyebrow="Collections"
        title="Shop by Collection"
        description="Six signatures — find the energy that matches how you move."
        align="center"
        image={getPageHeroImage("collections")}
      />
      <div className="container-lux section-shell !pt-14 !pb-20 md:!pt-20 md:!pb-28">
        {collections.length === 0 ? (
          <p className="py-16 text-center body-muted">
            Collections are being prepared.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {collections.map((col) => {
              const description = getCollectionDescription(
                col.slug,
                col.name,
                col.description
              );

              return (
                <article key={col._id} className="group flex h-full flex-col">
                  <Link
                    href={`/collections/${col.slug}`}
                    className="img-frame relative block aspect-[16/9] overflow-hidden bg-[#141414] sm:aspect-[16/10] lg:aspect-[3/2]"
                  >
                    <SafeImage
                      src={getCollectionImage(col.slug, col.image)}
                      alt={safeText(col.imageAlt, `${col.name} collection cover`)}
                      fill
                      className="object-contain object-center transition duration-700 group-hover:scale-[1.03]"
                      fallbackLabel={col.name}
                      sizes="(max-width:1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6">
                      <h2 className="font-heading text-xl tracking-[0.04em] text-beige sm:text-2xl lg:text-[1.65rem]">
                        {col.name}
                      </h2>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-beige/65 sm:mt-2">
                        {description}
                      </p>
                      <span className="mt-4 inline-flex min-h-10 items-center border border-gold/60 px-4 text-[10px] uppercase tracking-[0.24em] text-gold transition duration-500 group-hover:bg-gold group-hover:text-black sm:mt-5">
                        Shop Collection
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
