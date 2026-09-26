"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn, safeText } from "@/lib/utils";
import { SECTION_IMAGES, resolveImage } from "@/lib/images";
import type { PageSectionData } from "@/types";

export interface HiddenMessageSectionProps {
  section?: Partial<PageSectionData> | null;
  className?: string;
  sampleMessage?: string;
}

export function HiddenMessageSection({
  section,
  className,
  sampleMessage = "You are stronger than you think.",
}: HiddenMessageSectionProps) {
  const [revealed, setRevealed] = useState(false);
  const image = resolveImage(
    SECTION_IMAGES.hiddenMessage,
    section?.sideImage || section?.backgroundImage
  );

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[#0c0c0c] py-20 text-[#F5F0E6] lg:py-28",
        className
      )}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <RevealOnScroll direction="up">
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">
            {safeText(section?.eyebrow, "Signature detail")}
          </p>
          <h2 className="font-serif text-4xl tracking-wide md:text-5xl">
            {safeText(section?.heading, "A message only you know.")}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
            {safeText(
              section?.body,
              "Every DAYAURA piece holds a hidden motivational message — stitched where only you can find it. A quiet reminder of your strength, every time you move."
            )}
          </p>
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="mt-8 text-[11px] uppercase tracking-[0.28em] text-[#D4AF37] underline-offset-4 hover:underline"
          >
            {revealed ? "Hide message" : "Reveal the message"}
          </button>
        </RevealOnScroll>

        <RevealOnScroll direction="fade">
          <div
            className="group relative aspect-[4/5] cursor-pointer overflow-hidden bg-[#141414]"
            onClick={() => setRevealed((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setRevealed((v) => !v);
            }}
            role="button"
            tabIndex={0}
            aria-pressed={revealed}
          >
            <SafeImage
              src={image}
              alt={safeText(section?.imageAlt, "Hidden message detail")}
              fill
              className={cn(
                "lux-zoom object-cover",
                revealed && "!scale-[1.04] brightness-50"
              )}
              sizes="(max-width:1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <AnimatePresence>
              {revealed ? (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center p-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.p
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="font-serif text-2xl leading-snug tracking-wide text-[#F5F0E6] md:text-3xl"
                  >
                    “{safeText(section?.subheading, sampleMessage)}”
                  </motion.p>
                </motion.div>
              ) : (
                <motion.p
                  className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.28em] text-white/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  Tap to reveal
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
