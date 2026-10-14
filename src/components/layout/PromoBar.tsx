"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PromoBarProps {
  messages: string[];
  className?: string;
  intervalMs?: number;
}

export function PromoBar({
  messages,
  className,
  intervalMs = 4200,
}: PromoBarProps) {
  const items = messages.filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [items.length, intervalMs]);

  if (!items.length) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-black text-center text-[10px] uppercase tracking-[0.22em] text-[#F5F0E6] sm:text-[11px]",
        className
      )}
    >
      <div className="mx-auto flex h-9 max-w-5xl items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={items[index]}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="line-clamp-1"
          >
            {items[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
