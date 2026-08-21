"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
  /** Bottom sheet on mobile (better for size pickers). */
  mobileSheet?: boolean;
  /** Panel background theme. */
  surface?: "dark" | "beige";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw]",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  size = "md",
  showClose = true,
  mobileSheet = false,
  surface = "dark",
}: ModalProps) {
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

  const isBeige = surface === "beige";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] isolate"
      role="presentation"
      aria-hidden={false}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex",
          mobileSheet
            ? "items-end justify-center sm:items-center sm:p-6"
            : "items-end justify-center p-0 sm:items-center sm:p-4 md:p-6"
        )}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            "pointer-events-auto relative flex w-full max-h-[min(92dvh,820px)] flex-col rounded-t-2xl border shadow-2xl sm:max-h-[85vh] sm:rounded-none",
            isBeige
              ? "border-black/10 bg-beige"
              : "border-white/10 bg-[#0a0a0a]",
            sizeClasses[size],
            className
          )}
        >
          {(title || showClose) && (
            <div
              className={cn(
                "flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5 sm:py-4",
                isBeige ? "border-black/10" : "border-white/10"
              )}
            >
              {title ? (
                <h2
                  className={cn(
                    "font-serif text-lg tracking-wide sm:text-xl",
                    isBeige ? "text-black/90" : "text-[#F5F0E6]"
                  )}
                >
                  {title}
                </h2>
              ) : (
                <span />
              )}
              {showClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    "p-2 transition",
                    isBeige
                      ? "text-black/50 hover:text-[#8a6d00]"
                      : "text-white/60 hover:text-[#D4AF37]"
                  )}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
