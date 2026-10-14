import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const PRODUCTION_SITE_URL = "https://dayaura.com";

/** Canonical public site origin for metadata, sitemap, and emails. */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) {
    // Vercel default URL should not be the canonical domain in Google.
    if (/\.vercel\.app$/i.test(new URL(configured).hostname)) {
      return PRODUCTION_SITE_URL;
    }
    return configured;
  }
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }
  return "http://localhost:3000";
}

export function absoluteUrl(path = ""): string {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function getPlaceholderImage(
  width = 800,
  height = 1000,
  label = "DAYAURA"
): string {
  const text = encodeURIComponent(label);
  return `https://placehold.co/${width}x${height}/1a1a1a/D4AF37/png?text=${text}&font=montserrat`;
}

export function safeText(value: string | undefined | null, fallback = ""): string {
  if (!value || value === "undefined") return fallback;
  return value;
}

export function generateSKU(prefix = "DA"): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}
