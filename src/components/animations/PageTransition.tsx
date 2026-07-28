"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export function PageTransition() {
  const pathname = usePathname();
  const [display, setDisplay] = useState(false);
  const [key, setKey] = useState(pathname);

  useEffect(() => {
    if (pathname === key) return;
    setDisplay(true);
    const t1 = window.setTimeout(() => setKey(pathname), 280);
    const t2 = window.setTimeout(() => setDisplay(false), 620);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, key]);

  return (
    <AnimatePresence>
      {display ? (
        <motion.div
          key={`transition-${key}`}
          className="pointer-events-none fixed inset-0 z-[90]"
          initial={{ y: "100%" }}
          animate={{ y: ["100%", "0%", "0%", "-100%"] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.62, times: [0, 0.35, 0.55, 1], ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
            <span className="font-serif text-2xl tracking-[0.4em] text-[#D4AF37]">
              DAYAURA
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
