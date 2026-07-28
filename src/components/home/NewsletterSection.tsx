"use client";

import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { cn, safeText } from "@/lib/utils";
import type { PageSectionData } from "@/types";

export interface NewsletterSectionProps {
  section?: Partial<PageSectionData> | null;
  discountText?: string;
  className?: string;
}

export function NewsletterSection({
  section,
  discountText = "10% OFF your first order when you join our email list",
  className,
}: NewsletterSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[#0a0a0a] py-20 text-[#F5F0E6] lg:py-28",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <RevealOnScroll>
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">
            {safeText(section?.eyebrow, "Stay close")}
          </p>
          <h2 className="font-serif text-4xl tracking-wide md:text-5xl">
            {safeText(section?.heading, "Join the list.")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/55 md:text-base">
            {safeText(
              section?.body || section?.subheading,
              discountText
            )}
          </p>
          <div className="mx-auto mt-8 max-w-lg text-left">
            <NewsletterForm variant="section" />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
