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
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { RecentlyViewedProducts } from "@/components/product/RecentlyViewedProducts";
import { TrackRecentlyViewed } from "@/components/product/TrackRecentlyViewed";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion } from "@/components/ui/Accordion";
import { SizeGuideTable } from "@/components/product/SizeGuideTable";
import { sizeGuideHasContent, type SizeGuideData } from "@/lib/size-guide";
import { productHasAnyStock } from "@/lib/inventory";
import type { ProductCardData } from "@/components/product/ProductCard";

type Params = Promise<{ slug: string }>;

/** Split care/fit into bullet lines (newlines, bullets, sentences, or capitalized phrases). */
function splitInstructionLines(text?: string | null): string[] {
  if (!text?.trim()) return [];

  const clean = (line: string) =>
    line.replace(/^[\s•\-–—*]+/, "").replace(/\.+$/, "").trim();

  const byNewline = text
    .split(/\r?\n+/)
    .map(clean)
    .filter(Boolean);
  if (byNewline.length > 1) return byNewline;

  const single = byNewline[0] || text.trim();
  const byBullet = single
    .split(/\s*[•·]\s*/)
    .map(clean)
    .filter(Boolean);
  if (byBullet.length > 1) return byBullet;

  // "True to size. Model wears size Small." → two points
  const bySentence = single
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map(clean)
    .filter(Boolean);
  if (bySentence.length > 1) return bySentence;

  const byCaps = single
    .split(/(?<=\S) (?=[A-Z])/)
    .map(clean)
    .filter(Boolean);
  return byCaps.length > 1 ? byCaps : [clean(single) || single];
}

/** "75% Nylon, 25% Spandex" → ["75% Nylon", "25% Spandex"] */
function splitMaterials(text?: string | null): string[] {
  if (!text?.trim()) return [];

  const byNewline = text
    .split(/\r?\n+/)
    .map((line) => line.replace(/^[\s•\-–—*]+/, "").trim())
    .filter(Boolean);
  if (byNewline.length > 1) return byNewline;

  const byComma = text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return byComma.length > 1 ? byComma : [text.trim()];
}

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
    colors?: Array<{ name: string; hex: string; images?: string[] }>;
    sizes?: Array<{ size: string; stock: number }>;
    inventory?: Array<{ colorName: string; size: string; stock: number }>;
    shortDescription?: string;
    description?: string;
    materials?: string;
    careInstructions?: string;
    fitDetails?: string;
    hiddenMessage?: string;
    highlights?: string[];
    modelInfo?: string;
    sizeGuide?: SizeGuideData | null;
    featureTabs?: Array<{ id: string; title: string; image: string }>;
    isOnSale?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    isComingSoon?: boolean;
    allowPreOrder?: boolean;
    preOrderLeadTime?: string;
    collection?: { _id?: string; name?: string; slug?: string } | null;
    category?: { name?: string; slug?: string } | null;
  }>(productRaw);

  const relatedRaw = product.collection?._id
    ? await getRelatedProducts(product._id, String(product.collection._id), 4)
    : [];
  const related = serialize<ProductCardData[]>(relatedRaw);

  const hasStock = productHasAnyStock(product);
  const preOrderAvailable = Boolean(product.allowPreOrder) && !product.isComingSoon;

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
      availability: hasStock
        ? "https://schema.org/InStock"
        : preOrderAvailable
          ? "https://schema.org/PreOrder"
          : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/products/${slug}`),
    },
  };

  const careItems = splitInstructionLines(product.careInstructions);
  const fitItems = splitInstructionLines(product.fitDetails);
  const materialItems = splitMaterials(product.materials);

  const detailItems = [
    product.description
      ? {
          id: "desc",
          title: "Product description",
          content: product.description,
        }
      : null,
    product.highlights?.length
      ? {
          id: "features",
          title: "Features",
          content: (
            <ul className="list-disc space-y-1.5 pl-5">
              {product.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          ),
        }
      : null,
    materialItems.length
      ? {
          id: "fabric",
          title: "Fabric composition",
          content: (
            <ul className="list-disc space-y-1.5 pl-5">
              {materialItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ),
        }
      : null,
    careItems.length
      ? {
          id: "care",
          title: "Care instructions",
          content: (
            <ul className="list-disc space-y-1.5 pl-5">
              {careItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ),
        }
      : null,
    fitItems.length
      ? {
          id: "fit",
          title: "Fit",
          content: (
            <ul className="list-disc space-y-1.5 pl-5">
              {fitItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ),
        }
      : null,
    sizeGuideHasContent(product.sizeGuide)
      ? {
          id: "size-guide",
          title: "Size guide",
          content: <SizeGuideTable guide={product.sizeGuide!} />,
        }
      : null,
    ...(product.featureTabs || [])
      .filter((tab) => tab?.title && tab?.image)
      .map((tab) => ({
        id: tab.id || tab.title.toLowerCase().replace(/\s+/g, "-"),
        title: tab.title,
        content: (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tab.image}
            alt={tab.title}
            className="mx-auto w-full max-w-2xl rounded-sm border border-white/10 object-contain"
          />
        ),
      })),
    {
      id: "shipping",
      title: "Shipping & Returns",
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-beige/70">
          <p>
            Standard shipping CAD $9.99. Free shipping on orders over CAD $99.
          </p>
          <p>In-stock items process in 1–2 business days; delivery 2–7 business days.</p>
          {product.allowPreOrder ? (
            <p>
              Pre-order items ship when restocked — estimated timing is shown on
              the product page and in your cart.
            </p>
          ) : null}
          <p>
            Returns accepted within 14 days for unworn items with tags attached.
          </p>
          <p>
            <Link href="/shipping-returns" className="text-gold underline">
              Read the full shipping & returns policy
            </Link>
          </p>
        </div>
      ),
    },
  ].filter(Boolean) as Array<{ id: string; title: string; content: ReactNode }>;

  return (
    <div className="mx-auto w-full max-w-7xl overflow-x-clip px-4 py-10 sm:px-6 lg:px-8">
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

      <ProductDetailClient product={product}>
        {product.hiddenMessage ? (
          <div className="relative overflow-hidden border border-[#D4AF37]/35 bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-transparent p-6 sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#D4AF37]">
              Hidden motivational message
            </p>
            <p className="mt-4 font-heading text-2xl tracking-wide text-beige sm:text-3xl">
              “{safeText(product.hiddenMessage)}”
            </p>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-muted">
              A private reminder of your strength — discreetly placed inside
              every DAYAURA piece.
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
      </ProductDetailClient>

      <RelatedProducts products={related} title="Related products" />
      <RecentlyViewedProducts excludeId={product._id} limit={4} />

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
