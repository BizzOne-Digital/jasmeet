"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  adminCardClass,
  adminCardInnerClass,
  adminFieldClass,
  adminLabelClass,
  adminLinkActionClass,
  adminPageClass,
  adminPrimaryBtnClass,
} from "@/components/admin/admin-ui";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";
import { slugify } from "@/lib/utils";

interface CollectionItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  imageAlt: string;
  order: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string(),
  image: z.string(),
  imageAlt: z.string(),
  order: z.coerce.number().int(),
  isActive: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const fieldClass = adminFieldClass;
const labelClass = adminLabelClass;

export default function AdminCollectionsPage() {
  const { openSidebar } = useAdminShell();
  const { success, error: toastError } = useToast();

  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CollectionItem | null>(null);
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      image: "",
      imageAlt: "",
      order: 0,
      isActive: true,
      seoTitle: "",
      seoDescription: "",
    },
  });

  const image = watch("image");
  const name = watch("name");

  const load = useCallback(async () => {
    const result = await adminFetch<CollectionItem[]>("/api/collections?all=true");
    if (!result.success) toastError(result.error);
    else setItems([...result.data].sort((a, b) => a.order - b.order));
    setLoading(false);
  }, [toastError]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    reset({
      name: "",
      slug: "",
      description: "",
      image: "",
      imageAlt: "",
      order: items.length,
      isActive: true,
      seoTitle: "",
      seoDescription: "",
    });
    setShowForm(true);
  };

  const openEdit = (item: CollectionItem) => {
    setEditing(item);
    reset({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      image: item.image || "",
      imageAlt: item.imageAlt || "",
      order: item.order,
      isActive: item.isActive,
      seoTitle: item.seoTitle || "",
      seoDescription: item.seoDescription || "",
    });
    setShowForm(true);
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const result = editing
      ? await adminFetch(`/api/collections/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        })
      : await adminFetch("/api/collections", {
          method: "POST",
          body: JSON.stringify(values),
        });
    setSaving(false);

    if (!result.success) {
      toastError(result.error);
      return;
    }

    success(editing ? "Collection updated" : "Collection created");
    setShowForm(false);
    setEditing(null);
    await load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await adminFetch(`/api/collections/${deleteId}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setDeleteId(null);
    if (!result.success) toastError(result.error);
    else {
      success("Collection deleted");
      await load();
    }
  };

  return (
    <div>
      <AdminHeader
        title="Collections"
        subtitle="Manage collection names, descriptions, cover images, and SEO"
        onMenuClick={openSidebar}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className={adminPrimaryBtnClass}
          >
            <Plus className="h-4 w-4" />
            New collection
          </button>
        }
      />

      {showForm ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`${adminCardClass} ${adminCardInnerClass} mx-auto mb-8 max-w-4xl`}
        >
          <h2 className="mb-4 text-lg font-medium text-zinc-100">
            {editing ? "Edit collection" : "New collection"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Name</label>
              <input
                className={fieldClass}
                {...register("name")}
                onBlur={() => {
                  if (!editing && name) {
                    setValue("slug", slugify(name));
                  }
                }}
              />
              {errors.name ? (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              ) : null}
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input className={fieldClass} {...register("slug")} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea rows={3} className={fieldClass} {...register("description")} />
            </div>
            <ImageUpload
              label="Cover image"
              value={image}
              folder="pages"
              onChange={(url) => setValue("image", url, { shouldDirty: true })}
              onClear={() => setValue("image", "", { shouldDirty: true })}
              onSuccess={success}
              onError={toastError}
            />
            <div>
              <label className={labelClass}>Image alt text</label>
              <input className={fieldClass} {...register("imageAlt")} />
            </div>
            <div>
              <label className={labelClass}>Display order</label>
              <input type="number" className={fieldClass} {...register("order")} />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" {...register("isActive")} className="rounded border-zinc-600" />
              Active
            </label>
            <div>
              <label className={labelClass}>SEO title</label>
              <input className={fieldClass} {...register("seoTitle")} />
            </div>
            <div>
              <label className={labelClass}>SEO description</label>
              <textarea rows={2} className={fieldClass} {...register("seoDescription")} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className={adminPrimaryBtnClass}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="mx-4 sm:mx-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : !items.length ? (
          <p className="py-16 text-center text-sm text-zinc-500">No collections yet.</p>
        ) : (
          <div className={`${adminCardClass} mx-auto max-w-5xl overflow-x-auto`}>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Collection</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-zinc-800/60">
                    <td className="px-4 py-3 text-zinc-200">{item.name}</td>
                    <td className="px-4 py-3 text-zinc-400">{item.slug}</td>
                    <td className="px-4 py-3 text-zinc-400">{item.order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          item.isActive ? "text-emerald-400" : "text-zinc-500"
                        }
                      >
                        {item.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className={`rounded p-2 text-zinc-400 hover:bg-white/[0.04] ${adminLinkActionClass}`}
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(item._id)}
                          className="rounded p-2 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete collection?"
        description="Products linked to this collection may need to be reassigned."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
