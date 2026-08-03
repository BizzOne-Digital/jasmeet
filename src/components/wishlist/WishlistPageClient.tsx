"use client";

import Link from "next/link";
import { useWishlistStore } from "@/store/wishlist";
import { SafeImage } from "@/components/ui/SafeImage";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export function WishlistPageClient() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);

  if (!items.length) {
    return (
      <div className="py-20 text-center">
        <p className="font-heading text-3xl">Your wishlist is empty</p>
        <p className="mt-3 text-sm text-muted">Save pieces you love for later.</p>
        <Button className="mt-8" onClick={() => (window.location.href = "/shop")}>
          Explore the shop
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {items.map((item) => (
        <article key={item.productId} className="group">
          <Link href={`/products/${item.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-surface">
            <SafeImage
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          </Link>
          <div className="mt-4 space-y-2">
            <Link href={`/products/${item.slug}`} className="font-heading text-lg">
              {item.name}
            </Link>
            <p className="text-sm">{formatPrice(item.price)}</p>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-xs uppercase tracking-[0.16em] text-muted hover:text-gold"
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
