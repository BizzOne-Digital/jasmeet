"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export interface FilterOption {
  label: string;
  value: string;
}

export type NamedSlug = { name: string; slug: string } | FilterOption;

export interface ProductFiltersProps {
  collections?: NamedSlug[];
  categories?: NamedSlug[];
  sizes?: string[];
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function toOptions(items: NamedSlug[]): FilterOption[] {
  return items.map((item) =>
    "label" in item && "value" in item
      ? item
      : { label: item.name, value: item.slug }
  );
}

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name", value: "name" },
];

export function ProductFilters({
  collections = [],
  categories = [],
  sizes = SIZE_OPTIONS,
  className,
  mobileOpen,
  onMobileClose,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const collectionOptions = toOptions(collections);
  const categoryOptions = toOptions(categories);

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) params.delete(key);
      else params.set(key, value);
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const toggleSize = (size: string) => {
    const current = searchParams.get("sizes")?.split(",").filter(Boolean) || [];
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    update("sizes", next.length ? next.join(",") : null);
  };

  const clearAll = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
      onMobileClose?.();
    });
  };

  const selectedSizes =
    searchParams.get("sizes")?.split(",").filter(Boolean) || [];

  const content = (
    <div className={cn("space-y-8", className, pending && "opacity-70")}>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#D4AF37]">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </p>
        <button
          type="button"
          onClick={clearAll}
          className="text-[10px] uppercase tracking-[0.18em] text-white/45 hover:text-[#F5F0E6]"
        >
          Clear
        </button>
      </div>

      <Select
        label="Sort"
        options={SORT_OPTIONS}
        value={searchParams.get("sort") || "newest"}
        onChange={(e) => update("sort", e.target.value)}
      />

      {collectionOptions.length > 0 ? (
        <Select
          label="Collection"
          placeholder="All collections"
          options={collectionOptions}
          value={searchParams.get("collection") || ""}
          onChange={(e) => update("collection", e.target.value || null)}
        />
      ) : null}

      {categoryOptions.length > 0 ? (
        <Select
          label="Category"
          placeholder="All categories"
          options={categoryOptions}
          value={searchParams.get("category") || ""}
          onChange={(e) => update("category", e.target.value || null)}
        />
      ) : null}

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#F5F0E6]/70">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={cn(
                  "min-w-10 border px-3 py-2 text-xs uppercase tracking-wider transition",
                  active
                    ? "border-[#D4AF37] text-[#D4AF37]"
                    : "border-white/20 text-[#F5F0E6] hover:border-white/45"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#F5F0E6]/70">
          Price
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            defaultValue={searchParams.get("minPrice") || ""}
            onBlur={(e) => update("minPrice", e.target.value || null)}
            className="h-10 border border-white/15 bg-transparent px-3 text-sm text-[#F5F0E6] focus:border-[#D4AF37]/70 focus:outline-none"
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            defaultValue={searchParams.get("maxPrice") || ""}
            onBlur={(e) => update("maxPrice", e.target.value || null)}
            className="h-10 border border-white/15 bg-transparent px-3 text-sm text-[#F5F0E6] focus:border-[#D4AF37]/70 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        {(
          [
            ["featured", "Featured"],
            ["newArrival", "New arrivals"],
            ["onSale", "On sale"],
            ["inStock", "In stock"],
          ] as const
        ).map(([key, label]) => {
          const active = searchParams.get(key) === "true";
          return (
            <button
              key={key}
              type="button"
              onClick={() => update(key, active ? null : "true")}
              className={cn(
                "flex w-full items-center justify-between border px-3 py-2.5 text-left text-xs uppercase tracking-[0.16em] transition",
                active
                  ? "border-[#D4AF37]/60 text-[#D4AF37]"
                  : "border-white/10 text-white/65 hover:border-white/30"
              )}
            >
              {label}
              <span
                className={cn(
                  "h-3 w-3 border",
                  active ? "border-[#D4AF37] bg-[#D4AF37]" : "border-white/30"
                )}
              />
            </button>
          );
        })}
      </div>

      {onMobileClose ? (
        <Button fullWidth onClick={onMobileClose}>
          Show results
        </Button>
      ) : null}
    </div>
  );

  if (typeof mobileOpen === "boolean") {
    return (
      <>
        <aside className="hidden w-64 shrink-0 lg:block">{content}</aside>
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              aria-label="Close filters"
              onClick={onMobileClose}
            />
            <div className="absolute inset-y-0 left-0 w-[min(100%,320px)] overflow-y-auto bg-[#0a0a0a] p-5">
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="p-2 text-white/60"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {content}
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return <aside className="w-full lg:w-64 shrink-0">{content}</aside>;
}
