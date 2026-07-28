export interface HeroSlide {
  id: string;
  tab: string;
  image: string;
  theme: "dark" | "light";
  layout: "right" | "left";
  slideNumber?: string;
  eyebrow: string;
  heading: string;
  headingLine2?: string;
  body: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  footerNote?: string;
  showSeal?: boolean;
  showHiddenBadge?: boolean;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "auraflow",
    tab: "AURAFLOW",
    image: "/images/hero-1.png",
    theme: "dark",
    layout: "left",
    eyebrow: "PREMIUM ACTIVEWEAR",
    heading: "Wear Your Aura.",
    headingLine2: "Move with Confidence.",
    body: "Designed to empower every movement—from the gym to everyday life.",
    primaryCta: { label: "SHOP THE COLLECTION", href: "/collections" },
    secondaryCta: { label: "DISCOVER DAYAURA", href: "/about" },
    showHiddenBadge: true,
  },
  {
    id: "aurawave",
    tab: "AURAWAVE",
    image: "/images/hero-2.png",
    theme: "light",
    layout: "right",
    eyebrow: "MOVE WITH INTENTION",
    heading: "Strength in Every Move.",
    body: "Performance, comfort and confidence—designed into every DAYAURA piece.",
    primaryCta: { label: "EXPLORE NEW ARRIVALS", href: "/shop?newArrival=true" },
    secondaryCta: { label: "SHOP ALL", href: "/shop" },
    showSeal: true,
  },
  {
    id: "auraimpact",
    tab: "AURAIMPACT",
    image: "/images/hero-3.png",
    theme: "dark",
    layout: "right",
    slideNumber: "01",
    eyebrow: "THE NEW AURA",
    heading: "Designed for Motion.",
    headingLine2: "Made for Confidence.",
    body: "Elevated activewear that moves beautifully through training, travel and everyday life.",
    primaryCta: { label: "SHOP NEW ARRIVALS", href: "/shop?newArrival=true" },
    secondaryCta: { label: "EXPLORE COLLECTIONS", href: "/collections" },
    footerNote: "A MESSAGE OF STRENGTH, HIDDEN WITHIN",
  },
];
