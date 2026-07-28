import type { Metadata } from "next";
import Link from "next/link";
import { searchProducts } from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";
import { ProductGrid } from "@/components/product/ProductGrid";
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
    description: "Search DAYAURA products.",
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

  const result = q
    ? await searchProducts(q, 24)
    : { products: [], total: 0, page: 1, totalPages: 0 };
  const products = serialize<ProductCardData[]>(result.products);

  return (
    <div>
      <PageHero
        eyebrow="Search"
        title={q ? `Results for “${q}”` : "Search"}
        description={
          q
            ? `${result.total} product${result.total === 1 ? "" : "s"} found`
            : "Enter a keyword to find pieces across collections."
        }
        image={getPageHeroImage("search")}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <form action="/search" method="get" className="mb-10 flex max-w-xl gap-3">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search products…"
            className="h-11 flex-1 border border-white/15 bg-transparent px-4 text-sm outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="h-11 bg-gold px-6 text-xs uppercase tracking-[0.18em] text-black"
          >
            Search
          </button>
        </form>

        {q ? (
          <ProductGrid
            products={products}
            emptyMessage={`No products matched “${q}”. Try another term or browse the shop.`}
          />
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
