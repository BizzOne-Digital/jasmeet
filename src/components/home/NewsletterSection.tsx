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
        "section-shell relative overflow-hidden border-t border-white/10 bg-dark-surface text-beige",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1),transparent_58%)]" />
      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <RevealOnScroll>
          <p className="eyebrow mb-4">
            {safeText(section?.eyebrow, "Newsletter")}
          </p>
          <h2 className="display-title">
            {safeText(section?.heading, "Stay in the aura.")}
          </h2>
          <p className="body-muted mx-auto mt-5 max-w-md">
            {safeText(section?.body || section?.subheading, discountText)}
          </p>
          <div className="mx-auto mt-10 max-w-lg text-left">
            <NewsletterForm variant="section" />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
