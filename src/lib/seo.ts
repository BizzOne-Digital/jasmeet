/** Known SEO spam injected via compromised CMS / hosting (e.g. gambling cloaking). */
const SEO_SPAM_PATTERNS = [
  /palu\d+/i,
  /puncak imperium/i,
  /platform hiburan/i,
  /赢/i,
  /\$\d+\s*\d*\s*usd/i,
];

export function isSeoSpam(text: string): boolean {
  const value = text.trim();
  if (!value) return false;
  return SEO_SPAM_PATTERNS.some((pattern) => pattern.test(value));
}

export function sanitizeSeoText(
  value: string | undefined | null,
  fallback: string
): string {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  if (isSeoSpam(trimmed)) return fallback;
  if (trimmed.length > 160) return fallback;
  return trimmed;
}

/**
 * Use layout title template for short labels ("Shop", "About").
 * Use absolute title when the value is already a full SEO title.
 */
export function resolveMetadataTitle(
  title: string,
  brand = "DAYAURA"
): string | { absolute: string } {
  const trimmed = title.trim();
  if (!trimmed) return { absolute: brand };
  const brandLower = brand.toLowerCase();
  if (
    trimmed.includes("|") ||
    trimmed.toLowerCase().includes(brandLower) ||
    trimmed.length > 60
  ) {
    return { absolute: trimmed };
  }
  return trimmed;
}
