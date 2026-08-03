"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "dayaura-intro-seen";

export function CinematicIntro() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(0);
  const [reduced, setReduced] = useState(false);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }

    if (seen || mq.matches) {
      setVisible(false);
      return;
    }

    setVisible(true);
    document.body.style.overflow = "hidden";

    const timers = [
      window.setTimeout(() => setPhase(1), 200),
      window.setTimeout(() => setPhase(2), 700),
      window.setTimeout(() => setPhase(3), 1400),
      window.setTimeout(() => setPhase(4), 2100),
      window.setTimeout(() => setPhase(5), 2800),
      window.setTimeout(() => finish(), 3600),
    ];

    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, [finish]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          }}
          aria-hidden={!visible}
        >
          {/* Gold light line */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-px w-16 -translate-x-1/2 -translate-y-1/2 bg-[#D4AF37]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={
              phase >= 1
                ? { scaleX: 1, opacity: 1 }
                : { scaleX: 0, opacity: 0 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          {/* Soft glow sweep */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={
              phase >= 4
                ? {
                    opacity: [0, 0.45, 0],
                    background:
                      "radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.35), rgba(245,240,230,0.08) 40%, transparent 70%)",
                  }
                : { opacity: 0 }
            }
            transition={{ duration: 1.1 }}
          />

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <motion.p
              className="font-serif text-4xl tracking-[0.35em] text-[#F5F0E6] sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 14 }}
              animate={
                phase >= 2
                  ? { opacity: 1, y: 0 }
                  : {}
              }
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            >
              DAYAURA
            </motion.p>

            <div className="relative mt-6 h-8 overflow-hidden">
              <AnimatePresence mode="wait">
                {phase >= 3 && phase < 4 ? (
                  <motion.p
                    key="wear"
                    className="text-xs uppercase tracking-[0.35em] text-[#D4AF37] sm:text-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    Wear Your Aura
                  </motion.p>
                ) : null}
                {phase >= 4 ? (
                  <motion.p
                    key="move"
                    className="text-xs uppercase tracking-[0.35em] text-[#F5F0E6]/80 sm:text-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    Move with Confidence
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <button
            type="button"
            onClick={finish}
            className="absolute bottom-8 right-8 min-h-11 px-3 text-xs uppercase tracking-[0.28em] text-white/80 transition hover:text-[#D4AF37]"
          >
            Skip intro
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
