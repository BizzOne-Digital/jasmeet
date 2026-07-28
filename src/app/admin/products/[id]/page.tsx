"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import ProductForm, {
  type ProductFormValues,
} from "@/components/admin/ProductForm";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";

interface ProductPayload {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  description?: string;
  collection: string | { _id: string };
  category: string | { _id: string };
  price: number;
  compareAtPrice?: number;
  images?: string[];
  hoverImage?: string;
  colors?: { name: string; hex: string }[];
  sizes?: { size: string; stock: number }[];
  materials?: string;
  careInstructions?: string;
  fitDetails?: string;
  hiddenMessage?: string;
  highlights?: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isOnSale?: boolean;
  status: "draft" | "published";
  order?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  const { openSidebar } = useAdminShell();
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const [product, setProduct] = useState<ProductPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void (async () => {
      const result = await adminFetch<ProductPayload>(
        `/api/products/${params.id}`
      );
      if (!result.success) {
        toastError(result.error);
      } else {
        setProduct(result.data);
      }
      setLoading(false);
    })();
  }, [params.id, toastError]);

  const onSubmit = async (values: ProductFormValues) => {
    setSaving(true);
    const result = await adminFetch(`/api/products/${params.id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...values,
        compareAtPrice:
          values.compareAtPrice === undefined ||
          Number.isNaN(Number(values.compareAtPrice))
            ? undefined
            : Number(values.compareAtPrice),
      }),
    });
    setSaving(false);

    if (!result.success) {
      toastError(result.error);
      return;
    }
    success("Product updated");
  };

  const confirmDelete = async () => {
    setDeleting(true);
    const result = await adminFetch(`/api/products/${params.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success("Product deleted");
    router.push("/admin/products");
  };

  const defaults: Partial<ProductFormValues> | undefined = product
    ? {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        collection:
          typeof product.collection === "object"
            ? product.collection._id
            : product.collection,
        category:
          typeof product.category === "object"
            ? product.category._id
            : product.category,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        images: product.images || [],
        hoverImage: product.hoverImage || "",
        colors: product.colors || [],
        sizes: product.sizes || [],
        materials: product.materials || "",
        careInstructions: product.careInstructions || "",
        fitDetails: product.fitDetails || "",
        hiddenMessage: product.hiddenMessage || "",
        highlights: product.highlights || [],
        isFeatured: !!product.isFeatured,
        isNewArrival: !!product.isNewArrival,
        isOnSale: !!product.isOnSale,
        status: product.status,
        order: product.order || 0,
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
      }
    : undefined;

  return (
    <>
      <AdminHeader
        title={product?.name || "Edit product"}
        subtitle="Update catalog fields and publish status"
        onMenuClick={openSidebar}
        actions={
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-900/60 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        }
      />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-4 p-4 sm:p-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>

        {loading || !defaults ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl bg-zinc-900/60"
              />
            ))}
          </div>
        ) : (
          <ProductForm
            key={product?._id}
            defaultValues={defaults}
            onSubmit={onSubmit}
            submitLabel="Save changes"
            loading={saving}
          />
        )}
      </main>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete product?"
        description="This permanently removes the product from the catalog."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
