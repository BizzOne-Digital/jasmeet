"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Pencil } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";

interface PageRow {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  status: "draft" | "published";
  updatedAt?: string;
}

export default function AdminPagesPage() {
  const { openSidebar } = useAdminShell();
  const { error: toastError } = useToast();
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const result = await adminFetch<PageRow[]>("/api/pages");
      if (!result.success) toastError(result.error);
      else setPages(result.data);
      setLoading(false);
    })();
  }, [toastError]);

  const columns: DataTableColumn<PageRow>[] = [
    {
      key: "title",
      header: "Page",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-amber-400">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-zinc-100">{row.title}</p>
            <p className="text-xs text-zinc-500">/{row.slug === "home" ? "" : row.slug}</p>
          </div>
        </div>
      ),
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
      key: "description",
      header: "Description",
      className: "hidden md:table-cell max-w-xs",
      render: (row) => (
        <span className="line-clamp-1 text-zinc-500">{row.description || "—"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Link
          href={`/admin/pages/${row.slug}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-amber-500/40 hover:text-amber-300"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit sections
        </Link>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title="Pages"
        subtitle="Edit content sections for each public page"
        onMenuClick={openSidebar}
      />
      <main className="flex-1 p-4 sm:p-6">
        <DataTable
          columns={columns}
          data={pages}
          rowKey={(row) => row._id}
          loading={loading}
          emptyMessage="No pages found. Run the seed script to create pages."
          onRowClick={(row) => {
            window.location.href = `/admin/pages/${row.slug}`;
          }}
        />
      </main>
    </>
  );
}
