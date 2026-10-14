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
    <section className={cn("section-shell bg-gold-soft text-black", className)}>
      <div className="container-lux">
        <RevealOnScroll>
          <div className="mb-12 max-w-2xl md:mb-16">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-[#8a7420]">
              {eyebrow}
            </p>
            <h2 className="font-serif text-[clamp(1.85rem,4vw,3.25rem)] tracking-[0.04em] leading-[1.1]">
              {title}
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-black/55 md:text-base">
              {subtitle}
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <RevealOnScroll key={t.id} index={i} direction="up">
              <blockquote className="flex h-full flex-col border border-black/8 bg-white/50 p-7 backdrop-blur-sm md:p-8">
                <p className="flex-1 text-[15px] leading-relaxed text-black/70">
                  “{t.quote}”
                </p>
                <footer className="mt-8 border-t border-black/8 pt-5">
                  <cite className="not-italic">
                    <span className="block text-sm tracking-wide">
                      {t.name}
                    </span>
                    <span className="mt-1.5 block text-[11px] uppercase tracking-[0.18em] text-black/40">
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
