import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  const withEllipsis: Array<number | "…"> = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - (pages[i - 1] as number) > 1) withEllipsis.push("…");
    withEllipsis.push(p);
  });

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={makeHref(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          "border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.16em]",
          page <= 1 && "pointer-events-none opacity-30"
        )}
      >
        Prev
      </Link>
      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-2 text-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={makeHref(p)}
            className={cn(
              "min-w-10 border px-3 py-2 text-center text-xs",
              p === page ? "border-gold text-gold" : "border-white/15 text-beige/70"
            )}
          >
            {p}
          </Link>
        )
      )}
      <Link
        href={makeHref(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn(
          "border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.16em]",
          page >= totalPages && "pointer-events-none opacity-30"
        )}
      >
        Next
      </Link>
    </nav>
  );
}
