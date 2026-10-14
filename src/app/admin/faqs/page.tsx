"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  adminCardClass,
  adminCardInnerClass,
  adminFieldClass,
  adminLinkActionClass,
  adminPageClass,
  adminPrimaryBtnClass,
  adminSectionTitleClass,
} from "@/components/admin/admin-ui";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

const FAQ_CATEGORIES = [
  "Orders",
  "Shipping",
  "Returns",
  "Sizing",
  "Products",
  "Care",
  "Discounts",
  "General",
];

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().min(1),
  order: z.coerce.number().int(),
  isActive: z.boolean(),
});

type FAQFormValues = z.infer<typeof faqSchema>;

const fieldClass = adminFieldClass;

export default function AdminFAQsPage() {
  const { openSidebar } = useAdminShell();
  const { success, error: toastError } = useToast();

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FAQFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "General",
      order: 0,
      isActive: true,
    },
  });

  const load = useCallback(async () => {
    const result = await adminFetch<FAQItem[]>("/api/faqs?all=true");
    if (!result.success) toastError(result.error);
    else setFaqs([...result.data].sort((a, b) => a.order - b.order));
    setLoading(false);
  }, [toastError]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filterCategory === "all") return faqs;
    return faqs.filter((f) => f.category === filterCategory);
  }, [faqs, filterCategory]);

  const openCreate = () => {
    setEditing(null);
    reset({
      question: "",
      answer: "",
      category: "General",
      order: faqs.length,
      isActive: true,
    });
    setShowForm(true);
  };

  const openEdit = (faq: FAQItem) => {
    setEditing(faq);
    reset({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive,
    });
    setShowForm(true);
  };

  const onSubmit = async (values: FAQFormValues) => {
    setSaving(true);
    const result = editing
      ? await adminFetch(`/api/faqs/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        })
      : await adminFetch("/api/faqs", {
          method: "POST",
          body: JSON.stringify(values),
        });
    setSaving(false);
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success(editing ? "FAQ updated" : "FAQ created");
    setShowForm(false);
    await load();
  };

  const reorder = async (index: number, direction: -1 | 1) => {
    const list = filtered;
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const a = list[index];
    const b = list[target];
    const [r1, r2] = await Promise.all([
      adminFetch(`/api/faqs/${a._id}`, {
        method: "PUT",
        body: JSON.stringify({ order: b.order }),
      }),
      adminFetch(`/api/faqs/${b._id}`, {
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

  const toggleActive = async (faq: FAQItem) => {
    const result = await adminFetch(`/api/faqs/${faq._id}`, {
      method: "PUT",
      body: JSON.stringify({ isActive: !faq.isActive }),
    });
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success(faq.isActive ? "FAQ deactivated" : "FAQ activated");
    await load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await adminFetch(`/api/faqs/${deleteId}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setDeleteId(null);
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success("FAQ deleted");
    await load();
  };

  return (
    <>
      <AdminHeader
        title="FAQs"
        subtitle="Manage questions by category"
        onMenuClick={openSidebar}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className={adminPrimaryBtnClass}
          >
            <Plus className="h-4 w-4" />
            Add FAQ
          </button>
        }
      />
      <main className={`${adminPageClass} space-y-6`}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterCategory("all")}
            className={
              filterCategory === "all"
                ? "rounded-md border border-[#D4AF37]/40 px-3 py-1.5 text-xs font-medium text-[#D4AF37]"
                : "rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900"
            }
          >
            All
          </button>
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={
                filterCategory === cat
                  ? "rounded-md border border-[#D4AF37]/40 px-3 py-1.5 text-xs font-medium text-[#D4AF37]"
                  : "rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900"
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {showForm ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={`${adminCardClass} ${adminCardInnerClass}`}
          >
            <h2 className={`${adminSectionTitleClass} mb-4`}>
              {editing ? "Edit FAQ" : "New FAQ"}
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-xs uppercase text-zinc-500">
                  Question
                </label>
                <input className={fieldClass} {...register("question")} />
                {errors.question ? (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.question.message}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase text-zinc-500">
                  Answer
                </label>
                <textarea rows={4} className={fieldClass} {...register("answer")} />
                {errors.answer ? (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.answer.message}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs uppercase text-zinc-500">
                    Category
                  </label>
                  <select className={fieldClass} {...register("category")}>
                    {FAQ_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase text-zinc-500">
                    Order
                  </label>
                  <input type="number" className={fieldClass} {...register("order")} />
                </div>
                <label className="flex items-end gap-2 pb-2 text-sm text-zinc-300">
                  <input type="checkbox" {...register("isActive")} />
                  Active
                </label>
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
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-zinc-900/60"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className={`${adminCardClass} px-6 py-16 text-center text-sm text-zinc-500`}>
            No FAQs found
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq, index) => (
              <div
                key={faq._id}
                className={`${adminCardClass} p-4`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
                        {faq.category}
                      </span>
                      {!faq.isActive ? (
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] uppercase text-zinc-500">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                    <h3 className="font-medium text-zinc-100">{faq.question}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
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
                      disabled={index === filtered.length - 1}
                      className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleActive(faq)}
                      className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800"
                    >
                      {faq.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(faq)}
                      className={`rounded p-1.5 text-zinc-400 hover:bg-white/[0.04] ${adminLinkActionClass}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(faq._id)}
                      className="rounded p-1.5 text-zinc-400 hover:bg-red-950/50 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete FAQ?"
        description="This question will be permanently removed."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
