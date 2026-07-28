"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn, getPlaceholderImage } from "@/lib/utils";

export interface SafeImageProps
  extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src?: string | null;
  alt: string;
  fallbackLabel?: string;
  fallbackWidth?: number;
  fallbackHeight?: number;
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

  const resolvedSrc = failed || !validSrc ? placeholder : validSrc;

  return (
    <Image
      src={resolvedSrc}
      alt={alt || "DAYAURA"}
      fill={fill}
      width={fill ? undefined : (width ?? fallbackWidth)}
      height={fill ? undefined : (height ?? fallbackHeight)}
      className={cn("bg-[#1a1a1a]", className)}
      onError={() => setFailed(true)}
      unoptimized={resolvedSrc.includes("placehold.co")}
      {...props}
    />
  );
}
