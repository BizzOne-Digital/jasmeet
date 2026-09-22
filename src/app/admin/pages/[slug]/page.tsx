"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import SectionEditor, {
  type SectionFormValues,
} from "@/components/admin/SectionEditor";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";
import type { PageSectionData } from "@/types";

export default function AdminPageSectionsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { openSidebar } = useAdminShell();
  const { success, error: toastError } = useToast();

  const [sections, setSections] = useState<PageSectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const result = await adminFetch<PageSectionData[]>(
      `/api/pages/${slug}/sections`
    );
    if (!result.success) {
      toastError(result.error);
      setSections([]);
    } else {
      setSections(
        [...result.data].sort((a, b) => a.order - b.order).map((s) => ({
          ...s,
          _id: String(s._id),
        }))
      );
    }
    setLoading(false);
  }, [slug, toastError]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveSection = async (id: string, values: SectionFormValues) => {
    setSavingId(id);
    const result = await adminFetch(`/api/pages/sections/${id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });
    setSavingId(null);
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success("Section saved");
    await load();
  };

  const reorder = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    const a = sections[index];
    const b = sections[target];
    const aOrder = a.order;
    const bOrder = b.order;

    const [r1, r2] = await Promise.all([
      adminFetch(`/api/pages/sections/${a._id}`, {
        method: "PUT",
        body: JSON.stringify({ order: bOrder }),
      }),
      adminFetch(`/api/pages/sections/${b._id}`, {
        method: "PUT",
        body: JSON.stringify({ order: aOrder }),
      }),
    ]);

    if (!r1.success || !r2.success) {
      toastError("Failed to reorder sections");
      return;
    }
    success("Sections reordered");
    await load();
  };

  const toggleVisibility = async (section: PageSectionData) => {
    const result = await adminFetch(`/api/pages/sections/${section._id}`, {
      method: "PUT",
      body: JSON.stringify({ isVisible: !section.isVisible }),
    });
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success(section.isVisible ? "Section hidden" : "Section visible");
    await load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await adminFetch(`/api/pages/sections/${deleteId}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setDeleteId(null);
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success("Section deleted");
    await load();
  };

  const addSection = async () => {
    setAdding(true);
    const nextOrder =
      sections.length > 0
        ? Math.max(...sections.map((s) => s.order)) + 1
        : 0;
    const result = await adminFetch(`/api/pages/${slug}/sections`, {
      method: "POST",
      body: JSON.stringify({
        sectionKey: `section-${Date.now()}`,
        internalName: "New section",
        heading: "",
        theme: "dark",
        alignment: "left",
        isVisible: true,
        order: nextOrder,
        status: "draft",
      }),
    });
    setAdding(false);
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success("Section added");
    await load();
  };

  return (
    <>
      <AdminHeader
        title={`Edit: ${slug}`}
        subtitle="Reorder, hide, and publish page sections"
        onMenuClick={openSidebar}
        actions={
          <button
            type="button"
            onClick={() => void addSection()}
            disabled={adding}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-60"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add section
          </button>
        }
      />
      <main className="flex-1 space-y-4 p-4 sm:p-6">
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to pages
        </Link>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl bg-zinc-900/60"
              />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center text-sm text-zinc-500">
            No sections yet. Add one to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <SectionEditor
                key={section._id}
                section={section}
                saving={savingId === section._id}
                onSave={(values) => saveSection(section._id, values)}
                onDelete={() => setDeleteId(section._id)}
                onMoveUp={
                  index > 0 ? () => void reorder(index, -1) : undefined
                }
                onMoveDown={
                  index < sections.length - 1
                    ? () => void reorder(index, 1)
                    : undefined
                }
                onToggleVisibility={() => void toggleVisibility(section)}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete section?"
        description="This cannot be undone. The section will be removed from the page."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
