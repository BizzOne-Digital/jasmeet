import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";
import { TESTIMONIALS } from "@/lib/data/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Real movement stories from the DAYAURA community.",
  alternates: { canonical: "/testimonials" },
};

export default function TestimonialsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Community"
        title="What Women Are Saying"
        description="Real movement. Real confidence. These are community stories — not celebrity endorsements."
        align="center"
        image={getPageHeroImage("testimonials")}
      />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.id}
              className="border border-white/10 bg-dark-elevated p-8"
            >
              <p className="font-display text-2xl leading-snug tracking-wide text-beige">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-6 text-sm text-beige/60">
                <cite className="not-italic text-beige">{t.name}</cite>
                <span className="mx-2">·</span>
                <span>{t.location}</span>
                {t.role ? (
                  <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-gold">
                    {t.role}
                  </p>
                ) : null}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </div>
  );
}
