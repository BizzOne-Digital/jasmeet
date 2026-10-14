"use client";

import { useMemo, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn, safeText } from "@/lib/utils";

export interface GalleryClientItem {
  _id: string;
  image: string;
  caption?: string;
  altText?: string;
  collection?: { name?: string; slug?: string } | null;
}

export function GalleryClient({
  items,
  collections = [],
}: {
  items: GalleryClientItem[];
  collections?: Array<{ name: string; slug: string }>;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<GalleryClientItem | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.collection?.slug === filter);
  }, [filter, items]);

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "border px-4 py-2 text-[11px] uppercase tracking-[0.18em]",
            filter === "all" ? "border-gold text-gold" : "border-white/15 text-beige/70"
          )}
        >
          All
        </button>
        {collections.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setFilter(c.slug)}
            className={cn(
              "border px-4 py-2 text-[11px] uppercase tracking-[0.18em]",
              filter === c.slug ? "border-gold text-gold" : "border-white/15 text-beige/70"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">No gallery images yet.</p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((item, index) => (
            <button
              key={item._id}
              type="button"
              onClick={() => setActive(item)}
              className="mb-4 block w-full break-inside-avoid overflow-hidden bg-surface"
            >
              <div
                className="relative w-full"
                style={{ aspectRatio: index % 3 === 0 ? "3/4" : index % 3 === 1 ? "1/1" : "4/5" }}
              >
                <SafeImage
                  src={item.image}
                  alt={safeText(item.altText, item.caption || "DAYAURA gallery")}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width:1024px) 50vw, 33vw"
                />
              </div>
              {item.caption ? (
                <p className="px-3 py-2 text-left text-xs text-muted">{item.caption}</p>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="absolute right-6 top-6 text-xs uppercase tracking-[0.2em] text-beige"
            onClick={() => setActive(null)}
          >
            Close
          </button>
          <div
            className="relative max-h-[85vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/4] max-h-[75vh] w-full">
              <SafeImage
                src={active.image}
                alt={safeText(active.altText, active.caption || "Gallery")}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
            {active.caption ? (
              <p className="mt-4 text-center text-sm text-beige/80">{active.caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
