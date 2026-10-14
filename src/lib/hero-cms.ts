import type { PageSectionData } from "@/types";
import { HERO_SLIDES, type HeroSlide } from "@/components/home/hero-slides";

const SLIDE_SECTION_KEYS = [
  "hero",
  "hero-new-arrivals",
  "hero-collections",
] as const;

function isPlaceholderImage(url?: string | null): boolean {
  const trimmed = url?.trim();
  if (!trimmed) return true;
  return trimmed.includes("placehold.co");
}

function resolveHeroImage(
  cmsImage: string | undefined,
  defaultImage: string
): string {
  const trimmed = cmsImage?.trim();
  if (!trimmed || isPlaceholderImage(trimmed)) return defaultImage;
  return trimmed;
}

function resolveHeadingLines(
  subheading: string | undefined,
  defaults: HeroSlide
): Pick<HeroSlide, "headingLine2" | "headingLine3" | "headingLine4"> {
  const trimmed = subheading?.trim();
  if (!trimmed || !trimmed.includes("\n")) {
    return {
      headingLine2: defaults.headingLine2,
      headingLine3: defaults.headingLine3,
      headingLine4: defaults.headingLine4,
    };
  }

  const parts = trimmed.split("\n").map((line) => line.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return {
      headingLine2: parts[0],
      headingLine3: parts[1],
      headingLine4: parts.slice(2).join(" "),
    };
  }
  if (parts.length === 2) {
    return {
      headingLine2: parts[0],
      headingLine3: parts[1],
      headingLine4: defaults.headingLine4,
    };
  }

  return {
    headingLine2: parts[0],
    headingLine3: defaults.headingLine3,
    headingLine4: defaults.headingLine4,
  };
}

/** Merge CMS homepage hero sections with coded defaults (3 slides). */
export function resolveHeroSlides(
  sectionsByKey: Map<string, PageSectionData>
): HeroSlide[] {
  return HERO_SLIDES.map((defaults, index) => {
    const section =
      sectionsByKey.get(SLIDE_SECTION_KEYS[index]) ||
      (index === 0 ? sectionsByKey.get("hero") : undefined);

    if (!section) return defaults;

    // Opening slide: keep exact 4-line headline from code (CMS can't break line wraps).
    if (index === 0) {
      return {
        ...defaults,
        image: resolveHeroImage(section.backgroundImage, defaults.image),
        eyebrow: section.eyebrow?.trim() || defaults.eyebrow,
        heading: defaults.heading,
        headingLine2: defaults.headingLine2,
        headingLine3: defaults.headingLine3,
        headingLine4: defaults.headingLine4,
        body: section.body?.trim() || defaults.body,
        primaryCta: {
          label: section.ctaLabel?.trim() || defaults.primaryCta.label,
          href: section.ctaUrl?.trim() || defaults.primaryCta.href,
        },
      };
    }

    const headingLines = resolveHeadingLines(section.subheading, defaults);

    return {
      ...defaults,
      image: resolveHeroImage(section.backgroundImage, defaults.image),
      eyebrow: section.eyebrow?.trim() || defaults.eyebrow,
      heading: section.heading?.trim() || defaults.heading,
      ...headingLines,
      body: section.body?.trim() || defaults.body,
      primaryCta: {
        label: section.ctaLabel?.trim() || defaults.primaryCta.label,
        href: section.ctaUrl?.trim() || defaults.primaryCta.href,
      },
    };
  });
}
