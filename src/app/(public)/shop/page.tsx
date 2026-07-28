import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getProducts,
  getCollections,
  getCategories,
  getPageBySlug,
} from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";
import type { ProductCardData } from "@/components/product/ProductCard";
import type { ProductFilters as FilterInput } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("shop");
  return {
    title: page?.seoTitle || "Shop",
    description:
      page?.seoDescription ||
      page?.description ||
      "Shop all DAYAURA premium women's activewear.",
    alternates: { canonical: "/shop" },
  };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(first(params.page) || 1));
  const sort = (first(params.sort) || "newest") as FilterInput["sort"];
  const sizes = first(params.sizes)?.split(",").filter(Boolean);

  const filters: FilterInput = {
    search: first(params.q) || first(params.search),
    collection: first(params.collection),
    category: first(params.category),
    sizes,
    minPrice: first(params.minPrice) ? Number(first(params.minPrice)) : undefined,
    maxPrice: first(params.maxPrice) ? Number(first(params.maxPrice)) : undefined,
    inStock: first(params.inStock) === "true",
    featured: first(params.featured) === "true",
    newArrival: first(params.newArrival) === "true",
    onSale: first(params.onSale) === "true",
    sort,
    page,
    limit: 12,
  };

  const [result, collectionsRaw, categoriesRaw] = await Promise.all([
    getProducts(filters),
    getCollections(),
    getCategories(),
  ]);

  const products = serialize<ProductCardData[]>(result.products);
  const collections = serialize<Array<{ name: string; slug: string }>>(collectionsRaw);
  const categories = serialize<Array<{ name: string; slug: string }>>(categoriesRaw);

  const queryForPagination: Record<string, string | undefined> = {
    q: filters.search,
    collection: filters.collection,
    category: filters.category,
    sizes: sizes?.join(","),
    minPrice: first(params.minPrice),
    maxPrice: first(params.maxPrice),
    inStock: filters.inStock ? "true" : undefined,
    featured: filters.featured ? "true" : undefined,
    newArrival: filters.newArrival ? "true" : undefined,
    onSale: filters.onSale ? "true" : undefined,
    sort: filters.sort,
  };

  return (
    <div>
      <PageHero
        eyebrow="Shop"
        title="All Products"
        description={`${result.total} piece${result.total === 1 ? "" : "s"} designed for movement and presence.`}
        image={getPageHeroImage("shop")}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[240px_1fr] lg:px-8">
        <Suspense fallback={<div className="text-sm text-muted">Loading filters…</div>}>
          <ProductFilters collections={collections} categories={categories} />
        </Suspense>
        <div>
          <ProductGrid
            products={products}
            emptyMessage="No products match your filters. Try clearing filters or browsing collections."
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/shop"
            searchParams={queryForPagination}
          />
        </div>
      </div>
    </div>
  );
}
