"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Heart, Plus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { QuickViewModal } from "@/components/product/QuickViewModal";

export interface ProductCardProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  images?: string[];
  hoverImage?: string | null;
  colors?: { name: string; hex: string }[];
  sizes?: { size: string; stock: number }[];
  isOnSale?: boolean;
  isNewArrival?: boolean;
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
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const inWishlist = useWishlistStore((s) =>
    s.isInWishlist(String(product._id))
  );

  const image = product.images?.[0];
  const hover = product.hoverImage || product.images?.[1];
  const onSale =
    product.isOnSale ||
    (product.compareAtPrice != null && product.compareAtPrice > product.price);
  const firstSize =
    product.sizes?.find((s) => s.stock > 0)?.size ||
    product.sizes?.[0]?.size ||
    "M";
  const firstColor = product.colors?.[0];

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: String(product._id),
      name: product.name,
      slug: product.slug,
      image: image || "",
      price: product.price,
      quantity: 1,
      size: firstSize,
      color: firstColor?.name || "Default",
      colorHex: firstColor?.hex,
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

  return (
    <>
      <article className={cn("group relative", className)}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[#141414]">
          <Link href={`/products/${product.slug}`} className="absolute inset-0">
            <SafeImage
              src={image}
              alt={product.name}
              fill
              priority={priority}
              className={cn(
                "object-cover transition duration-700 ease-out",
                hover && "group-hover:opacity-0"
              )}
              sizes="(max-width:768px) 50vw, 25vw"
            />
            {hover ? (
              <SafeImage
                src={hover}
                alt=""
                fill
                className="object-cover opacity-0 transition duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                sizes="(max-width:768px) 50vw, 25vw"
              />
            ) : (
              <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-0" />
            )}
          </Link>

          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {onSale ? <Badge variant="sale">Sale</Badge> : null}
            {product.isNewArrival ? <Badge variant="new">New</Badge> : null}
          </div>

          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={onWishlist}
              className={cn(
                "flex h-9 w-9 items-center justify-center bg-black/55 text-white backdrop-blur-sm transition hover:text-[#D4AF37]",
                inWishlist && "text-[#D4AF37]"
              )}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
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
              className="flex h-9 w-9 items-center justify-center bg-black/55 text-white backdrop-blur-sm transition hover:text-[#D4AF37]"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={quickAdd}
            className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-[#D4AF37] py-3 text-[10px] uppercase tracking-[0.22em] text-black transition duration-300 group-hover:translate-y-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Quick add
          </button>
        </div>

        <div className="mt-3 space-y-1.5">
          <Link
            href={`/products/${product.slug}`}
            className="block text-sm text-[#F5F0E6] transition hover:text-[#D4AF37]"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#F5F0E6]/90">
              {formatPrice(product.price, currency)}
            </span>
            {onSale && product.compareAtPrice ? (
              <span className="text-xs text-white/40 line-through">
                {formatPrice(product.compareAtPrice, currency)}
              </span>
            ) : null}
          </div>
          {product.colors?.length ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.colors.slice(0, 5).map((c) => (
                <span
                  key={`${c.name}-${c.hex}`}
                  title={c.name}
                  className="h-3 w-3 rounded-full border border-white/25"
                  style={{ backgroundColor: c.hex || "#000" }}
                />
              ))}
              {product.colors.length > 5 ? (
                <span className="text-[10px] text-white/40">
                  +{product.colors.length - 5}
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
      />
    </>
  );
}
