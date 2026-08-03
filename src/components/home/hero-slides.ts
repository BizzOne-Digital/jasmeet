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

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "wear-your-aura",
    tab: "Aura",
    image: "/images/hero-1.png",
    theme: "dark",
    layout: "left",
    // Model on the right of the photo
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
    // Model on the left of the photo
    imagePositionClass: "object-[22%_center] md:object-center",
    eyebrow: "Just arrived",
    heading: "New Arrivals",
    body: "Fresh silhouettes for the season — sculpted, soft, and performance-ready.",
    primaryCta: { label: "Shop New Arrivals", href: "/shop?newArrival=true" },
  },
  {
    id: "explore-collections",
    tab: "Collections",
    image: "/images/hero-3.png",
    theme: "dark",
    layout: "right",
    // Model on the left edge of the photo
    imagePositionClass: "object-[16%_center] md:object-center",
    eyebrow: "The archive",
    heading: "Explore Our Collections",
    body: "Showcase every DAYAURA world — AuraWave, AuraImpact, AuraFlow, AuraMesh, Outerwear, and Accessories.",
    primaryCta: { label: "Explore Collections", href: "/collections" },
  },
  {
    id: "lifestyle",
    tab: "Lifestyle",
    image: "/images/hero-4.png",
    theme: "dark",
    layout: "left",
    // Model on the right of the photo
    imagePositionClass: "object-[84%_center] md:object-center",
    eyebrow: "Campaign",
    heading: "Lifestyle",
    body: "DAYAURA beyond the gym — confidence worn into every moment outside the studio.",
    primaryCta: { label: "Discover DAYAURA", href: "/about" },
  },
];
