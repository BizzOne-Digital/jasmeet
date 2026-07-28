"use client";

import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { TESTIMONIALS, type Testimonial } from "@/lib/data/testimonials";
import { cn } from "@/lib/utils";

export type { Testimonial };
export interface TestimonialsSectionProps {
  section?: {
    eyebrow?: string;
    heading?: string;
    subheading?: string;
    body?: string;
  } | null;
  testimonials?: Testimonial[];
  className?: string;
  heading?: string;
  subheading?: string;
}

export function TestimonialsSection({
  section,
  testimonials = TESTIMONIALS,
  className,
  heading = "Worn with confidence.",
  subheading = "Real women. Real movement. Honest words from the DAYAURA community.",
}: TestimonialsSectionProps) {
  const title = section?.heading || heading;
  const subtitle = section?.subheading || section?.body || subheading;
  const eyebrow = section?.eyebrow || "Testimonials";

  return (
    <section
      className={cn("bg-[#F5F0E6] py-20 text-black lg:py-28", className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#8a7420]">
              {eyebrow}
            </p>
            <h2 className="font-serif text-4xl tracking-wide md:text-5xl">
              {title}
            </h2>
            <p className="mt-4 text-sm text-black/60 md:text-base">
              {subtitle}
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <RevealOnScroll key={t.id} index={i} direction="up">
              <blockquote className="flex h-full flex-col border border-black/10 bg-white/40 p-6 backdrop-blur-sm">
                <p className="flex-1 text-sm leading-relaxed text-black/75">
                  “{t.quote}”
                </p>
                <footer className="mt-6 border-t border-black/10 pt-4">
                  <cite className="not-italic">
                    <span className="block text-sm font-medium tracking-wide">
                      {t.name}
                    </span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                      {t.role ? `${t.role} · ` : ""}
                      {t.location}
                    </span>
                  </cite>
                </footer>
              </blockquote>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
