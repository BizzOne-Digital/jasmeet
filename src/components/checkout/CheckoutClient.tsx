"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatPrice, cn } from "@/lib/utils";
import { calculateShipping, isLocalDeliveryEligible } from "@/lib/shipping";
import type { ShippingMethod } from "@/lib/order-status";
import {
  CartPreOrderBadge,
  cartHasPreOrderItems,
} from "@/components/cart/CartPreOrderBadge";

export function CheckoutClient({
  shippingThreshold = 99,
  standardShippingRate = 9.99,
  localDeliveryEnabled = false,
  localDeliveryFee = 0,
  localDeliveryPostalCodes = [],
  paymentConfigured = false,
}: {
  shippingThreshold?: number;
  standardShippingRate?: number;
  localDeliveryEnabled?: boolean;
  localDeliveryFee?: number;
  localDeliveryPostalCodes?: string[];
  paymentConfigured?: boolean;
}) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.getSubtotal());

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [hadPreOrder, setHadPreOrder] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [postalCode, setPostalCode] = useState("");

  const hasItems = items.length > 0;
  const hasPreOrder = cartHasPreOrderItems(items);
  const localOk =
    localDeliveryEnabled &&
    isLocalDeliveryEligible(postalCode, localDeliveryPostalCodes);

  const shippingCalc = useMemo(
    () =>
      calculateShipping({
        subtotal,
        method: shippingMethod === "local" && localOk ? "local" : "standard",
        shippingThreshold,
        standardShippingRate,
        localDeliveryFee,
        localDeliveryEnabled,
        localDeliveryPostalCodes,
        postalCode,
      }),
    [
      subtotal,
      shippingMethod,
      localOk,
      shippingThreshold,
      standardShippingRate,
      localDeliveryFee,
      localDeliveryEnabled,
      localDeliveryPostalCodes,
      postalCode,
    ]
  );

  const shipping = shippingCalc.shipping;
  const total = subtotal + shipping;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasItems) return;
    setStatus("loading");
    setMessage("");

    const form = new FormData(e.currentTarget);
    const method =
      shippingMethod === "local" && localOk ? "local" : "standard";

    if (shippingMethod === "local" && !localOk) {
      setStatus("error");
      setMessage("This postal code is not eligible for local delivery.");
      return;
    }

    const payload = {
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        slug: i.slug,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      })),
      shippingMethod: method,
      shippingAddress: {
        firstName: String(form.get("firstName") || ""),
        lastName: String(form.get("lastName") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        address: String(form.get("address") || ""),
        city: String(form.get("city") || ""),
        province: String(form.get("province") || ""),
        postalCode: String(form.get("postalCode") || ""),
        country: String(form.get("country") || "Canada"),
      },
      notes: String(form.get("notes") || "") || undefined,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to place order");
      }
      setOrderNumber(json.data?.orderNumber || "");
      setHadPreOrder(cartHasPreOrderItems(items));
      setStatus("success");
      clearCart();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Checkout failed");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
          Order received
        </p>
        <h1 className="mt-4 font-heading text-4xl">Thank you</h1>
        <p className="mt-4 text-sm text-muted">
          Your order{" "}
          {orderNumber ? (
            <strong className="text-beige">{orderNumber}</strong>
          ) : null}{" "}
          has been created. A confirmation email is on its way.
          {hadPreOrder ? (
            <>
              {" "}
              Pre-order item(s) in your order will ship according to the
              estimated dispatch times in your email.
            </>
          ) : null}
          {paymentConfigured
            ? " Payment confirmation will follow separately."
            : " (Test mode — no real charge.)"}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push("/shop")}>Continue shopping</Button>
          {orderNumber ? (
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/track-order?orderNumber=${encodeURIComponent(orderNumber)}`
                )
              }
            >
              Track order
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="py-20 text-center">
        <p className="font-heading text-3xl">Nothing to checkout</p>
        <Link
          href="/cart"
          className="mt-6 inline-block text-xs uppercase tracking-[0.18em] text-gold"
        >
          Return to cart
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
      <form onSubmit={onSubmit} className="space-y-8">
        {!paymentConfigured ? (
          <div className="border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-beige">
            <strong className="text-gold">Test checkout mode.</strong> No payment
            provider is configured. Orders will be saved with a test payment
            status — no real charges occur.
          </div>
        ) : null}

        <fieldset className="space-y-4">
          <legend className="font-heading text-2xl">Contact</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="firstName" label="First name" required />
            <Input name="lastName" label="Last name" required />
          </div>
          <Input name="email" type="email" label="Email" required />
          <Input name="phone" label="Phone" required />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-heading text-2xl">Shipping address</legend>
          <Input name="address" label="Address" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="city" label="City" required />
            <Input name="province" label="Province" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="postalCode"
              label="Postal code"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
            <Input name="country" label="Country" defaultValue="Canada" required />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-heading text-2xl">Shipping method</legend>
          <div className="space-y-3">
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 border px-4 py-3 transition",
                shippingMethod === "standard"
                  ? "border-gold/70 bg-gold/5"
                  : "border-white/15"
              )}
            >
              <input
                type="radio"
                name="shippingMethod"
                checked={shippingMethod === "standard"}
                onChange={() => setShippingMethod("standard")}
                className="mt-1"
              />
              <span>
                <span className="block text-sm text-beige">
                  Standard Shipping (Canada)
                </span>
                <span className="mt-1 block text-xs text-muted">
                  CAD ${standardShippingRate.toFixed(2)} · Free on orders over
                  CAD ${shippingThreshold.toFixed(0)} · 1–2 business days
                  processing · 2–7 business days delivery
                </span>
              </span>
            </label>

            {localDeliveryEnabled ? (
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 border px-4 py-3 transition",
                  shippingMethod === "local"
                    ? "border-gold/70 bg-gold/5"
                    : "border-white/15",
                  postalCode && !localOk && "opacity-60"
                )}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shippingMethod === "local"}
                  onChange={() => setShippingMethod("local")}
                  className="mt-1"
                  disabled={Boolean(postalCode) && !localOk}
                />
                <span>
                  <span className="block text-sm text-beige">Local Delivery</span>
                  <span className="mt-1 block text-xs text-muted">
                    {localDeliveryFee === 0
                      ? "Free"
                      : `CAD $${localDeliveryFee.toFixed(2)}`}{" "}
                    · Personal delivery in eligible areas · No tracking number
                    required
                    {postalCode && !localOk
                      ? " · Not available for this postal code"
                      : ""}
                  </span>
                </span>
              </label>
            ) : null}
          </div>
          <Textarea name="notes" label="Order notes" hint="Optional" />
        </fieldset>

        {message ? <p className="text-sm text-red-400">{message}</p> : null}

        <Button type="submit" loading={status === "loading"} fullWidth>
          {paymentConfigured ? "Place order" : "Place test order"}
        </Button>
      </form>

      <aside className="h-fit border border-white/10 bg-surface p-6">
        <h2 className="font-heading text-2xl">Order summary</h2>
        {hasPreOrder ? (
          <p className="mt-4 border border-gold/30 bg-gold/5 px-3 py-2 text-xs leading-relaxed text-beige/80">
            Includes pre-order item(s). Dispatch estimates are shown below each
            product.
          </p>
        ) : null}
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-3"
            >
              <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-black">
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="flex-1 text-sm">
                <p>{item.name}</p>
                <p className="text-xs text-muted">
                  {item.size} / {item.color} × {item.quantity}
                </p>
                <CartPreOrderBadge item={item} />
              </div>
              <p className="text-sm">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">
              Shipping
              {shippingCalc.method === "local" ? " (local)" : ""}
            </span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
