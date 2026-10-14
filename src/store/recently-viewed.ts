"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentlyViewedStore {
  productIds: string[];
  addProduct: (productId: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      addProduct: (productId) => {
        const current = get().productIds.filter((id) => id !== productId);
        set({ productIds: [productId, ...current].slice(0, 12) });
      },
    }),
    { name: "dayaura-recently-viewed" }
  )
);
