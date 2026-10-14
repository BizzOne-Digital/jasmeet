"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";
import { formatPrice } from "@/lib/utils";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  SHIPPING_METHOD_LABELS,
  type OrderStatus,
} from "@/lib/order-status";

interface OrderDetail {
  _id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  shippingMethod: "standard" | "local";
  courierName?: string;
  trackingNumber?: string;
  notes?: string;
  paymentStatus: string;
  hasPreOrderItems?: boolean;
  subtotal: number;
  shipping: number;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    isPreOrder?: boolean;
    preOrderLeadTime?: string;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
}

const fieldClass =
  "w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-amber-500/50 focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = String(params.id || "");
  const { openSidebar } = useAdminShell();
  const { success, error: toastError } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    orderStatus: "order_received" as OrderStatus,
    courierName: "",
    trackingNumber: "",
    notes: "",
  });

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const result = await adminFetch<OrderDetail>(`/api/orders/${id}`);
      if (!result.success) {
        toastError(result.error);
        return;
      }
      setOrder(result.data);
      setForm({
        orderStatus: result.data.orderStatus,
        courierName: result.data.courierName || "",
        trackingNumber: result.data.trackingNumber || "",
        notes: result.data.notes || "",
      });
    })();
  }, [id, toastError]);

  const onSave = async () => {
    setSaving(true);
    const result = await adminFetch<OrderDetail>(`/api/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!result.success) {
      toastError(result.error);
      return;
    }
    setOrder(result.data);
    success("Order updated — customer notified when status changes.");
  };

  if (!order) {
    return (
      <div>
        <AdminHeader title="Order" onMenuClick={openSidebar} />
        <p className="p-6 text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title={order.orderNumber}
        onMenuClick={openSidebar}
        actions={
          <Link href="/admin/orders" className="text-sm text-zinc-400 hover:text-amber-400">
            ← All orders
          </Link>
        }
      />
      <div className="grid gap-6 p-4 md:grid-cols-2 md:p-6">
        <div className="space-y-4 rounded-lg border border-zinc-800 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg text-zinc-100">Fulfillment</h2>
            {order.hasPreOrderItems ? (
              <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-400">
                Contains pre-order
              </span>
            ) : null}
          </div>

          <div>
            <label className={labelClass}>Order status</label>
            <select
              className={fieldClass}
              value={form.orderStatus}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  orderStatus: e.target.value as OrderStatus,
                }))
              }
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Courier name</label>
            <input
              className={fieldClass}
              value={form.courierName}
              onChange={(e) =>
                setForm((f) => ({ ...f, courierName: e.target.value }))
              }
              placeholder="Canada Post, UPS, Purolator…"
            />
          </div>

          <div>
            <label className={labelClass}>Tracking number</label>
            <input
              className={fieldClass}
              value={form.trackingNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, trackingNumber: e.target.value }))
              }
              placeholder="Required when marking Shipped (courier)"
            />
          </div>

          <div>
            <label className={labelClass}>Internal notes</label>
            <textarea
              className={fieldClass}
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & notify customer"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm((f) => ({ ...f, orderStatus: "cancelled" }));
              void (async () => {
                setSaving(true);
                const result = await adminFetch<OrderDetail>(`/api/orders/${id}`, {
                  method: "PATCH",
                  body: JSON.stringify({ ...form, orderStatus: "cancelled" }),
                });
                setSaving(false);
                if (!result.success) {
                  toastError(result.error);
                  return;
                }
                setOrder(result.data);
                setForm((f) => ({ ...f, orderStatus: "cancelled" }));
                success("Order cancelled — customer notified.");
              })();
            }}
            disabled={saving || form.orderStatus === "cancelled"}
            className="ml-2 rounded-md border border-red-900/60 px-4 py-2 text-sm text-red-300 hover:bg-red-950/40 disabled:opacity-50"
          >
            Cancel order
          </button>
          <p className="text-xs text-zinc-500">
            Status updates appear on the customer Track Order page
            (/track-order). Changing status to Order Received, Processing, Packed,
            Shipped, Out for Local Delivery, Delivered, Cancelled, or Refunded
            emails the customer with status-appropriate details. Shipped
            (standard) requires courier + tracking.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-800 p-4">
            <h2 className="mb-3 text-lg text-zinc-100">Customer</h2>
            <p className="text-sm text-zinc-300">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              <br />
              {order.shippingAddress.email}
              <br />
              {order.shippingAddress.phone}
            </p>
            <p className="mt-3 text-sm text-zinc-400">
              {order.shippingAddress.address}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
            <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">
              {SHIPPING_METHOD_LABELS[order.shippingMethod]} · Payment{" "}
              {order.paymentStatus}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 p-4">
            <h2 className="mb-3 text-lg text-zinc-100">Items</h2>
            <ul className="space-y-3 text-sm">
              {order.items.map((item, i) => (
                <li key={`${item.name}-${i}`} className="border-b border-zinc-800 pb-3">
                  <div className="flex justify-between gap-3 text-zinc-200">
                    <span>
                      {item.name}
                      {item.isPreOrder ? (
                        <span className="ml-2 text-[10px] uppercase text-amber-400">
                          Pre-order
                        </span>
                      ) : null}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {item.color} · {item.size} · Qty {item.quantity}
                    {item.isPreOrder && item.preOrderLeadTime
                      ? ` · ${item.preOrderLeadTime}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 text-sm text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-100">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
