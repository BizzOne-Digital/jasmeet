"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";
import { formatPrice } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
  SHIPPING_METHOD_LABELS,
  type OrderStatus,
} from "@/lib/order-status";

interface OrderRow {
  _id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  shippingMethod: "standard" | "local";
  total: number;
  hasPreOrderItems?: boolean;
  shippingAddress?: { email?: string; firstName?: string; lastName?: string };
  createdAt: string;
}

export default function AdminOrdersPage() {
  const { openSidebar } = useAdminShell();
  const { error: toastError } = useToast();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [preOrderOnly, setPreOrderOnly] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (preOrderOnly) params.set("preOrder", "true");
      const result = await adminFetch<{ orders: OrderRow[] }>(
        `/api/orders?${params.toString()}`
      );
      if (!result.success) toastError(result.error);
      else setOrders(result.data.orders || []);
      setLoading(false);
    })();
  }, [status, preOrderOnly, toastError]);

  return (
    <div>
      <AdminHeader title="Orders" onMenuClick={openSidebar} />
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
          >
            <option value="all">All statuses</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={preOrderOnly}
              onChange={(e) => setPreOrderOnly(e.target.checked)}
            />
            Pre-order orders only
          </label>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-zinc-500">No orders found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ship</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t border-zinc-800">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="font-medium text-amber-400 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      {order.hasPreOrderItems ? (
                        <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-amber-400">
                          Pre-order
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {order.shippingAddress?.firstName}{" "}
                      {order.shippingAddress?.lastName}
                      <div className="text-xs text-zinc-500">
                        {order.shippingAddress?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {ORDER_STATUS_LABELS[order.orderStatus] ||
                        order.orderStatus}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {SHIPPING_METHOD_LABELS[order.shippingMethod] ||
                        order.shippingMethod}
                    </td>
                    <td className="px-4 py-3 text-zinc-200">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
