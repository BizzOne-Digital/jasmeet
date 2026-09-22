"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  adminLinkActionClass,
  adminPageClass,
  adminPrimaryBtnClass,
  adminSearchClass,
  adminSelectClass,
} from "@/components/admin/admin-ui";
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
  allowPreOrder?: boolean;
  sizes?: { size: string; stock: number }[];
  collection?: { name?: string } | string;
}

interface ProductsResponse {
  products: ProductRow[];
  total: number;
  page: number;
  totalPages: number;
}

function productStock(row: ProductRow) {
  return (row.sizes || []).reduce((sum, s) => sum + (s.stock || 0), 0);
}

function ProductsContent() {
  const { openSidebar } = useAdminShell();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [total, setTotal] = useState(0);
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
      setTotal(0);
    } else {
      setProducts(result.data.products);
      setTotal(result.data.total);
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
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white/[0.04]">
            {row.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.images[0]}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{row.name}</p>
            <p className="truncate text-xs text-zinc-500">{row.slug}</p>
            <p className="text-xs text-zinc-600">SKU {row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (row) => (
        <span className="text-zinc-200">{formatPrice(row.price)}</span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      className: "hidden sm:table-cell",
      render: (row) => (
        <span className="text-zinc-300">{productStock(row)}</span>
      ),
    },
    {
      key: "flags",
      header: "Flags",
      className: "hidden md:table-cell",
      render: (row) => (
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.08em] text-[#D4AF37]">
          {row.status === "draft" ? <span>Draft</span> : null}
          {row.isNewArrival ? <span>New</span> : null}
          {row.isBestSeller ? <span>Bestseller</span> : null}
          {row.isFeatured ? <span>Featured</span> : null}
          {row.isOnSale ? <span>Sale</span> : null}
          {row.isComingSoon ? <span>Coming soon</span> : null}
          {row.allowPreOrder ? <span>Pre-order</span> : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div
          className="flex flex-wrap items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/admin/products/${row._id}`}
            className={adminLinkActionClass}
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => void duplicateProduct(row)}
            className={adminLinkActionClass}
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => setDeleteId(row._id)}
            className={`${adminLinkActionClass} hover:text-red-400`}
          >
            Delete
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
        subtitle={
          loading
            ? "Loading catalog…"
            : `${total} catalog item${total === 1 ? "" : "s"}`
        }
        onMenuClick={openSidebar}
        actions={
          <Link href="/admin/products/new" className={adminPrimaryBtnClass}>
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        }
      />
      <main className={`${adminPageClass} space-y-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className={adminSearchClass}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={adminSelectClass}
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
