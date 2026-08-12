export interface HeroSlide {
  id: string;
  tab: string;
  image: string;
  theme: "dark" | "light";
  layout: "left" | "right";
  /**
   * Tailwind object-position classes for mobile crop (model in frame).
   * Include `md:object-center` so desktop stays centered.
   */
  imagePositionClass?: string;
  eyebrow?: string;
  heading: string;
  headingLine2?: string;
  body?: string;
  primaryCta: { label: string; href: string };
}

/** Three focused hero slides — opening message, new arrivals, collections. */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "wear-your-aura",
    tab: "Aura",
    image: "/images/hero-1.png",
    theme: "dark",
    layout: "left",
    imagePositionClass: "object-[78%_center] md:object-center",
    eyebrow: "DAYAURA",
    heading: "Wear Your Aura.",
    headingLine2: "Move with Confidence.",
    body: "Premium activewear designed to empower every movement — from the studio to everyday life.",
    primaryCta: { label: "Shop Collection", href: "/collections" },
  },
  {
    id: "new-arrivals",
    tab: "New",
    image: "/images/hero-2.png",
    theme: "dark",
    layout: "right",
    imagePositionClass: "object-[22%_center] md:object-center",
    eyebrow: "Just arrived",
    heading: "New Arrivals",
    body: "Fresh pieces designed for movement, confidence and everyday wear.",
    primaryCta: { label: "Shop New Arrivals", href: "/shop?newArrival=true" },
  },
  {
    id: "explore-collections",
    tab: "Collections",
    image: "/images/hero-3.png",
    theme: "dark",
    layout: "left",
    imagePositionClass: "object-[84%_center] md:object-center",
    eyebrow: "The archive",
    heading: "Explore Our Collections",
    body: "AuraWave, AuraImpact, AuraFlow, AuraMesh, Outerwear, and Accessories.",
    primaryCta: { label: "Explore Collections", href: "/collections" },
  },
];
