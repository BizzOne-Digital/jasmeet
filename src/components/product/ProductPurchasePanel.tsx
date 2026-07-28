"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice, cn, safeText } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

interface ProductPurchaseProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  colors?: Array<{ name: string; hex: string }>;
  sizes?: Array<{ size: string; stock: number }>;
  shortDescription?: string;
  collection?: { name?: string; slug?: string } | null;
  category?: { name?: string; slug?: string } | null;
}

export function ProductPurchasePanel({ product }: { product: ProductPurchaseProduct }) {
  const colors = product.colors?.length ? product.colors : [{ name: "Default", hex: "#000000" }];
  const sizes = product.sizes?.length ? product.sizes : [{ size: "One Size", stock: 10 }];
  const [color, setColor] = useState(colors[0].name);
  const [size, setSize] = useState(
    sizes.find((s) => s.stock > 0)?.size || sizes[0].size
  );
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const wished = useWishlistStore((s) => s.isInWishlist(product._id));

  const selectedSize = useMemo(
    () => sizes.find((s) => s.size === size),
    [size, sizes]
  );
  const inStock = (selectedSize?.stock ?? 0) > 0;
  const selectedColor = colors.find((c) => c.name === color) || colors[0];

  const addToCart = (buyNow = false) => {
    if (!size) {
      setError("Please select a size.");
      return;
    }
    if (!inStock) {
      setError("Selected size is out of stock.");
      return;
    }
    setError("");
    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || "",
      price: product.price,
      quantity: qty,
      size,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
    });
    if (buyNow) {
      window.location.href = "/checkout";
    } else {
      openCart();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.2em] text-muted">
          {product.collection?.slug ? (
            <Link href={`/collections/${product.collection.slug}`} className="hover:text-gold">
              {safeText(product.collection.name)}
            </Link>
          ) : null}
          {product.category?.slug ? (
            <Link href={`/category/${product.category.slug}`} className="hover:text-gold">
              {safeText(product.category.name)}
            </Link>
          ) : null}
        </div>
        <h1 className="mt-3 font-heading text-4xl md:text-5xl tracking-wide">
          {safeText(product.name)}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-lg">
          <span>{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <span className="text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
        {product.shortDescription ? (
          <p className="mt-4 text-sm leading-relaxed text-beige/70">
            {safeText(product.shortDescription)}
          </p>
        ) : null}
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-beige/60">
          Color — {color}
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => setColor(c.name)}
              className={cn(
                "h-8 w-8 rounded-full border-2",
                color === c.name ? "border-gold" : "border-white/20"
              )}
              style={{ backgroundColor: c.hex || "#000" }}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.2em] text-beige/60">Size</p>
          <Link href="/size-guide" className="text-[11px] uppercase tracking-[0.16em] text-gold">
            Size guide
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const disabled = s.stock <= 0;
            return (
              <button
                key={s.size}
                type="button"
                disabled={disabled}
                onClick={() => setSize(s.size)}
                className={cn(
                  "h-11 min-w-12 border px-3 text-xs tracking-wider transition-colors",
                  size === s.size ? "border-gold text-gold" : "border-white/15",
                  disabled && "opacity-30 line-through"
                )}
              >
                {s.size}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">
          {inStock ? `${selectedSize?.stock ?? 0} in stock` : "Out of stock"}
        </p>
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-beige/60">
          Quantity
        </p>
        <div className="inline-flex items-center border border-white/15">
          <button
            type="button"
            className="h-11 w-11"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-12 text-center text-sm">{qty}</span>
          <button
            type="button"
            className="h-11 w-11"
            onClick={() => setQty((q) => Math.min(10, q + 1))}
          >
            +
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button fullWidth onClick={() => addToCart(false)} disabled={!inStock}>
          Add to cart
        </Button>
        <Button fullWidth variant="outline" onClick={() => addToCart(true)} disabled={!inStock}>
          Buy now
        </Button>
        <Button
          variant="ghost"
          aria-label="Toggle wishlist"
          onClick={() =>
            toggleWishlist({
              productId: product._id,
              name: product.name,
              slug: product.slug,
              image: product.images?.[0] || "",
              price: product.price,
            })
          }
        >
          <Heart className={cn("h-5 w-5", wished && "fill-gold text-gold")} />
        </Button>
      </div>
    </div>
  );
}
