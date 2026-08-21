"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
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
      {!items.length ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-10 text-center">
          <ShoppingBag className="h-10 w-10 text-white/30" />
          <p className="text-sm text-white/55">Your bag is empty.</p>
          <Link href="/shop" onClick={closeCart}>
            <Button variant="outline">Continue shopping</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="rounded-lg border border-white/10 bg-[#111111] p-3"
                >
                  <div className="flex gap-3">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md border border-white/10 bg-beige"
                    >
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        fill
                        className="bg-beige object-contain p-1"
                        sizes="64px"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="block text-sm leading-snug text-[#F5F0E6] transition hover:text-[#D4AF37]"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-xs text-white/45">
                            {item.color}
                            {item.size ? ` / ${item.size}` : ""}
                          </p>
                          <CartPreOrderBadge item={item} />
                        </div>
                        <p className="shrink-0 text-sm text-[#F5F0E6]">
                          {formatPrice(item.price * item.quantity, currency)}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-full border border-white/15">
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center text-white/70 hover:text-[#D4AF37]"
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
                            className="flex h-9 w-9 items-center justify-center text-white/70 hover:text-[#D4AF37]"
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

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.productId, item.size, item.color)
                          }
                          className="text-[10px] uppercase tracking-[0.18em] text-white/45 transition hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-[#0a0a0a] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
            {cartHasPreOrderItems(items) ? (
              <p className="mb-3 border border-gold/30 bg-gold/5 px-3 py-2 text-[11px] leading-relaxed text-beige/80">
                Your bag includes pre-order item(s). Estimated dispatch times are
                shown on each line and in your confirmation email.
              </p>
            ) : null}

            <div className="mb-4">
              <div className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.16em] text-white/45">
                <span>
                  {freeShipping
                    ? "Free shipping unlocked"
                    : `${formatPrice(remaining, currency)} from free shipping`}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={cn(
                    "h-full bg-[#D4AF37] transition-all duration-500",
                    freeShipping && "bg-[#F5F0E6]"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">
                Subtotal
              </span>
              <span className="font-serif text-2xl text-[#F5F0E6]">
                {formatPrice(subtotal, currency)}
              </span>
            </div>

            <div className="grid gap-2.5">
              <Link href="/checkout" onClick={closeCart}>
                <Button fullWidth size="lg">
                  Checkout
                </Button>
              </Link>
              <Link href="/cart" onClick={closeCart}>
                <Button fullWidth variant="outline" size="md">
                  View bag
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
