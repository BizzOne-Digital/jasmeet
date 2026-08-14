"use client";

import { ProductCard, type ProductCardProduct } from "@/components/product/ProductCard";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { cn } from "@/lib/utils";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export interface ProductGridProps {
  products: ProductCardProduct[];
  currency?: string;
  className?: string;
  loading?: boolean;
  skeletonCount?: number;
  columns?: "2" | "3" | "4";
  emptyMessage?: string;
  /** How many leading cards get fetch priority (default 0 — avoid competing with hero LCP). */
  priorityCount?: number;
}

const colClasses = {
  "2": "grid-cols-2",
  "3": "grid-cols-2 md:grid-cols-3",
  "4": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
};

export function ProductGrid({
  products,
  currency = "CAD",
  className,
  loading,
  skeletonCount = 8,
  columns = "4",
  emptyMessage = "Try adjusting your filters or browse all collections.",
  priorityCount = 0,
}: ProductGridProps) {
  if (loading) {
    return (
    <div className={cn("grid w-full max-w-full gap-3 sm:gap-4 lg:gap-5", colClasses[columns], className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-2xl text-[#F5F0E6]">No products found</p>
        <p className="mt-2 text-sm text-white/50">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("grid w-full max-w-full gap-3 sm:gap-4 lg:gap-5", colClasses[columns], className)}>
      {products.map((product, index) => (
        <RevealOnScroll key={String(product._id)} index={index} direction="up">
          <ProductCard
            product={product}
            currency={currency}
            priority={index < priorityCount}
            index={index}
          />
        </RevealOnScroll>
      ))}
    </div>
  );
}
