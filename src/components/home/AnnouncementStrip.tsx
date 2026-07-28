"use client";

import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { cn, safeText } from "@/lib/utils";
import type { PageSectionData } from "@/types";

export interface AnnouncementStripProps {
  section?: Partial<PageSectionData> | null;
  className?: string;
}

export function AnnouncementStrip({
  section,
  className,
}: AnnouncementStripProps) {
  return (
    <section
      className={cn(
        "border-y border-white/10 bg-[#0a0a0a] py-10 text-center text-[#F5F0E6] md:py-12",
        className
      )}
    >
      <RevealOnScroll>
        <div className="mx-auto max-w-3xl px-4">
          {section?.eyebrow ? (
            <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">
              {safeText(section.eyebrow)}
            </p>
          ) : null}
          <p className="font-serif text-2xl tracking-wide md:text-3xl">
            {safeText(
              section?.heading || section?.subheading || section?.body,
              "Wear Your Aura. Move with Confidence."
            )}
          </p>
        </div>
      </RevealOnScroll>
    </section>
  );
}
