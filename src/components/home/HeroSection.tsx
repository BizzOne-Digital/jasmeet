"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section
      className="relative -mt-[6rem] min-h-[100svh] min-h-[100dvh] w-full max-w-full overflow-x-clip pt-[6rem] sm:-mt-[7rem] sm:pt-[7rem] lg:-mt-[7.5rem] lg:pt-[7.5rem]"
      aria-label="Hero"
    >
      {/* Background Image - Full on Desktop, Top portion on Mobile */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-image.png"
          alt="DAYAURA — Move with Confidence"
          fill
          priority
          fetchPriority="high"
          unoptimized
          className="bg-black object-cover object-[center_20%] md:object-center"
          sizes="100vw"
          quality={100}
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent md:from-black/70" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative z-10 flex w-full max-w-full flex-col px-5 sm:px-10 md:px-14 lg:px-20 xl:px-24",
          "min-h-[calc(100svh-6rem)] justify-end pb-16",
          "sm:min-h-[68svh] sm:justify-center sm:pb-28 sm:pt-28",
          "md:min-h-[100svh] md:justify-center md:pt-20 md:pb-32"
        )}
      >
        <div className="flex w-full max-w-xl flex-col items-start text-left sm:max-w-2xl lg:max-w-3xl">
          {/* Eyebrow */}
          <div className="mb-4 flex items-center gap-3 sm:mb-6">
            <span className="h-px w-10 bg-gold" />
            <span className="eyebrow !text-[0.6875rem]">Wear Your Aura</span>
          </div>

          {/* Heading */}
          <h1 className="w-full font-display tracking-[0.03em] text-beige">
            <span className="block text-[2rem] leading-[1.1] sm:text-2xl md:text-3xl lg:text-4xl xl:text-[3.25rem] xl:leading-[1.12]">
              Move with
            </span>
            <span className="block text-[2rem] leading-[1.1] sm:text-2xl md:text-3xl lg:text-4xl xl:text-[3.25rem] xl:leading-[1.12]">
              Confidence
            </span>
          </h1>

          {/* Body Text */}
          <p className="mt-4 max-w-md text-sm leading-relaxed text-beige/75 sm:mt-5 md:mt-6 md:text-base">
            Premium activewear designed to sculpt, support and move with you.
          </p>

          {/* CTA Button */}
          <div className="mt-6 w-full shrink-0 sm:mt-8">
            <Link
              href="/collections"
              className="inline-flex min-h-[3rem] w-full items-center justify-center gap-3 bg-gold-soft px-6 py-3.5 text-[10px] uppercase tracking-[0.22em] text-black lux-btn sm:min-h-12 sm:w-auto sm:px-10 sm:text-[11px] sm:tracking-[0.24em]"
            >
              Shop Collections
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
