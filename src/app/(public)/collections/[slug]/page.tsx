import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionBySlug, getProducts } from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { absoluteUrl, safeText } from "@/lib/utils";
import { PageHero, Breadcrumbs } from "@/components/layout/PageHero";
import { getCollectionImage, COLLECTION_HERO_POSITION } from "@/lib/images";
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
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection" };

  return {
    title: collection.seoTitle || collection.name,
    description: collection.seoDescription || collection.description,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      title: collection.seoTitle || collection.name,
      description: collection.seoDescription || collection.description,
      url: absoluteUrl(`/collections/${slug}`),
      images: collection.image ? [{ url: collection.image }] : undefined,
    },
  };
}

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page || 1));

  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const result = await getProducts({ collection: slug, page, limit: 12 });
  const products = serialize<ProductCardData[]>(result.products);
  const col = serialize<{
    name: string;
    slug: string;
    description?: string;
    image?: string;
  }>(collection);

  return (
    <div className="overflow-x-clip">
      <PageHero
        eyebrow="Collection"
        title={safeText(col.name)}
        description={safeText(col.description)}
        image={getCollectionImage(col.slug)}
        imagePositionClass={
          COLLECTION_HERO_POSITION[col.slug] || "object-center"
        }
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", href: "/collections" },
            { label: col.name },
          ]}
        />
        <ProductGrid products={products} emptyMessage="No products in this collection yet." />
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          basePath={`/collections/${slug}`}
        />
      </div>
    </div>
  );
}
