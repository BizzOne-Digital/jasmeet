"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { LocalImageField } from "@/components/admin/LocalImageField";
import {
  adminCardClass,
  adminCardInnerClass,
  adminFieldClass,
  adminLabelClass,
  adminLinkActionClass,
  adminPageClass,
  adminPrimaryBtnClass,
  adminSectionTitleClass,
} from "@/components/admin/admin-ui";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";

interface GalleryItem {
  _id: string;
  image: string;
  caption: string;
  altText: string;
  collection?: { _id: string; name: string } | string;
  category?: { _id: string; name: string } | string;
  order: number;
  isActive: boolean;
}

interface Option {
  _id: string;
  name: string;
}

const gallerySchema = z.object({
  image: z.string().min(1, "Image is required"),
  caption: z.string(),
  altText: z.string(),
  collection: z.string().optional(),
  category: z.string().optional(),
  order: z.coerce.number().int(),
  isActive: z.boolean(),
});

type GalleryFormValues = z.infer<typeof gallerySchema>;

const fieldClass = adminFieldClass;
const labelClass = adminLabelClass;

export default function AdminGalleryPage() {
  const { openSidebar } = useAdminShell();
  const { success, error: toastError } = useToast();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [collections, setCollections] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      image: "",
      caption: "",
      altText: "",
      collection: "",
      category: "",
      order: 0,
      isActive: true,
    },
  });

  const image = watch("image");

  const load = useCallback(async () => {
    const [gallery, cols, cats] = await Promise.all([
      adminFetch<GalleryItem[]>("/api/gallery?all=true"),
      adminFetch<Option[]>("/api/collections?all=true"),
      adminFetch<Option[]>("/api/categories?all=true"),
    ]);
    if (!gallery.success) toastError(gallery.error);
    else setItems([...gallery.data].sort((a, b) => a.order - b.order));
    if (cols.success) setCollections(cols.data);
    if (cats.success) setCategories(cats.data);
    setLoading(false);
  }, [toastError]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    reset({
      image: "",
      caption: "",
      altText: "",
      collection: "",
      category: "",
      order: items.length,
      isActive: true,
    });
    setShowForm(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    reset({
      image: item.image,
      caption: item.caption || "",
      altText: item.altText || "",
      collection:
        typeof item.collection === "object"
          ? item.collection?._id || ""
          : item.collection || "",
      category:
        typeof item.category === "object"
          ? item.category?._id || ""
          : item.category || "",
      order: item.order,
      isActive: item.isActive,
    });
    setShowForm(true);
  };

  const onSubmit = async (values: GalleryFormValues) => {
    setSaving(true);
    const payload = {
      ...values,
      collection: values.collection || undefined,
      category: values.category || undefined,
    };

    const result = editing
      ? await adminFetch(`/api/gallery/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : await adminFetch("/api/gallery", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    setSaving(false);
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success(editing ? "Gallery item updated" : "Gallery item created");
    setShowForm(false);
    await load();
  };

  const reorder = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    const [r1, r2] = await Promise.all([
      adminFetch(`/api/gallery/${a._id}`, {
        method: "PUT",
        body: JSON.stringify({ order: b.order }),
      }),
      adminFetch(`/api/gallery/${b._id}`, {
        method: "PUT",
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    if (!r1.success || !r2.success) {
      toastError("Failed to reorder");
      return;
    }
    await load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await adminFetch(`/api/gallery/${deleteId}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setDeleteId(null);
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success("Gallery item deleted");
    await load();
  };

  return (
    <>
      <AdminHeader
        title="Gallery"
        subtitle="Campaign imagery for the public gallery"
        onMenuClick={openSidebar}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className={adminPrimaryBtnClass}
          >
            <Plus className="h-4 w-4" />
            Add image
          </button>
        }
      />
      <main className={`${adminPageClass} space-y-6`}>
        {showForm ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={`${adminCardClass} ${adminCardInnerClass}`}
          >
            <h2 className={`${adminSectionTitleClass} mb-4`}>
              {editing ? "Edit gallery item" : "New gallery item"}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <LocalImageField
                label="Image"
                value={image}
                onChange={(url: string) =>
                  setValue("image", url, { shouldDirty: true })
                }
                onClear={() => setValue("image", "", { shouldDirty: true })}
                folder="gallery"
              />
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs uppercase text-zinc-500">
                    Alt text
                  </label>
                  <input className={fieldClass} {...register("altText")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase text-zinc-500">
                    Caption
                  </label>
                  <input className={fieldClass} {...register("caption")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase text-zinc-500">
                    Collection
                  </label>
                  <select className={fieldClass} {...register("collection")}>
                    <option value="">None</option>
                    {collections.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase text-zinc-500">
                    Category
                  </label>
                  <select className={fieldClass} {...register("category")}>
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase text-zinc-500">
                    Order
                  </label>
                  <input
                    type="number"
                    className={fieldClass}
                    {...register("order")}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input type="checkbox" {...register("isActive")} />
                  Active
                </label>
                {errors.image ? (
                  <p className="text-xs text-red-400">{errors.image.message}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={adminPrimaryBtnClass}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save
              </button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded-xl bg-zinc-900/60"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className={`${adminCardClass} px-6 py-16 text-center text-sm text-zinc-500`}>
            No gallery items yet
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <div
                key={item._id}
                className={`overflow-hidden ${adminCardClass}`}
              >
                <div className="relative aspect-[4/5] bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.altText || item.caption || "Gallery"}
                    className="h-full w-full object-cover"
                  />
                  {!item.isActive ? (
                    <span className="absolute left-2 top-2 rounded bg-zinc-950/80 px-2 py-1 text-[10px] uppercase text-zinc-400">
                      Inactive
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2 p-3">
                  <p className="line-clamp-1 text-sm text-zinc-200">
                    {item.caption || "Untitled"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => void reorder(index, -1)}
                        disabled={index === 0}
                        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void reorder(index, 1)}
                        disabled={index === items.length - 1}
                        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className={`rounded p-1.5 text-zinc-400 hover:bg-white/[0.04] ${adminLinkActionClass}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(item._id)}
                        className="rounded p-1.5 text-zinc-400 hover:bg-red-950/50 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete gallery item?"
        description="This image will be removed from the public gallery."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
