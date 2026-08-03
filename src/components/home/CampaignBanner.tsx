"use client";

import Link from "next/link";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn, safeText } from "@/lib/utils";
import { SECTION_IMAGES, resolveImage } from "@/lib/images";
import type { PageSectionData } from "@/types";

export interface CampaignBannerProps {
  section?: Partial<PageSectionData> | null;
  className?: string;
}

export function CampaignBanner({ section, className }: CampaignBannerProps) {
  const image = resolveImage(SECTION_IMAGES.campaign, section?.backgroundImage);

  return (
    <section
      className={cn(
        "group relative min-h-[72vh] overflow-hidden bg-background md:min-h-[80vh]",
        className
      )}
    >
      <SafeImage
        src={image}
        alt={safeText(section?.imageAlt, "DAYAURA campaign")}
        fill
        className="lux-zoom object-cover"
        sizes="100vw"
        fallbackWidth={1920}
        fallbackHeight={900}
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl items-center px-5 py-24 sm:px-8 md:min-h-[80vh] lg:px-10">
        <RevealOnScroll>
          <div className="max-w-xl text-beige">
            <p className="eyebrow mb-4">
              {safeText(section?.eyebrow, "Campaign")}
            </p>
            <h2 className="display-title text-[clamp(2.25rem,5vw,3.75rem)]">
              {safeText(section?.heading, "This season’s aura.")}
            </h2>
            <p className="body-muted mt-6 max-w-md">
              {safeText(
                section?.body || section?.subheading,
                "Bold lines. Soft strength. A collection made to be lived in — and remembered."
              )}
            </p>
            <div className="mt-10">
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
