"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Heart, Plus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { isVariantPurchasable } from "@/lib/inventory";

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
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const inWishlist = useWishlistStore((s) =>
    s.isInWishlist(String(product._id))
  );

  const selectedColor = product.colors?.[colorIndex] || product.colors?.[0];
  const colorImages = selectedColor?.images?.filter(Boolean) || [];

  const image = colorImages[0] || product.images?.[0];
  const hover =
    colorImages[1] ||
    product.hoverImage ||
    (colorImages[0] ? product.images?.[0] : product.images?.[1]);

  const fitContain = product.collection?.slug === "accessories";
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

  return (
    <>
      <article className={cn("group relative", className)}>
        <div
          className={cn(
            "relative aspect-[3/4] overflow-hidden",
            fitContain ? "bg-white" : "bg-[#141414]"
          )}
        >
          <Link href={`/products/${product.slug}`} className="absolute inset-0">
            <SafeImage
              src={image}
              alt={product.name}
              fill
              priority={priority}
              className={cn(
                "transition duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)]",
                fitContain
                  ? "bg-transparent object-contain p-3 sm:p-5"
                  : "object-cover",
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
                  "opacity-0 transition duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100",
                  fitContain
                    ? "bg-transparent object-contain p-3 sm:p-5"
                    : "lux-zoom object-cover"
                )}
                sizes="(max-width:768px) 50vw, 25vw"
              />
            ) : null}
          </Link>

          <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
            {product.isComingSoon ? <Badge variant="soon">Coming soon</Badge> : null}
            {onSale ? <Badge variant="sale">Sale</Badge> : null}
            {product.isNewArrival ? <Badge variant="new">New</Badge> : null}
            {product.isBestSeller ? (
              <Badge variant="bestseller">Best seller</Badge>
            ) : null}
          </div>

          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={onWishlist}
              className={cn(
                "flex h-11 w-11 items-center justify-center bg-black/55 text-white backdrop-blur-sm transition hover:text-[#D4AF37]",
                inWishlist && "text-[#D4AF37]"
              )}
              aria-label={
                inWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickOpen(true);
              }}
              className="flex h-11 w-11 items-center justify-center bg-black/55 text-white backdrop-blur-sm transition hover:text-[#D4AF37]"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={quickAdd}
            className="absolute inset-x-0 bottom-0 z-10 flex min-h-11 translate-y-0 items-center justify-center gap-2 bg-gold py-3 text-[10px] uppercase tracking-[0.24em] text-black transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:translate-y-full sm:group-hover:translate-y-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Quick add
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {product.collection?.name ? (
            <p className="text-[10px] uppercase tracking-[0.2em] text-beige/45">
              {product.collection.name}
            </p>
          ) : null}
          <Link
            href={`/products/${product.slug}`}
            className="block text-[15px] leading-snug tracking-wide text-beige transition duration-500 hover:text-gold"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-2.5">
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
            <div className="flex flex-wrap items-center gap-0.5 pt-1">
              {visibleColors.map((c, i) => (
                <button
                  key={`${c.name}-${c.hex}`}
                  type="button"
                  title={c.name}
                  aria-label={`Select ${c.name}`}
                  aria-pressed={colorIndex === i}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setColorIndex(i);
                  }}
                  className="flex h-9 w-9 items-center justify-center"
                >
                  <span
                    className={cn(
                      "h-3.5 w-3.5 rounded-full border transition",
                      colorIndex === i
                        ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/40"
                        : "border-white/25"
                    )}
                    style={{ backgroundColor: c.hex || "#000" }}
                  />
                </button>
              ))}
              {(product.colors?.length || 0) > 5 ? (
                <span className="pl-1 text-[10px] text-white/40">
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
