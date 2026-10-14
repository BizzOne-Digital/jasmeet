"use client";

import { cn } from "@/lib/utils";
import {
  sizeGuideHasContent,
  type SizeGuideData,
  type SizeGuideSection,
} from "@/lib/size-guide";

export type { SizeGuideData, SizeGuideSection };
export { sizeGuideHasContent };

export interface SizeGuideTableProps {
  guide: SizeGuideData;
  className?: string;
}

function GuideTable({
  title,
  columns,
  rows,
}: {
  title?: string;
  columns: string[];
  rows: Array<{ size: string; values: string[] }>;
}) {
  return (
    <div className="space-y-2">
      {title ? (
        <p className="text-center text-sm font-medium tracking-wide text-[#F5F0E6]">
          {title}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-sm border border-white/10">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[#8B7355] text-white">
              <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em]">
                Size
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={`${title || "guide"}-${row.size}`}
                className={
                  i % 2 === 0
                    ? "bg-[#F5F0E6] text-[#1a1a1a]"
                    : "bg-white text-[#1a1a1a]"
                }
              >
                <td className="px-3 py-2.5 font-medium">{row.size}</td>
                {columns.map((_, colIdx) => (
                  <td
                    key={`${row.size}-${colIdx}`}
                    className="px-3 py-2.5 tabular-nums"
                  >
                    {row.values[colIdx] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SizeGuideTable({ guide, className }: SizeGuideTableProps) {
  const unit = guide.unit?.trim() || "CM";

  if (!sizeGuideHasContent(guide)) {
    return <p className="text-sm text-white/55">Size guide coming soon.</p>;
  }

  const sections: SizeGuideSection[] =
    guide.sections?.filter((s) => s.columns?.length && s.rows?.length) ||
    (guide.columns?.length && guide.rows?.length
      ? [{ columns: guide.columns, rows: guide.rows }]
      : []);

  return (
    <div className={cn("space-y-5", className)}>
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37]">
        Unit: {unit}
      </p>
      {sections.map((section, i) => (
        <GuideTable
          key={section.title || `section-${i}`}
          title={section.title}
          columns={section.columns}
          rows={section.rows}
        />
      ))}
    </div>
  );
}
