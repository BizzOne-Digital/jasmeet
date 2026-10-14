"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { shouldServeImageUnoptimized } from "@/lib/image-delivery";
import { cn, getPlaceholderImage } from "@/lib/utils";
import { isLegacyLocalUploadUrl } from "@/lib/upload-folders";

export interface SafeImageProps
  extends Omit<ImageProps, "src" | "alt"> {
  src?: string | null;
  alt: string;
  fallbackLabel?: string;
  fallbackWidth?: number;
  fallbackHeight?: number;
  onError?: () => void;
}

export function SafeImage({
  src,
  alt,
  className,
  fallbackLabel = "DAYAURA",
  fallbackWidth = 800,
  fallbackHeight = 1000,
  fill,
  width,
  height,
  sizes,
  quality,
  unoptimized,
  onError,
  ...props
}: SafeImageProps) {
  const placeholder = getPlaceholderImage(
    fallbackWidth,
    fallbackHeight,
    fallbackLabel
  );
  const validSrc = src && src !== "undefined" ? src : null;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [validSrc]);

  const legacyBroken = isLegacyLocalUploadUrl(validSrc);
  const resolvedSrc =
    failed || !validSrc || legacyBroken ? placeholder : validSrc;
  const resolvedSizes =
    sizes ||
    (fill ? "(max-width:768px) 100vw, (max-width:1200px) 50vw, 50vw" : undefined);
  const skipOptimize =
    unoptimized ??
    (typeof resolvedSrc === "string"
      ? shouldServeImageUnoptimized(resolvedSrc)
      : true);

  return (
    <Image
      src={resolvedSrc}
      alt={alt || "DAYAURA"}
      fill={fill}
      width={fill ? undefined : (width ?? fallbackWidth)}
      height={fill ? undefined : (height ?? fallbackHeight)}
      className={cn(
        "bg-[#1a1a1a]",
        fill && "h-full w-full max-w-none",
        className
      )}
      onError={() => {
        setFailed(true);
        onError?.();
      }}
      unoptimized={skipOptimize}
      quality={quality ?? 100}
      sizes={resolvedSizes}
      {...props}
    />
  );
}
