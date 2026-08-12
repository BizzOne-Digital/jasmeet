"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { SafeImage } from "@/components/ui/SafeImage";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import {
  CartPreOrderBadge,
  cartHasPreOrderItems,
} from "@/components/cart/CartPreOrderBadge";

export function CartPageClient({ shippingThreshold = 99 }: { shippingThreshold?: number }) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const remaining = Math.max(0, shippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / shippingThreshold) * 100);
  const hasPreOrder = cartHasPreOrderItems(items);

  if (!items.length) {
    return (
      <div className="py-20 text-center">
        <p className="font-heading text-3xl">Your cart is empty</p>
        <p className="mt-3 text-sm text-muted">Discover pieces made to move with you.</p>
        <Link href="/shop">
          <Button className="mt-8">Continue shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
      <div>
        {hasPreOrder ? (
          <p className="mb-6 border border-gold/30 bg-gold/5 px-4 py-3 text-sm leading-relaxed text-beige/80">
            Your order includes pre-order item(s). Each line shows the estimated
            dispatch time before checkout.
          </p>
        ) : null}
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {items.map((item) => (
            <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 py-6">
              <Link
                href={`/products/${item.slug}`}
                className="relative h-28 w-24 shrink-0 overflow-hidden bg-surface"
              >
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/products/${item.slug}`} className="font-heading text-xl">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                      {item.size} / {item.color}
                    </p>
                    <CartPreOrderBadge item={item} className="mt-2 text-[11px]" />
                  </div>
                  <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="inline-flex items-center border border-white/15">
                    <button
                      type="button"
                      className="h-9 w-9"
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="h-9 w-9"
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs uppercase tracking-[0.16em] text-muted hover:text-gold"
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit border border-white/10 bg-surface p-6">
        <h2 className="font-heading text-2xl">Order summary</h2>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 overflow-hidden bg-white/10">
              <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted">
              {remaining > 0
                ? `${formatPrice(remaining)} away from free shipping`
                : "You've unlocked free shipping"}
            </p>
          </div>
          <Link href="/checkout" className="block pt-4">
            <Button fullWidth>Checkout</Button>
          </Link>
          <Link
            href="/shop"
            className="block text-center text-xs uppercase tracking-[0.18em] text-muted hover:text-beige"
          >
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}
