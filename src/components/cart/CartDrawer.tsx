"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCartStore } from "@/store/cart";
import { cn, formatPrice } from "@/lib/utils";
import {
  CartPreOrderBadge,
  cartHasPreOrderItems,
} from "@/components/cart/CartPreOrderBadge";

export interface CartDrawerProps {
  shippingThreshold?: number;
  currency?: string;
}

export function CartDrawer({
  shippingThreshold = 99,
  currency = "CAD",
}: CartDrawerProps) {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.getSubtotal());

  const remaining = Math.max(0, shippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / shippingThreshold) * 100);
  const freeShipping = remaining <= 0 && items.length > 0;

  return (
    <Drawer open={isOpen} onClose={closeCart} title="Your Bag" side="right">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {!items.length ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-10 text-center">
              <ShoppingBag className="h-10 w-10 text-white/30" />
              <p className="text-sm text-white/55">Your bag is empty.</p>
              <Link href="/shop" onClick={closeCart}>
                <Button variant="outline">Continue shopping</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="relative h-24 w-20 shrink-0 overflow-hidden bg-[#1a1a1a]"
                  >
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm text-[#F5F0E6] transition hover:text-[#D4AF37]"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-xs text-white/45">
                          {item.color}
                          {item.size ? ` / ${item.size}` : ""}
                        </p>
                        <CartPreOrderBadge item={item} />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        className="p-1 text-white/40 hover:text-red-400"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-white/15">
                        <button
                          type="button"
                          className="p-2 text-white/70 hover:text-[#D4AF37]"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity - 1
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="p-2 text-white/70 hover:text-[#D4AF37]"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity + 1
                            )
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm text-[#F5F0E6]">
                        {formatPrice(item.price * item.quantity, currency)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="shrink-0 border-t border-white/10 bg-[#0a0a0a] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-4">
            {cartHasPreOrderItems(items) ? (
              <p className="border border-gold/30 bg-gold/5 px-3 py-2 text-[11px] leading-relaxed text-beige/80">
                Your bag includes pre-order item(s). Estimated dispatch times are
                shown on each line and in your confirmation email.
              </p>
            ) : null}
            <div>
              <div className="mb-2 flex justify-between text-xs text-white/55">
                <span>
                  {freeShipping
                    ? "You've unlocked free shipping"
                    : `${formatPrice(remaining, currency)} away from free shipping`}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 overflow-hidden bg-white/10">
                <div
                  className={cn(
                    "h-full bg-[#D4AF37] transition-all duration-500",
                    freeShipping && "bg-[#F5F0E6]"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-white/55">
                Subtotal
              </span>
              <span className="font-serif text-xl text-[#F5F0E6]">
                {formatPrice(subtotal, currency)}
              </span>
            </div>

            <div className="grid gap-2">
              <Link href="/checkout" onClick={closeCart}>
                <Button fullWidth>Checkout</Button>
              </Link>
              <Link href="/cart" onClick={closeCart}>
                <Button fullWidth variant="ghost">
                  View bag
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </Drawer>
  );
}
