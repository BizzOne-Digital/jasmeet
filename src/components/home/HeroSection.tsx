"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HERO_SLIDES, type HeroSlide } from "@/components/home/hero-slides";

const AUTO_INTERVAL = 7000;
const FADE_MS = 1.35;

function SlideContent({
  slide,
  isActive,
}: {
  slide: HeroSlide;
  isActive: boolean;
}) {
  const alignRight = slide.layout === "right";

  return (
    <div
      className={cn(
        "relative z-10 flex min-h-[52svh] w-full max-w-full flex-col justify-center px-5 pb-20 pt-20 sm:min-h-[68svh] sm:px-10 sm:pb-24 sm:pt-24 md:min-h-[100svh] md:px-14 lg:px-20 xl:px-24",
        alignRight && "items-end"
      )}
    >
      <div
        className={cn(
          "flex w-full max-w-xl flex-col lg:max-w-2xl",
          alignRight ? "items-end text-right" : "items-start text-left"
        )}
      >
        {slide.eyebrow ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "mb-6 flex items-center gap-3",
              alignRight && "flex-row-reverse"
            )}
          >
            <span className="h-px w-10 bg-gold" />
            <span className="eyebrow !text-[0.6875rem]">{slide.eyebrow}</span>
          </motion.div>
        ) : null}

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 1, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="break-words font-display text-[1.65rem] leading-[1.12] tracking-[0.03em] text-beige sm:text-4xl sm:leading-[1.08] md:text-6xl lg:text-7xl xl:text-[4.6rem]"
        >
          {slide.heading}
          {slide.headingLine2 ? (
            <span className="mt-1.5 block">{slide.headingLine2}</span>
          ) : null}
        </motion.h1>

        {slide.body ? (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.9, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "mt-5 max-w-md text-sm leading-relaxed text-beige/65 md:mt-6 md:text-base",
              alignRight && "ml-auto"
            )}
          >
            {slide.body}
          </motion.p>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.85, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 sm:mt-8"
        >
          <Link
            href={slide.primaryCta.href}
            className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-gold-soft px-8 py-3.5 text-[11px] uppercase tracking-[0.24em] text-black lux-btn sm:w-auto sm:min-h-12 sm:px-10"
          >
            {slide.primaryCta.label}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export function HeroSection({ slides = HERO_SLIDES }: { slides?: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const total = slides.length;

  const goTo = useCallback((index: number) => {
    setActive(((index % total) + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % total);
  }, [total]);

  useEffect(() => {
    if (reducedMotion || paused) return;
    const timer = window.setInterval(next, AUTO_INTERVAL);
    return () => window.clearInterval(timer);
  }, [next, reducedMotion, paused, active]);

  const current = slides[active];

  return (
    <section
      className="relative -mt-[6rem] w-full max-w-full overflow-x-clip overflow-hidden pt-[6rem] sm:-mt-[7rem] sm:pt-[7rem] lg:-mt-[7.5rem] lg:pt-[7.5rem]"
      aria-label="Hero carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background — slow fade + light zoom */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={current.id}
            initial={
              reducedMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 1.06 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 1.02 }
            }
            transition={{
              duration: reducedMotion ? 0.01 : FADE_MS,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0"
          >
            <Image
              src={current.image}
              alt={`DAYAURA — ${current.heading}`}
              fill
              priority={active === 0}
              fetchPriority={active === 0 ? "high" : "auto"}
              unoptimized={current.image.startsWith("/images/")}
              className={cn(
                "bg-black object-contain md:object-cover",
                current.imagePositionClass || "object-center"
              )}
              sizes="100vw"
              quality={100}
            />
            <div
              className={cn(
                "absolute inset-0",
                current.layout === "right"
                  ? "bg-gradient-to-l from-black/80 via-black/45 to-black/25"
                  : "bg-gradient-to-r from-black/80 via-black/45 to-black/25"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Text fade-in */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0.01 : 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative"
        >
          <SlideContent slide={current} isActive />
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute inset-x-0 bottom-0 z-20 overflow-x-clip pb-[env(safe-area-inset-bottom)]">
        <div className="border-t border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4 lg:px-12">
            <div className="flex flex-1 items-center justify-center gap-1 sm:justify-start sm:gap-2.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}: ${slide.heading}`}
                  aria-current={i === active ? "true" : undefined}
                  className="flex h-11 w-11 items-center justify-center sm:h-auto sm:w-auto sm:p-0"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-all duration-500",
                      i === active
                        ? "w-8 bg-[#D4AF37]"
                        : "w-1.5 bg-white/35"
                    )}
                  />
                </button>
              ))}
            </div>

            <p className="hidden text-[10px] uppercase tracking-[0.28em] text-white/40 sm:block">
              {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
