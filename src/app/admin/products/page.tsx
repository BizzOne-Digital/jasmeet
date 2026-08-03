"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";
import { formatPrice } from "@/lib/utils";

interface ProductRow {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  status: "draft" | "published";
  images?: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isOnSale?: boolean;
  isBestSeller?: boolean;
  isComingSoon?: boolean;
  collection?: { name?: string } | string;
}

interface ProductsResponse {
  products: ProductRow[];
  total: number;
  page: number;
  totalPages: number;
}

function ProductsContent() {
  const { openSidebar } = useAdminShell();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      status: status || "all",
      limit: "50",
      sort: "newest",
    });
    if (search.trim()) params.set("search", search.trim());

    const result = await adminFetch<ProductsResponse>(
      `/api/products?${params.toString()}`
    );
    if (!result.success) {
      toastError(result.error);
      setProducts([]);
    } else {
      setProducts(result.data.products);
    }
    setLoading(false);
  }, [search, status, toastError]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(t);
  }, [load]);

  const duplicateProduct = async (row: ProductRow) => {
    setBusy(true);
    const full = await adminFetch<Record<string, unknown>>(
      `/api/products/${row._id}`
    );
    if (!full.success) {
      toastError(full.error);
      setBusy(false);
      return;
    }

    const src = full.data;
    const collectionId =
      typeof src.collection === "object" && src.collection
        ? String((src.collection as { _id: string })._id)
        : String(src.collection);
    const categoryId =
      typeof src.category === "object" && src.category
        ? String((src.category as { _id: string })._id)
        : String(src.category);

    const result = await adminFetch("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: `${src.name} (Copy)`,
        slug: `${src.slug}-copy-${Date.now().toString(36)}`,
        shortDescription: src.shortDescription,
        description: src.description,
        collection: collectionId,
        category: categoryId,
        price: src.price,
        compareAtPrice: src.compareAtPrice,
        images: src.images,
        hoverImage: src.hoverImage,
        colors: src.colors,
        sizes: src.sizes,
        materials: src.materials,
        careInstructions: src.careInstructions,
        fitDetails: src.fitDetails,
        hiddenMessage: src.hiddenMessage,
        highlights: src.highlights,
        isFeatured: false,
        isNewArrival: src.isNewArrival,
        isOnSale: src.isOnSale,
        isBestSeller: src.isBestSeller,
        isComingSoon: src.isComingSoon,
        allowPreOrder: src.allowPreOrder,
        preOrderLeadTime: src.preOrderLeadTime,
        inventory: src.inventory,
        status: "draft",
        order: src.order,
        seoTitle: src.seoTitle,
        seoDescription: src.seoDescription,
      }),
    });
    setBusy(false);
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success("Product duplicated as draft");
    await load();
  };

  const columns: DataTableColumn<ProductRow>[] = [
    {
      key: "product",
      header: "Product",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-lg bg-zinc-800">
            {row.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.images[0]}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div>
            <p className="font-medium text-zinc-100">{row.name}</p>
            <p className="text-xs text-zinc-500">{row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (row) => formatPrice(row.price),
    },
    {
      key: "collection",
      header: "Collection",
      className: "hidden lg:table-cell",
      render: (row) =>
        typeof row.collection === "object" ? row.collection?.name || "—" : "—",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={
            row.status === "published"
              ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400"
              : "rounded-full bg-zinc-700/50 px-2.5 py-1 text-xs text-zinc-400"
          }
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "flags",
      header: "Flags",
      className: "hidden md:table-cell",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.isFeatured ? (
            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400">
              Featured
            </span>
          ) : null}
          {row.isBestSeller ? (
            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300">
              Best seller
            </span>
          ) : null}
          {row.isNewArrival ? (
            <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] text-sky-400">
              New
            </span>
          ) : null}
          {row.isOnSale ? (
            <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-400">
              Sale
            </span>
          ) : null}
          {row.isComingSoon ? (
            <span className="rounded bg-zinc-500/20 px-1.5 py-0.5 text-[10px] text-zinc-300">
              Coming soon
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div
          className="flex justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/admin/products/${row._id}`}
            className="rounded p-2 text-zinc-400 hover:bg-zinc-800 hover:text-amber-300"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => void duplicateProduct(row)}
            className="rounded p-2 text-zinc-400 hover:bg-zinc-800 hover:text-amber-300"
            aria-label="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteId(row._id)}
            className="rounded p-2 text-zinc-400 hover:bg-red-950/50 hover:text-red-400"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const result = await adminFetch(`/api/products/${deleteId}`, {
      method: "DELETE",
    });
    setBusy(false);
    setDeleteId(null);
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success("Product deleted");
    await load();
  };

  return (
    <>
      <AdminHeader
        title="Products"
        subtitle="Manage catalog, pricing, and publish status"
        onMenuClick={openSidebar}
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-black hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        }
      />
      <main className="flex-1 space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 pl-10 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-200 focus:border-amber-500/50 focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={products}
          rowKey={(row) => row._id}
          loading={loading}
          emptyMessage="No products found"
          onRowClick={(row) => router.push(`/admin/products/${row._id}`)}
        />
      </main>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete product?"
        description="This permanently removes the product from the catalog."
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-10 text-zinc-500">
          Loading products…
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
