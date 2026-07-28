import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { absoluteUrl, formatPrice, safeText } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/PageHero";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { TrackRecentlyViewed } from "@/components/product/TrackRecentlyViewed";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion } from "@/components/ui/Accordion";
import type { ProductCardData } from "@/components/product/ProductCard";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };

  const title = product.seoTitle || product.name;
  const description =
    product.seoDescription || product.shortDescription || product.description;
  const image = product.images?.[0];

  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/products/${slug}`),
      type: "website",
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const productRaw = await getProductBySlug(slug);
  if (!productRaw) notFound();

  const product = serialize<{
    _id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    images?: string[];
    colors?: Array<{ name: string; hex: string }>;
    sizes?: Array<{ size: string; stock: number }>;
    shortDescription?: string;
    description?: string;
    materials?: string;
    careInstructions?: string;
    fitDetails?: string;
    hiddenMessage?: string;
    highlights?: string[];
    collection?: { _id?: string; name?: string; slug?: string } | null;
    category?: { name?: string; slug?: string } | null;
  }>(productRaw);

  const relatedRaw = product.collection?._id
    ? await getRelatedProducts(product._id, String(product.collection._id), 4)
    : [];
  const related = serialize<ProductCardData[]>(relatedRaw);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description || "",
    image: product.images?.filter(Boolean) || [],
    sku: product.slug,
    brand: { "@type": "Brand", name: "DAYAURA" },
    offers: {
      "@type": "Offer",
      priceCurrency: "CAD",
      price: product.price,
      availability: product.sizes?.some((s) => s.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/products/${slug}`),
    },
  };

  const detailItems = [
    product.description
      ? { id: "desc", title: "Description", content: product.description }
      : null,
    product.highlights?.length
      ? {
          id: "highlights",
          title: "Highlights",
          content: (
            <ul className="list-disc space-y-1 pl-5">
              {product.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          ),
        }
      : null,
    product.materials
      ? { id: "materials", title: "Materials", content: product.materials }
      : null,
    product.careInstructions
      ? { id: "care", title: "Care", content: product.careInstructions }
      : null,
    product.fitDetails
      ? { id: "fit", title: "Fit", content: product.fitDetails }
      : null,
    {
      id: "shipping",
      title: "Shipping & returns",
      content: (
        <>
          Free shipping on orders over CAD $100. Returns accepted within 14 days
          for unworn items with tags.{" "}
          <Link href="/shipping-returns" className="text-gold underline">
            Full policy
          </Link>
        </>
      ),
    },
  ].filter(Boolean) as Array<{ id: string; title: string; content: ReactNode }>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={jsonLd} />
      <TrackRecentlyViewed productId={product._id} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(product.collection?.slug
            ? [
                {
                  label: safeText(product.collection.name),
                  href: `/collections/${product.collection.slug}`,
                },
              ]
            : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images || []} alt={product.name} />
        <div className="space-y-10">
          <ProductPurchasePanel product={product} />

          {product.hiddenMessage ? (
            <div className="border border-gold/30 bg-gold/5 p-6">
              <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
                Hidden message
              </p>
              <p className="mt-3 font-heading text-2xl tracking-wide text-beige">
                “{safeText(product.hiddenMessage)}”
              </p>
              <p className="mt-3 text-xs text-muted">
                A private reminder of your strength — sewn into every DAYAURA piece.
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em] text-muted">
            <span>Share</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl(`/products/${slug}`))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(absoluteUrl(`/products/${slug}`))}&text=${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold"
            >
              X
            </a>
          </div>

          <Accordion items={detailItems} />
        </div>
      </div>

      {related.length ? (
        <section className="mt-20">
          <h2 className="mb-8 font-heading text-3xl tracking-wide">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      ) : null}

      <section className="mt-16 border-t border-white/10 pt-10">
        <h2 className="font-heading text-2xl">Customer notes</h2>
        <p className="mt-3 text-sm text-muted">
          Reviews are coming soon. Until then, explore{" "}
          <Link href="/testimonials" className="text-gold">
            community stories
          </Link>
          .
        </p>
        <p className="mt-2 text-xs text-muted">
          From {formatPrice(product.price)} — CAD pricing.
        </p>
      </section>
    </div>
  );
}
