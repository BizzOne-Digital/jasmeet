"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { HERO_SLIDES, type HeroSlide } from "@/components/home/hero-slides";

const AUTO_INTERVAL = 6500;

function WearYourAuraSeal() {
  return (
    <div className="relative hidden h-28 w-28 shrink-0 lg:block xl:h-32 xl:w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#C4A574"
          strokeWidth="0.75"
        />
        <defs>
          <path
            id="sealTop"
            d="M 24 60 A 36 36 0 0 1 96 60"
            fill="none"
          />
          <path
            id="sealBottom"
            d="M 96 60 A 36 36 0 0 1 24 60"
            fill="none"
          />
        </defs>
        <text
          fill="#C4A574"
          fontSize="7.5"
          letterSpacing="2.5"
          fontFamily="var(--font-body), sans-serif"
        >
          <textPath href="#sealTop" startOffset="50%" textAnchor="middle">
            WEAR YOUR AURA
          </textPath>
          <textPath href="#sealBottom" startOffset="50%" textAnchor="middle">
            WEAR YOUR AURA
          </textPath>
        </text>
        <path
          d="M60 46 L63 54 L72 54 L65 59 L68 68 L60 63 L52 68 L55 59 L48 54 L57 54 Z"
          fill="none"
          stroke="#C4A574"
          strokeWidth="0.75"
        />
      </svg>
    </div>
  );
}

function LotusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-[#D4AF37]"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.75"
      aria-hidden
    >
      <path d="M12 3 C8 8 4 10 4 14 C4 17 7 19 12 21 C17 19 20 17 20 14 C20 10 16 8 12 3Z" />
      <path d="M12 8 C10 11 8 12 8 14" />
      <path d="M12 8 C14 11 16 12 16 14" />
    </svg>
  );
}

function ScrollIndicator() {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]/80">
        Scroll
      </span>
      <div className="relative flex h-12 w-px flex-col items-center">
        <div className="h-full w-px bg-white/25" />
        <motion.span
          className="absolute bottom-0 h-2 w-2 rounded-full bg-[#D4AF37]"
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function SlideContent({ slide, isActive }: { slide: HeroSlide; isActive: boolean }) {
  const isRight = slide.layout === "right";
  const isLight = slide.theme === "light";

  return (
    <div
      className={cn(
        "relative z-10 flex min-h-[100svh] w-full flex-col justify-center px-5 pb-32 pt-24 sm:px-8 sm:pb-28 md:px-12 lg:px-16 xl:px-20",
        isRight ? "items-start lg:items-end" : "items-start"
      )}
    >
      {/* Vertical slide label — AuraImpact only */}
      {slide.slideNumber ? (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="absolute left-5 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 lg:left-10 lg:flex xl:left-14"
        >
          <span className="font-display text-sm tracking-[0.2em] text-[#D4AF37]">
            {slide.slideNumber}
          </span>
          <div className="h-16 w-px bg-[#D4AF37]/50" />
          <span
            className="text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]/80"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {slide.tab}
          </span>
        </motion.div>
      ) : null}

      <div
        className={cn(
          "flex w-full max-w-xl flex-col gap-0 lg:max-w-2xl",
          isRight ? "items-start text-left lg:items-end lg:text-right" : "items-start text-left",
          slide.showSeal && "lg:flex-row lg:items-center lg:gap-10 xl:gap-14"
        )}
      >
        <div className={cn("flex flex-col", isRight ? "items-start lg:items-end" : "items-start")}>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className={cn(
              "mb-5 flex items-center gap-3",
              isRight ? "flex-row lg:flex-row-reverse" : "flex-row"
            )}
          >
            {!isLight && slide.layout === "left" ? (
              <span className="h-px w-8 bg-[#D4AF37]" />
            ) : null}
            <span
              className={cn(
                "text-[10px] uppercase tracking-[0.35em] sm:text-[11px]",
                isLight ? "text-[#9a7d52]" : "text-[#D4AF37]"
              )}
            >
              {slide.eyebrow}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "font-display leading-[1.05] tracking-wide",
              isLight
                ? "text-[2rem] text-[#1a1a1a] sm:text-5xl md:text-6xl lg:text-[4.25rem]"
                : "text-[1.95rem] text-[#F5F0E6] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.5rem]"
            )}
          >
            {slide.heading}
            {slide.headingLine2 ? (
              <span className="mt-1 block">{slide.headingLine2}</span>
            ) : null}
          </motion.h1>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.65, delay: 0.38 }}
            className={cn(
              "mt-5 max-w-md text-sm leading-relaxed sm:text-[15px] md:mt-6",
              isLight ? "text-[#3d3a35]/80" : "text-white/65",
              isRight && "lg:ml-auto"
            )}
          >
            {slide.body}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={cn(
              "mt-8 flex w-full max-w-[18.5rem] flex-col gap-4 sm:max-w-none sm:w-auto",
              isRight ? "items-stretch sm:items-start lg:items-end" : "items-stretch sm:items-start"
            )}
          >
            <Link
              href={slide.primaryCta.href}
              className={cn(
                "inline-flex w-full items-center justify-center gap-3 px-6 py-3.5 text-[10px] uppercase tracking-[0.2em] transition hover:opacity-90 sm:w-auto sm:px-8 sm:text-[11px] sm:tracking-[0.22em]",
                isLight
                  ? "bg-black text-[#F5F0E6]"
                  : "bg-[#E8DFD0] text-black"
              )}
            >
              {slide.primaryCta.label}
              {slide.id === "auraflow" ? (
                <ArrowRight className="h-4 w-4" />
              ) : null}
            </Link>
            <Link
              href={slide.secondaryCta.href}
              className={cn(
                "group relative text-[11px] uppercase tracking-[0.22em] transition",
                isLight
                  ? "text-[#1a1a1a]/70 hover:text-[#1a1a1a]"
                  : "text-[#D4AF37] hover:text-[#E8D48B]"
              )}
            >
              {slide.secondaryCta.label}
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 transition-transform",
                  isLight ? "bg-[#1a1a1a]/40" : "bg-[#D4AF37]/70"
                )}
              />
            </Link>
          </motion.div>
        </div>

        {slide.showSeal ? <WearYourAuraSeal /> : null}
      </div>

      {/* Footer notes */}
      {slide.footerNote ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="absolute bottom-24 right-6 hidden items-center gap-3 lg:flex xl:right-12"
        >
          <span className="text-[9px] uppercase tracking-[0.28em] text-white/45">
            {slide.footerNote}
          </span>
          <span className="h-px w-12 bg-[#D4AF37]/50" />
        </motion.div>
      ) : null}

      {slide.showHiddenBadge ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="absolute bottom-24 right-6 hidden items-center gap-2.5 lg:flex xl:right-12"
        >
          <LotusIcon />
          <span className="max-w-[120px] text-[9px] uppercase leading-relaxed tracking-[0.22em] text-white/45">
            Hidden Motivational Messages
          </span>
        </motion.div>
      ) : null}
    </div>
  );
}

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const reducedMotion = useReducedMotion();

  const goTo = useCallback((index: number) => {
    setDirection(index > active ? 1 : -1);
    setActive(index);
  }, [active]);

  const next = useCallback(() => {
    setDirection(1);
    setActive((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(next, AUTO_INTERVAL);
    return () => window.clearInterval(timer);
  }, [next, reducedMotion, active]);

  const current = HERO_SLIDES[active];

  return (
    <section className="relative -mt-[7.25rem] overflow-hidden pt-[7.25rem]" aria-label="Hero carousel">
      {/* Background slides */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.image}
              alt={`DAYAURA ${current.tab}`}
              fill
              priority={active === 0}
              className="object-cover object-center"
              sizes="100vw"
              quality={90}
            />
            {/* Consistent overlays — header stays fixed, only image/text change */}
            {current.theme === "dark" ? (
              <>
                {current.layout === "right" ? (
                  <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/35 to-black/20" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/25" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#F5F0E6]/55" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40" />
              </>
            )}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.5 }}
          className="relative"
        >
          <SlideContent slide={current} isActive />
        </motion.div>
      </AnimatePresence>

      {/* Bottom bar: tabs + scroll */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="border-t border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-stretch justify-between px-5 sm:px-8 lg:px-12">
            <div className="flex flex-1">
              {HERO_SLIDES.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={cn(
                    "relative flex-1 py-3.5 text-center text-[8px] uppercase tracking-[0.18em] transition sm:text-[10px] sm:tracking-[0.28em] md:py-5",
                    i === active
                      ? "text-[#F5F0E6]"
                      : "text-white/35 hover:text-white/60"
                  )}
                  aria-current={i === active ? "true" : undefined}
                >
                  <span
                    className={cn(
                      "absolute inset-x-4 top-0 h-px transition-all duration-500 md:inset-x-8",
                      i === active ? "bg-[#D4AF37]" : "bg-transparent"
                    )}
                  />
                  {slide.tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-full left-1/2 mb-4 -translate-x-1/2">
          <ScrollIndicator />
        </div>
      </div>
    </section>
  );
}
