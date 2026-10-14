"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import ProductForm, {
  type ProductFormSubmitValues,
} from "@/components/admin/ProductForm";
import {
  adminLinkActionClass,
  adminPageClass,
} from "@/components/admin/admin-ui";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";
import { generateSKU } from "@/lib/utils";

function NewProductContent() {
  const { openSidebar } = useAdminShell();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: ProductFormSubmitValues) => {
    setLoading(true);
    const result = await adminFetch<{ _id: string }>("/api/products", {
      method: "POST",
      body: JSON.stringify({
        ...values,
        sku: values.sku || generateSKU(),
        sizeGuide: values.sizeGuide ?? null,
        compareAtPrice:
          values.compareAtPrice === undefined ||
          Number.isNaN(Number(values.compareAtPrice))
            ? undefined
            : Number(values.compareAtPrice),
      }),
    });
    setLoading(false);

    if (!result.success) {
      toastError(result.error);
      return;
    }

    success("Product created");
    router.push(`/admin/products/${result.data._id}`);
  };

  return (
    <>
      <AdminHeader
        title="New product"
        subtitle="Create a catalog item"
        onMenuClick={openSidebar}
      />
      <main className={`${adminPageClass} mx-auto max-w-4xl space-y-4`}>
        <Link href="/admin/products" className={adminLinkActionClass}>
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <ProductForm
          defaultValues={{ sku: generateSKU() }}
          onSubmit={onSubmit}
          submitLabel="Create product"
          loading={loading}
        />
      </main>
    </>
  );
}

export default function AdminNewProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-10 text-zinc-500">
          Loading…
        </div>
      }
    >
      <NewProductContent />
    </Suspense>
  );
}
