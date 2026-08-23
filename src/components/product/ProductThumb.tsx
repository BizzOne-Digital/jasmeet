"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { useProductImageBackdrop } from "@/hooks/useProductImageBackdrop";
import { cn } from "@/lib/utils";

export interface ProductThumbProps {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}

/** Small product image with backdrop sampled from the photo edges. */
export function ProductThumb({
  src,
  alt,
  className,
  imageClassName,
  sizes = "96px",
}: ProductThumbProps) {
  const backdrop = useProductImageBackdrop(src);
  const bgStyle = { backgroundColor: backdrop };

  return (
    <div className={cn("relative overflow-hidden", className)} style={bgStyle}>
      <SafeImage
        src={src}
        alt={alt}
        fill
        style={bgStyle}
        className={cn("object-contain p-1", imageClassName)}
        sizes={sizes}
      />
    </div>
  );
}
