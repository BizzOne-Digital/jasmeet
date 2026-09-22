import type { Metadata } from "next";
import Link from "next/link";
import {
  searchProducts,
  searchCollections,
} from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage, getCollectionImage } from "@/lib/images";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchBox } from "@/components/search/SearchBox";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeText } from "@/lib/utils";
import type { ProductCardData } from "@/components/product/ProductCard";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  return {
    title: q ? `Search: ${q}` : "Search",
    description: "Search DAYAURA products and collections.",
    alternates: { canonical: "/search" },
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() || "";

  const [productResult, collectionHits] = q
    ? await Promise.all([searchProducts(q, 24), searchCollections(q, 8)])
    : [{ products: [], total: 0 }, []];

  const products = serialize<ProductCardData[]>(productResult.products);
  const collections = serialize<
    Array<{
      _id: string;
      name: string;
      slug: string;
      description?: string;
    }>
  >(collectionHits);

  return (
    <div>
      <PageHero
        eyebrow="Search"
        title={q ? `Results for “${q}”` : "Search"}
        description={
          q
            ? `${productResult.total} product${productResult.total === 1 ? "" : "s"}${
                collections.length
                  ? ` · ${collections.length} collection${collections.length === 1 ? "" : "s"}`
                  : ""
              }`
            : "Find pieces and collections across the DAYAURA archive."
        }
        image={getPageHeroImage("search")}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SearchBox initialQuery={q} autoFocus={!q} />

        {q ? (
          <div className="space-y-14">
            {collections.length > 0 ? (
              <section>
                <h2 className="mb-6 font-heading text-2xl tracking-wide">
                  Collections
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {collections.map((col) => (
                    <Link
                      key={col._id}
                      href={`/collections/${col.slug}`}
                      className="group flex items-center gap-4 border border-white/10 p-3 transition hover:border-[#D4AF37]/40"
                    >
                      <span className="relative h-20 w-28 shrink-0 overflow-hidden bg-[#141414]">
                        <SafeImage
                          src={getCollectionImage(col.slug)}
                          alt={col.name}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="112px"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-heading text-xl text-beige">
                          {col.name}
                        </span>
                        {col.description ? (
                          <span className="mt-1 line-clamp-2 text-xs text-muted">
                            {safeText(col.description)}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <h2 className="mb-6 font-heading text-2xl tracking-wide">
                Products
              </h2>
              <ProductGrid
                products={products}
                emptyMessage={`No products matched “${q}”. Try another term or browse the shop.`}
              />
            </section>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Popular starting points:{" "}
            <Link href="/collections/aurawave" className="text-gold">
              AuraWave
            </Link>
            ,{" "}
            <Link href="/collections/auraimpact" className="text-gold">
              AuraImpact
            </Link>
            ,{" "}
            <Link href="/shop" className="text-gold">
              Shop all
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
