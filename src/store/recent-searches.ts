"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT = 8;

interface RecentSearchesStore {
  searches: string[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearSearches: () => void;
}

export const useRecentSearchesStore = create<RecentSearchesStore>()(
  persist(
    (set, get) => ({
      searches: [],
      addSearch: (query) => {
        const q = query.trim();
        if (!q) return;
        const next = [q, ...get().searches.filter((s) => s.toLowerCase() !== q.toLowerCase())];
        set({ searches: next.slice(0, MAX_RECENT) });
      },
      removeSearch: (query) => {
        set({
          searches: get().searches.filter(
            (s) => s.toLowerCase() !== query.toLowerCase()
          ),
        });
      },
      clearSearches: () => set({ searches: [] }),
    }),
    { name: "dayaura-recent-searches" }
  )
);
