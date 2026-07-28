"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store/recently-viewed";

export function TrackRecentlyViewed({ productId }: { productId: string }) {
  const addProduct = useRecentlyViewedStore((s) => s.addProduct);
  useEffect(() => {
    if (productId) addProduct(productId);
  }, [addProduct, productId]);
  return null;
}
