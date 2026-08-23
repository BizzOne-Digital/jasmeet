"use client";

import { useEffect, useState } from "react";
import {
  getCachedProductImageBackdrop,
  sampleProductImageBackdrop,
} from "@/lib/product-image-backdrop";

const FALLBACK = "var(--product-image-bg)";

/**
 * Matches product card / gallery backdrop to the photo's studio background.
 */
export function useProductImageBackdrop(src?: string | null): string {
  const [color, setColor] = useState<string>(() => {
    if (!src) return FALLBACK;
    return getCachedProductImageBackdrop(src) ?? FALLBACK;
  });

  useEffect(() => {
    if (!src) {
      setColor(FALLBACK);
      return;
    }

    const cached = getCachedProductImageBackdrop(src);
    if (cached) {
      setColor(cached);
      return;
    }

    let cancelled = false;
    void sampleProductImageBackdrop(src).then((hex) => {
      if (!cancelled) setColor(hex);
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return color;
}
