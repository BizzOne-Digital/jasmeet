"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface CartButtonProps {
  className?: string;
  showLabel?: boolean;
}

export function CartButton({ className, showLabel }: CartButtonProps) {
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore((s) => s.getItemCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      onClick={openCart}
      className={cn(
        "relative inline-flex items-center gap-2 p-2 text-[#F5F0E6]/85 transition hover:text-[#D4AF37]",
        className
      )}
      aria-label="Open cart"
    >
      <ShoppingBag className="h-5 w-5" />
      {showLabel ? (
        <span className="text-[11px] uppercase tracking-[0.2em]">Bag</span>
      ) : null}
      {mounted && count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-[#D4AF37] px-1 text-[9px] font-semibold text-black">
          {count}
        </span>
      ) : null}
    </button>
  );
}
