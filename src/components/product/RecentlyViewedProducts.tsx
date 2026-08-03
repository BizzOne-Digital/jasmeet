"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductCardProduct } from "@/components/product/ProductCard";
import { useRecentlyViewedStore } from "@/store/recently-viewed";

export function RecentlyViewedProducts({
  excludeId,
  limit = 4,
}: {
  excludeId?: string;
  limit?: number;
}) {
  const productIds = useRecentlyViewedStore((s) => s.productIds);
  const [products, setProducts] = useState<ProductCardProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ids = productIds
      .filter((id) => id && id !== excludeId)
      .slice(0, limit);

    if (!ids.length) {
      setProducts([]);
      setLoaded(true);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/products?ids=${encodeURIComponent(ids.join(","))}&limit=${limit}`
        );
        const json = await res.json();
        const list =
          (json?.data?.products as ProductCardProduct[] | undefined) ||
          (json?.products as ProductCardProduct[] | undefined) ||
          [];
        if (!cancelled) setProducts(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productIds, excludeId, limit]);

  if (!loaded || products.length === 0) return null;

  return (
    <section className="mt-20">
      <h2 className="mb-8 font-heading text-3xl tracking-wide">
        Recently viewed
      </h2>
      <ProductGrid products={products} columns="4" />
    </section>
  );
}
