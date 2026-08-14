"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Heart, Plus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { isVariantPurchasable, isPreOrderOnlyProduct } from "@/lib/inventory";
import { sanitizeImageList } from "@/lib/product-images";

export interface ProductCardProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  images?: string[];
  hoverImage?: string | null;
  colors?: { name: string; hex: string; images?: string[] }[];
  sizes?: { size: string; stock: number }[];
  inventory?: { colorName: string; size: string; stock: number }[];
  isOnSale?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isComingSoon?: boolean;
  allowPreOrder?: boolean;
  preOrderLeadTime?: string;
  collection?: { name?: string; slug?: string } | null;
}

/** Alias used by public pages */
export type ProductCardData = ProductCardProduct;

export interface ProductCardProps {
  product: ProductCardProduct;
  currency?: string;
  className?: string;
  priority?: boolean;
  index?: number;
}

export function ProductCard({
  product,
  currency = "CAD",
  className,
  priority,
}: ProductCardProps) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const inWishlist = useWishlistStore((s) =>
    s.isInWishlist(String(product._id))
  );

  useEffect(() => setMounted(true), []);

  const showWishlisted = mounted && inWishlist;

  const selectedColor = product.colors?.[colorIndex] || product.colors?.[0];
  const colorImages = sanitizeImageList(selectedColor?.images);
  const productImages = sanitizeImageList(product.images);

  const image = colorImages[0] || productImages[0];
  const hover = colorImages[1] || productImages[1] || null;

  const isAccessories = product.collection?.slug === "accessories";
  const onSale =
    product.isOnSale ||
    (product.compareAtPrice != null && product.compareAtPrice > product.price);

  const firstSize =
    product.sizes?.find((s) => {
      const colorName = selectedColor?.name || "Default";
      return isVariantPurchasable(product, colorName, s.size, 1).ok;
    })?.size ||
    product.sizes?.[0]?.size ||
    "M";

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const colorName = selectedColor?.name || "Default";
    const check = isVariantPurchasable(product, colorName, firstSize, 1);
    if (!check.ok) {
      setQuickOpen(true);
      return;
    }
    addItem({
      productId: String(product._id),
      name: product.name,
      slug: product.slug,
      image: image || "",
      price: product.price,
      quantity: 1,
      size: firstSize,
      color: colorName,
      colorHex: selectedColor?.hex,
      isPreOrder: check.isPreOrder,
      preOrderLeadTime: check.isPreOrder
        ? product.preOrderLeadTime || "Pre-Order – Ships in 2–3 weeks"
        : undefined,
    });
  };

  const onWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: String(product._id),
      name: product.name,
      slug: product.slug,
      image: image || "",
      price: product.price,
    });
  };

  const visibleColors = useMemo(
    () => product.colors?.slice(0, 5) || [],
    [product.colors]
  );

  const imageFitClass = isAccessories
    ? "object-contain object-center"
    : "object-contain object-center";

  const showComingSoon = Boolean(product.isComingSoon);
  const preOrderOnly = !showComingSoon && isPreOrderOnlyProduct(product);
  const showSale = !showComingSoon && !preOrderOnly && onSale;
  const showNew = !showComingSoon && !preOrderOnly && !showSale && Boolean(product.isNewArrival);
  const showBestSeller =
    !showComingSoon && !preOrderOnly && !showSale && !showNew && Boolean(product.isBestSeller);

  const statusBadge = showComingSoon ? (
    <Badge variant="soon">Coming soon</Badge>
  ) : preOrderOnly ? (
    <Badge variant="preorder">Pre-order</Badge>
  ) : showSale ? (
    <Badge variant="sale">Sale</Badge>
  ) : showNew ? (
    <Badge variant="new">New</Badge>
  ) : showBestSeller ? (
    <Badge variant="bestseller">Best seller</Badge>
  ) : null;

  return (
    <>
      <article className={cn("group relative flex flex-col", className)}>
        <div
          className={cn(
            "relative aspect-[3/4] overflow-hidden rounded-lg bg-white border border-gray-200"
          )}
        >
          <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0">
            <SafeImage
              src={image}
              alt={product.name}
              fill
              priority={priority}
              className={cn(
                "transition duration-700 ease-out group-hover:scale-[1.03]",
                imageFitClass,
                hover && "group-hover:opacity-0"
              )}
              sizes="(max-width:768px) 50vw, 25vw"
            />
            {hover ? (
              <SafeImage
                src={hover}
                alt=""
                fill
                className={cn(
                  "opacity-0 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100",
                  imageFitClass
                )}
                sizes="(max-width:768px) 50vw, 25vw"
              />
            ) : null}
          </Link>

          {statusBadge ? (
            <div className="pointer-events-none absolute left-3 top-3 z-10">
              {statusBadge}
            </div>
          ) : null}

          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
            <button
              type="button"
              suppressHydrationWarning
              onClick={onWishlist}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55",
                showWishlisted && "text-[#D4AF37]"
              )}
              aria-label={
                showWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                className={cn(
                  "h-[18px] w-[18px]",
                  showWishlisted ? "fill-current" : "fill-none stroke-[1.75]"
                )}
              />
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickOpen(true);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/55 group-hover:opacity-100"
              aria-label="Quick view"
            >
              <Eye className="h-[18px] w-[18px]" />
            </button>
          </div>

          <button
            type="button"
            suppressHydrationWarning
            onClick={quickAdd}
            className="absolute inset-x-0 bottom-0 z-10 flex min-h-10 translate-y-0 items-center justify-center gap-2 bg-[#D4AF37] py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-transform duration-300 ease-out sm:translate-y-full sm:group-hover:translate-y-0"
          >
            <Plus className="h-3.5 w-3.5" />
            {preOrderOnly ? "Pre-order" : "Quick add"}
          </button>
        </div>

        <div className="mt-3 space-y-1.5 px-0.5">
          <Link
            href={`/products/${product.slug}`}
            className="block line-clamp-2 text-[13px] leading-snug tracking-wide text-beige transition hover:text-gold sm:text-[14px]"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm tracking-wide text-beige/90">
              {formatPrice(product.price, currency)}
            </span>
            {onSale && product.compareAtPrice ? (
              <span className="text-xs text-beige/40 line-through">
                {formatPrice(product.compareAtPrice, currency)}
              </span>
            ) : null}
          </div>
          {visibleColors.length ? (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {visibleColors.map((c, i) => (
                <button
                  key={`${c.name}-${c.hex}`}
                  type="button"
                  suppressHydrationWarning
                  title={c.name}
                  aria-label={`Select ${c.name}`}
                  aria-pressed={colorIndex === i}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setColorIndex(i);
                  }}
                  className="flex h-7 w-7 items-center justify-center"
                >
                  <span
                    className={cn(
                      "h-3 w-3 rounded-full border transition",
                      colorIndex === i
                        ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/40"
                        : "border-white/30"
                    )}
                    style={{ backgroundColor: c.hex || "#000" }}
                  />
                </button>
              ))}
              {(product.colors?.length || 0) > 5 ? (
                <span className="pl-0.5 text-[10px] text-white/40">
                  +{(product.colors?.length || 0) - 5}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>

      <QuickViewModal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        product={product}
        currency={currency}
        initialColor={selectedColor?.name}
      />
    </>
  );
}
