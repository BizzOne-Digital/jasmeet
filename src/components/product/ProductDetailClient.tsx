"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { safeText } from "@/lib/utils";
import type { SizeGuideData } from "@/lib/size-guide";

export interface ProductDetailClientProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  colors?: Array<{ name: string; hex: string; images?: string[] }>;
  sizes?: Array<{ size: string; stock: number }>;
  inventory?: Array<{ colorName: string; size: string; stock: number }>;
  shortDescription?: string;
  modelInfo?: string;
  sizeGuide?: SizeGuideData | null;
  isOnSale?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isComingSoon?: boolean;
  allowPreOrder?: boolean;
  preOrderLeadTime?: string;
  collection?: { name?: string; slug?: string } | null;
  category?: { name?: string; slug?: string } | null;
}

import { resolveColorGalleryImages } from "@/lib/product-images";

function imagesForColor(
  product: ProductDetailClientProduct,
  colorName: string
): string[] {
  return resolveColorGalleryImages(product, colorName);
}

export function ProductDetailClient({
  product,
  children,
}: {
  product: ProductDetailClientProduct;
  children?: ReactNode;
}) {
  const initialColor = product.colors?.[0]?.name || "Default";
  const [color, setColor] = useState(initialColor);

  const galleryImages = useMemo(
    () => imagesForColor(product, color),
    [product, color]
  );

  return (
    <div className="grid w-full max-w-full gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="min-w-0 space-y-4">
        <ProductGallery
          key={color}
          images={galleryImages}
          alt={`${product.name} — ${color}`}
        />
        {product.modelInfo ? (
          <p className="text-center text-[11px] uppercase tracking-[0.14em] text-beige/55 md:text-left">
            {safeText(product.modelInfo)}
          </p>
        ) : null}
      </div>
      <div className="min-w-0 space-y-10">
        <ProductPurchasePanel
          product={product}
          selectedColor={color}
          onColorChange={setColor}
        />
        {children}
      </div>
    </div>
  );
}
