"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import {
  adminLinkActionClass,
  adminPageClass,
  adminSearchClass,
  adminSelectClass,
} from "@/components/admin/admin-ui";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";
import { formatPrice } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
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
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [preOrderOnly, setPreOrderOnly] = useState(false);
  const [search, setSearch] = useState("");

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) => {
      const customer = [
        order.shippingAddress?.firstName,
        order.shippingAddress?.lastName,
        order.shippingAddress?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(q) || customer.includes(q)
      );
    });
  }, [orders, search]);

  const columns: DataTableColumn<OrderRow>[] = [
    {
      key: "order",
      header: "Order",
      render: (row) => (
        <div>
          <span className="font-medium text-white">{row.orderNumber}</span>
          {row.hasPreOrderItems ? (
            <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-[#D4AF37]">
              Pre-order
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <div>
          <p className="text-zinc-200">
            {row.shippingAddress?.firstName} {row.shippingAddress?.lastName}
          </p>
          <p className="text-xs text-zinc-500">{row.shippingAddress?.email}</p>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (row) => formatPrice(row.total),
    },
    {
      key: "payment",
      header: "Payment",
      className: "hidden md:table-cell",
      render: () => <span className="text-zinc-400">Stripe</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className="text-[11px] uppercase tracking-[0.1em] text-[#D4AF37]">
          {ORDER_STATUS_LABELS[row.orderStatus] || row.orderStatus}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      className: "hidden lg:table-cell",
      render: (row) => (
        <span className="text-zinc-500">
          {new Date(row.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Link
          href={`/admin/orders/${row._id}`}
          className={adminLinkActionClass}
          onClick={(e) => e.stopPropagation()}
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title="Orders"
        subtitle={
          loading
            ? "Loading orders…"
            : `${filtered.length} order${filtered.length === 1 ? "" : "s"} — click a row for details`
        }
        onMenuClick={openSidebar}
      />
      <main className={`${adminPageClass} space-y-5`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, email, customer…"
              className={adminSearchClass}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={adminSelectClass}
          >
            <option value="all">All statuses</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label className="flex shrink-0 items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={preOrderOnly}
              onChange={(e) => setPreOrderOnly(e.target.checked)}
              className="rounded border-white/20 bg-black"
            />
            Pre-order only
          </label>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(row) => row._id}
          loading={loading}
          emptyMessage="No orders yet. Real Stripe checkouts will appear here."
          onRowClick={(row) => router.push(`/admin/orders/${row._id}`)}
        />
      </main>
    </>
  );
}
