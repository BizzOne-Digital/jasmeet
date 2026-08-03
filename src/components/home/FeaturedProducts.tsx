"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductCardData } from "@/components/product/ProductCard";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
      className={cn(
        "section-shell overflow-x-clip bg-dark-surface text-beige",
        className
      )}
    >
      <div className="container-lux">
        <RevealOnScroll>
          <div className="mb-12 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              className="mb-0"
              eyebrow={safeText(section?.eyebrow, "Bestsellers")}
              heading={safeText(section?.heading, "Best Sellers")}
              subheading={safeText(
                section?.subheading,
                "Pieces women return to — sculpted, soft, and performance-ready."
              )}
            />
            <Link href={safeText(section?.ctaUrl, "/shop")} className="shrink-0">
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
