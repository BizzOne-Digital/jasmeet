"use client";

import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import type { ProductCardData } from "@/components/product/ProductCard";
import type { PageSectionData } from "@/types";
import { cn } from "@/lib/utils";

export interface NewArrivalsSectionProps {
  section?: Partial<PageSectionData> | null;
  products?: ProductCardData[];
  currency?: string;
  className?: string;
}

export function NewArrivalsSection({
  section,
  products = [],
  currency,
  className,
}: NewArrivalsSectionProps) {
  return (
    <FeaturedProducts
      section={{
        eyebrow: "Just in",
        heading: "New Arrivals",
        subheading: "Fresh silhouettes for the season ahead.",
        ctaLabel: "Shop new",
        ctaUrl: "/shop?newArrival=true",
        ...section,
      }}
      products={products}
      currency={currency}
      className={cn("bg-background", className)}
    />
  );
}
