"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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
          />
          <motion.nav
            className="absolute inset-y-0 left-0 flex w-[min(100%,340px)] flex-col bg-[#050505] border-r border-white/10"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            aria-label="Mobile"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="font-serif text-xl tracking-[0.2em] text-[#F5F0E6]">
                DAYAURA
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white/60 hover:text-[#D4AF37]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <ul className="space-y-1">
                {links.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        "block py-3 text-sm uppercase tracking-[0.22em] text-[#F5F0E6]/90 transition hover:text-[#D4AF37]"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {collections.length > 0 ? (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">
                    Collections
                  </p>
                  <ul className="space-y-2">
                    {collections.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/collections/${c.slug}`}
                          onClick={onClose}
                          className="block py-2 text-sm text-white/70 transition hover:text-[#F5F0E6]"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </motion.nav>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
