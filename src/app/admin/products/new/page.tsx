"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import ProductForm, {
  type ProductFormValues,
} from "@/components/admin/ProductForm";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";
import { generateSKU } from "@/lib/utils";

function NewProductContent() {
  const { openSidebar } = useAdminShell();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: ProductFormValues) => {
    setLoading(true);
    const result = await adminFetch<{ _id: string }>("/api/products", {
      method: "POST",
      body: JSON.stringify({
        ...values,
        sku: values.sku || generateSKU(),
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
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-4 p-4 sm:p-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-300"
        >
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
