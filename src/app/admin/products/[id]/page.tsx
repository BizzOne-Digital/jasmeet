"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import ProductForm, {
  type ProductFormValues,
  type ProductFormSubmitValues,
  sizeGuideToFormFields,
} from "@/components/admin/ProductForm";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  adminGhostBtnClass,
  adminLinkActionClass,
  adminPageClass,
} from "@/components/admin/admin-ui";
import { adminFetch } from "@/lib/admin-fetch";
import { buildInventoryMatrix } from "@/lib/inventory";
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
  inventory?: { colorName: string; size: string; stock: number }[];
  materials?: string;
  careInstructions?: string;
  fitDetails?: string;
  hiddenMessage?: string;
  highlights?: string[];
  modelInfo?: string;
  sizeGuide?: {
    unit?: string;
    columns?: string[];
    rows?: Array<{ size: string; values: string[] }>;
    sections?: Array<{
      title?: string;
      columns: string[];
      rows: Array<{ size: string; values: string[] }>;
    }>;
  } | null;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isOnSale?: boolean;
  isBestSeller?: boolean;
  isComingSoon?: boolean;
  allowPreOrder?: boolean;
  preOrderLeadTime?: string;
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

  const onSubmit = async (values: ProductFormSubmitValues) => {
    setSaving(true);
    const payload: Record<string, unknown> = {
      ...values,
      compareAtPrice:
        values.compareAtPrice === undefined ||
        Number.isNaN(Number(values.compareAtPrice))
          ? undefined
          : Number(values.compareAtPrice),
    };
    const hasMultiSection = Boolean(product?.sizeGuide?.sections?.length);
    if (hasMultiSection) {
      // Preserve multi-section size guides (admin form is flat single-table)
      delete payload.sizeGuide;
    } else if (values.sizeGuide) {
      payload.sizeGuide = values.sizeGuide;
    } else {
      delete payload.sizeGuide;
    }
    const result = await adminFetch(`/api/products/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
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
        inventory:
          product.inventory?.length
            ? product.inventory
            : buildInventoryMatrix(
                product.colors || [],
                product.sizes || [],
                []
              ),
        materials: product.materials || "",
        careInstructions: product.careInstructions || "",
        fitDetails: product.fitDetails || "",
        hiddenMessage: product.hiddenMessage || "",
        highlights: product.highlights || [],
        modelInfo: product.modelInfo || "",
        ...sizeGuideToFormFields(product.sizeGuide),
        isFeatured: !!product.isFeatured,
        isNewArrival: !!product.isNewArrival,
        isOnSale: !!product.isOnSale,
        isBestSeller: !!product.isBestSeller,
        isComingSoon: !!product.isComingSoon,
        allowPreOrder: !!product.allowPreOrder,
        preOrderLeadTime:
          product.preOrderLeadTime || "Pre-Order – Ships in 2–3 weeks",
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
            className={`${adminGhostBtnClass} border-red-900/60 text-red-300 hover:border-red-800 hover:text-red-200`}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        }
      />
      <main className={`${adminPageClass} mx-auto max-w-4xl space-y-4`}>
        <Link href="/admin/products" className={adminLinkActionClass}>
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
