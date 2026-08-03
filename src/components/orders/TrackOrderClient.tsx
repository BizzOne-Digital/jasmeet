"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/order-status";

interface TrackResult {
  orderNumber: string;
  orderStatus: OrderStatus;
  statusLabel: string;
  shippingMethod: "standard" | "local";
  courierName?: string;
  trackingNumber?: string;
  hasPreOrderItems?: boolean;
  items: Array<{
    name: string;
    quantity: number;
    size: string;
    color: string;
    isPreOrder?: boolean;
    preOrderLeadTime?: string;
  }>;
  createdAt: string;
}

const STATUS_MESSAGES: Partial<Record<OrderStatus, string>> = {
  order_received: "We've received your order and will begin preparing it soon.",
  processing: "Your order is being prepared.",
  packed: "Your order is packed and ready for dispatch.",
  shipped: "Your order has been dispatched with the courier.",
  out_for_local_delivery: "Your order is out for local delivery.",
  delivered: "Your order has been delivered.",
  cancelled: "This order has been cancelled.",
  refunded: "A refund has been issued for this order.",
};

export function TrackOrderClient() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("orderNumber") || ""
  );
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const params = new URLSearchParams({
        orderNumber: orderNumber.trim(),
        email: email.trim(),
      });
      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Unable to find that order.");
        return;
      }
      setResult(json.data as TrackResult);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeIndex = result
    ? ORDER_STATUSES.indexOf(result.orderStatus)
    : -1;
  const timelineStatuses = ORDER_STATUSES.filter(
    (s) => !["cancelled", "refunded"].includes(s)
  );

  return (
    <div className="mx-auto max-w-xl space-y-10 px-4 py-14 sm:px-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Order number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. DA-1001"
          required
        />
        <Input
          label="Email used at checkout"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Looking up…" : "Track order"}
        </Button>
      </form>

      {result ? (
        <div className="space-y-8 border border-white/10 p-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              Order {result.orderNumber}
            </p>
            <h2 className="mt-2 font-heading text-3xl text-beige">
              {result.statusLabel}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-beige/70">
              {STATUS_MESSAGES[result.orderStatus] ||
                `Current status: ${result.statusLabel}`}
            </p>
          </div>

          {result.orderStatus !== "cancelled" &&
          result.orderStatus !== "refunded" ? (
            <ol className="space-y-3">
              {timelineStatuses.map((status) => {
                const idx = ORDER_STATUSES.indexOf(status);
                const done = activeIndex >= 0 && idx <= activeIndex;
                const current = status === result.orderStatus;
                return (
                  <li
                    key={status}
                    className={`flex items-center gap-3 text-sm ${
                      current
                        ? "text-gold"
                        : done
                          ? "text-beige"
                          : "text-beige/35"
                    }`}
                  >
                    <span
                      className={`flex h-2.5 w-2.5 shrink-0 rounded-full ${
                        current
                          ? "bg-gold"
                          : done
                            ? "bg-beige"
                            : "bg-white/20"
                      }`}
                    />
                    {ORDER_STATUS_LABELS[status]}
                  </li>
                );
              })}
            </ol>
          ) : null}

          {result.courierName || result.trackingNumber ? (
            <div className="border-t border-white/10 pt-6 text-sm text-beige/75">
              {result.courierName ? (
                <p>
                  <span className="text-muted">Courier: </span>
                  {result.courierName}
                </p>
              ) : null}
              {result.trackingNumber ? (
                <p className="mt-1">
                  <span className="text-muted">Tracking: </span>
                  {result.trackingNumber}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="border-t border-white/10 pt-6">
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted">
              Items
            </p>
            <ul className="space-y-2 text-sm text-beige/75">
              {result.items.map((item, i) => (
                <li key={`${item.name}-${i}`}>
                  {item.name} · {item.color} · {item.size} · Qty {item.quantity}
                  {item.isPreOrder ? (
                    <span className="ml-2 text-gold">
                      Pre-order
                      {item.preOrderLeadTime ? ` — ${item.preOrderLeadTime}` : ""}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
