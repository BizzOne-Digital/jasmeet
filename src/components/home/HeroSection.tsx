"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const heroCopy = {
  eyebrow: "Wear Your Aura",
  line1: "Move with",
  line2: "Confidence",
  body: "Premium activewear designed to sculpt, support and move with you.",
  cta: "Shop Collections",
  href: "/collections",
};

function HeroCopy({
  className,
  headingClassName,
  bodyClassName,
  buttonClassName,
}: {
  className?: string;
  headingClassName?: string;
  bodyClassName?: string;
  buttonClassName?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col items-start text-left", className)}>
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#c4a574]">
        {heroCopy.eyebrow}
      </p>

      <h1
        className={cn(
          "mt-5 w-full font-sans font-bold leading-[1.05] tracking-tight text-white",
          headingClassName
        )}
      >
        <span className="block">{heroCopy.line1}</span>
        <span className="block">{heroCopy.line2}</span>
      </h1>

      <p
        className={cn(
          "mt-5 max-w-md text-[15px] leading-relaxed text-white/90",
          bodyClassName
        )}
      >
        {heroCopy.body}
      </p>

      <div className="mt-8 w-full">
        <Link
          href={heroCopy.href}
          className={cn(
            "inline-flex min-h-[3.25rem] w-full items-center justify-center bg-[#c4a574] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-black",
            buttonClassName
          )}
        >
          {heroCopy.cta}
        </Link>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      className="relative -mt-[6rem] w-full max-w-full overflow-x-clip pt-[6rem] sm:-mt-[7rem] sm:pt-[7rem] lg:-mt-[7.5rem] lg:pt-[7.5rem]"
      aria-label="Hero"
    >
      {/* ——— Mobile: image on top, copy on black below ——— */}
      <div className="flex flex-col bg-black md:hidden">
        <div className="relative h-[50svh] min-h-[300px] w-full max-h-[420px]">
          <Image
            src="/images/hero-image.png"
            alt="DAYAURA — Move with Confidence"
            fill
            priority
            fetchPriority="high"
            unoptimized
            className="object-cover object-left object-[left_28%]"
            sizes="100vw"
            quality={100}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div className="px-6 pb-12 pt-2">
          <HeroCopy />
        </div>
      </div>

      {/* ——— Desktop: full-bleed overlay ——— */}
      <div className="relative hidden min-h-[100svh] md:block">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-image.png"
            alt="DAYAURA — Move with Confidence"
            fill
            priority
            unoptimized
            className="bg-black object-cover object-center"
            sizes="100vw"
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
        </div>

        <div
          className={cn(
            "relative z-10 flex min-h-[100svh] w-full max-w-full flex-col justify-center px-14 pb-32 pt-20 lg:px-20 xl:px-24"
          )}
        >
          <HeroCopy
            className="max-w-3xl"
            headingClassName="font-display tracking-[0.03em] text-beige text-3xl lg:text-4xl xl:text-[3.25rem] xl:leading-[1.12]"
            bodyClassName="text-beige/75 md:text-base"
            buttonClassName="w-auto bg-gold-soft px-10 text-[11px] tracking-[0.24em] lux-btn"
          />
        </div>
      </div>
    </section>
  );
}
