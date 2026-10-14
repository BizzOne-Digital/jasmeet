"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

export interface ProductThumbProps {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}

/** Small product image with fixed studio backdrop (#c4bbb2). */
export function ProductThumb({
  src,
  alt,
  className,
  imageClassName,
  sizes = "96px",
}: ProductThumbProps) {
  return (
    <div className={cn("relative overflow-hidden bg-product-image", className)}>
      <SafeImage
        src={src}
        alt={alt}
        fill
        className={cn("bg-product-image object-contain p-1", imageClassName)}
        sizes={sizes}
      />
    </div>
  );
}
