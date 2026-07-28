"use client";

import Link from "next/link";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn, safeText } from "@/lib/utils";
import { SECTION_IMAGES } from "@/lib/images";
import type { PageSectionData } from "@/types";

export interface CampaignBannerProps {
  section?: Partial<PageSectionData> | null;
  className?: string;
}

export function CampaignBanner({ section, className }: CampaignBannerProps) {
  const image =
    section?.backgroundImage || SECTION_IMAGES.campaign;

  return (
    <section className={cn("relative min-h-[70vh] overflow-hidden bg-black", className)}>
      <SafeImage
        src={image}
        alt={safeText(section?.imageAlt, "DAYAURA campaign")}
        fill
        className="object-cover"
        sizes="100vw"
        fallbackWidth={1920}
        fallbackHeight={900}
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/40" />

      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="max-w-xl text-[#F5F0E6]">
            <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">
              {safeText(section?.eyebrow, "Campaign")}
            </p>
            <h2 className="font-serif text-4xl tracking-wide md:text-6xl">
              {safeText(section?.heading, "This season’s aura.")}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/70 md:text-base">
              {safeText(
                section?.body || section?.subheading,
                "Bold lines. Soft strength. A collection made to be lived in — and remembered."
              )}
            </p>
            <div className="mt-8">
              <MagneticButton>
                <Link href={safeText(section?.ctaUrl, "/shop")}>
                  <Button size="lg">
                    {safeText(section?.ctaLabel, "Shop the campaign")}
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
