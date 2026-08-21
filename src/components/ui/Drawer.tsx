"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
  widthClassName?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
  widthClassName = "max-w-md",
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (typeof document === "undefined" || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[150] isolate" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        aria-label="Close drawer"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title || "Drawer"}
        className={cn(
          "absolute top-0 flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden border-white/10 bg-[#0a0a0a] shadow-2xl",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          widthClassName,
          className
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          {title ? (
            <h2 className="text-xs uppercase tracking-[0.25em] text-[#F5F0E6]">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/60 transition hover:text-[#D4AF37]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </aside>
    </div>,
    document.body
  );
}
