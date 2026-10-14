"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export interface NavLink {
  href: string;
  label: string;
}

export interface MobileNavCollection {
  name: string;
  slug: string;
}

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
  collections?: MobileNavCollection[];
}

export function MobileNav({
  open,
  onClose,
  links,
  collections = [],
}: MobileNavProps) {
  const panelRef = useRef<HTMLElement>(null);
  const handleClose = useCallback(() => onClose(), [onClose]);

  useFocusTrap(open, panelRef, handleClose);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.nav
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute inset-y-0 left-0 flex w-[min(100%,340px)] flex-col border-r border-white/10 bg-[#050505] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <span className="font-serif text-xl tracking-[0.2em] text-[#F5F0E6]">
                DAYAURA
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center text-white/70 transition hover:text-[#D4AF37]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="scroll-touch flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <ul className="space-y-0.5">
                {links.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        "flex min-h-12 items-center text-sm uppercase tracking-[0.22em] text-[#F5F0E6]/90 transition hover:text-[#D4AF37]"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {collections.length > 0 ? (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-[#D4AF37]">
                    Collections
                  </p>
                  <ul className="space-y-0.5">
                    {collections.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/collections/${c.slug}`}
                          onClick={onClose}
                          className="flex min-h-11 items-center text-sm text-white/70 transition hover:text-[#F5F0E6]"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-10 space-y-2 border-t border-white/10 pt-6">
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="flex min-h-12 w-full items-center justify-center bg-[#D4AF37] text-[11px] uppercase tracking-[0.2em] text-black"
                >
                  Shop all
                </Link>
                <Link
                  href="/search"
                  onClick={onClose}
                  className="flex min-h-12 w-full items-center justify-center border border-white/20 text-[11px] uppercase tracking-[0.2em] text-[#F5F0E6]"
                >
                  Search
                </Link>
              </div>
            </div>
          </motion.nav>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
