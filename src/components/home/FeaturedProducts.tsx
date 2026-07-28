"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductCardData } from "@/components/product/ProductCard";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { Button } from "@/components/ui/Button";
import { cn, safeText } from "@/lib/utils";
import type { PageSectionData } from "@/types";

export interface FeaturedProductsProps {
  products?: ProductCardData[];
  section?: Partial<PageSectionData> | null;
  currency?: string;
  className?: string;
}

export function FeaturedProducts({
  products = [],
  section,
  currency = "CAD",
  className,
}: FeaturedProductsProps) {
  return (
    <section
      className={cn("bg-[#0a0a0a] py-20 text-[#F5F0E6] lg:py-28", className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">
                {safeText(section?.eyebrow, "Featured")}
              </p>
              <h2 className="font-serif text-4xl tracking-wide md:text-5xl">
                {safeText(section?.heading, "Bestsellers")}
              </h2>
              <p className="mt-4 text-sm text-white/55 md:text-base">
                {safeText(
                  section?.subheading,
                  "Pieces women return to — sculpted, soft, and performance-ready."
                )}
              </p>
            </div>
            <Link href={safeText(section?.ctaUrl, "/shop")}>
              <Button variant="outline">
                {safeText(section?.ctaLabel, "Shop all")}
              </Button>
            </Link>
          </div>
        </RevealOnScroll>

        <ProductGrid products={products} currency={currency} columns="4" />
      </div>
    </section>
  );
}
