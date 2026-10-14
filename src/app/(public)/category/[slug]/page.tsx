import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts } from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { absoluteUrl, safeText } from "@/lib/utils";
import { PageHero, Breadcrumbs } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";
import type { ProductCardData } from "@/components/product/ProductCard";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category" };

  return {
    title: category.name,
    description: category.description || `Shop ${category.name} at DAYAURA.`,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: category.name,
      description: category.description || `Shop ${category.name} at DAYAURA.`,
      url: absoluteUrl(`/category/${slug}`),
      images: category.image ? [{ url: category.image }] : undefined,
    },
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page || 1));

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const result = await getProducts({ category: slug, page, limit: 12 });
  const products = serialize<ProductCardData[]>(result.products);
  const cat = serialize<{
    name: string;
    slug: string;
    description?: string;
    image?: string;
  }>(category);

  return (
    <div>
      <PageHero
        eyebrow="Category"
        title={safeText(cat.name)}
        description={safeText(cat.description)}
        image={cat.image || getPageHeroImage("shop")}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: cat.name },
          ]}
        />
        <ProductGrid products={products} emptyMessage="No products in this category yet." />
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          basePath={`/category/${slug}`}
        />
      </div>
    </div>
  );
}
