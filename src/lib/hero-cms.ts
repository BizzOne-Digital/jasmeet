import type { PageSectionData } from "@/types";
import { HERO_SLIDES, type HeroSlide } from "@/components/home/hero-slides";

const SLIDE_SECTION_KEYS = [
  "hero",
  "hero-new-arrivals",
  "hero-collections",
] as const;

/** Merge CMS homepage hero sections with coded defaults (3 slides). */
export function resolveHeroSlides(
  sectionsByKey: Map<string, PageSectionData>
): HeroSlide[] {
  return HERO_SLIDES.map((defaults, index) => {
    const section =
      sectionsByKey.get(SLIDE_SECTION_KEYS[index]) ||
      (index === 0 ? sectionsByKey.get("hero") : undefined);

    if (!section) return defaults;

    return {
      ...defaults,
      image: section.backgroundImage?.trim() || defaults.image,
      eyebrow: section.eyebrow?.trim() || defaults.eyebrow,
      heading: section.heading?.trim() || defaults.heading,
      headingLine2: section.subheading?.trim() || defaults.headingLine2,
      body: section.body?.trim() || defaults.body,
      primaryCta: {
        label: section.ctaLabel?.trim() || defaults.primaryCta.label,
        href: section.ctaUrl?.trim() || defaults.primaryCta.href,
      },
    };
  });
}
