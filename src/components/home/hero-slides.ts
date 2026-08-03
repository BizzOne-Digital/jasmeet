export interface HeroSlide {
  id: string;
  tab: string;
  image: string;
  theme: "dark" | "light";
  layout: "left" | "right";
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
    layout: "left",
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
    layout: "left",
    eyebrow: "The archive",
    heading: "Explore Our Collections",
    body: "Showcase every DAYAURA world — AuraWave, AuraImpact, AuraFlow, AuraMesh, Outerwear, and Accessories.",
    primaryCta: { label: "Explore Collections", href: "/collections" },
  },
  {
    id: "lifestyle",
    tab: "Lifestyle",
    // Replace with /images/hero-4.png when the lifestyle campaign photo is uploaded
    image: "/images/hero-4.png",
    theme: "dark",
    layout: "left",
    eyebrow: "Campaign",
    heading: "Lifestyle",
    body: "DAYAURA beyond the gym — confidence worn into every moment outside the studio.",
    primaryCta: { label: "Discover DAYAURA", href: "/about" },
  },
];
