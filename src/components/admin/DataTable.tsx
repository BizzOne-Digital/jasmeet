"use client";

import { adminCardClass } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage = "No records found",
  loading,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn(adminCardClass, "overflow-hidden")}>
        <div className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div
        className={cn(
          adminCardClass,
          "px-6 py-16 text-center text-sm text-zinc-500"
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn(adminCardClass, "overflow-x-auto")}>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "whitespace-nowrap px-5 py-3.5 font-medium",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "text-zinc-300 transition hover:bg-white/[0.02]",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-5 py-4 align-middle", col.className)}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
