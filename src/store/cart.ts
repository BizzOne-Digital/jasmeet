"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      addItem: (item) => {
        const items = get().items;
        const existing = items.find(
          (i) =>
            i.productId === item.productId &&
            i.size === item.size &&
            i.color === item.color
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId &&
              i.size === item.size &&
              i.color === item.color
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...items, item], isOpen: true });
        }
      },
      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (i) =>
              !(i.productId === productId && i.size === size && i.color === color)
          ),
        });
      },
      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "dayaura-cart" }
  )
);
