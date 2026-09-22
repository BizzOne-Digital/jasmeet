"use client";

import Link from "next/link";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { ParallaxImage } from "@/components/animations/ParallaxImage";
import { Button } from "@/components/ui/Button";
import { cn, safeText } from "@/lib/utils";
import { SECTION_IMAGES, resolveImage } from "@/lib/images";
import type { PageSectionData } from "@/types";

export interface BrandStoryProps {
  section?: Partial<PageSectionData> | null;
  className?: string;
}

export function BrandStory({ section, className }: BrandStoryProps) {
  const image = resolveImage(
    SECTION_IMAGES.brandStory,
    section?.sideImage || section?.backgroundImage
  );

  return (
    <section className={cn("bg-black text-[#F5F0E6]", className)}>
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <RevealOnScroll direction="up" className="relative min-h-[60vh] lg:min-h-[80vh]">
          <ParallaxImage
            src={image}
            alt={safeText(section?.imageAlt, "DAYAURA brand story")}
            className="absolute inset-0 h-full w-full"
            speed={0.08}
          />
        </RevealOnScroll>

        <RevealOnScroll
          direction="fade"
          className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16 lg:py-24"
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">
            {safeText(section?.eyebrow, "Our story")}
          </p>
          <h2 className="font-serif text-4xl tracking-wide md:text-5xl">
            {safeText(section?.heading, "Designed for presence.")}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-white/60 md:text-base">
            {safeText(
              section?.body,
              "DAYAURA is a premium activewear brand designed to inspire confidence through movement. Our collections combine style, comfort, and performance — with every piece carrying a hidden motivational message to remind you of your strength."
            )}
          </p>
          <div className="mt-8">
            <Link href={safeText(section?.ctaUrl, "/about")}>
              <Button variant="outline">
                {safeText(section?.ctaLabel, "About DAYAURA")}
              </Button>
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
