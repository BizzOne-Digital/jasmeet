"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { luxDuration, luxEase } from "@/lib/motion";

/** Soft fade veil between routes — no wipe or heavy motion. */
export function PageTransition() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(false);
  const [key, setKey] = useState(pathname);

  useEffect(() => {
    if (pathname === key || reduced) return;
    setDisplay(true);
    const t1 = window.setTimeout(() => setKey(pathname), 180);
    const t2 = window.setTimeout(() => setDisplay(false), 520);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, key, reduced]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {display ? (
        <motion.div
          key={`transition-${key}`}
          className="pointer-events-none fixed inset-0 z-[90] bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.55, 0.55, 0] }}
          exit={{ opacity: 0 }}
          transition={{
            duration: luxDuration.page,
            times: [0, 0.3, 0.55, 1],
            ease: luxEase,
          }}
        />
      ) : null}
    </AnimatePresence>
  );
}
