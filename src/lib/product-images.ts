import { isLegacyLocalUploadUrl, parseStoredUploadUrl } from "@/lib/upload-folders";

/** Normalize and validate a single product image URL. */
export function sanitizeImageUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;

  // Legacy disk paths do not work on serverless — reject on save
  if (isLegacyLocalUploadUrl(trimmed)) return null;

  const validPrefix =
    trimmed.startsWith("/images/") ||
    trimmed.startsWith("/api/uploads/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://");

  if (!validPrefix) return null;

  // Reject bare folder paths like /images/products/foo/bar (no file)
  const lastSegment = trimmed.split("/").pop() || "";
  if (!lastSegment.includes(".")) return null;

  return trimmed;
}

/** Deduplicated list of valid image URLs. */
export function sanitizeImageList(urls: unknown): string[] {
  if (!Array.isArray(urls)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    const clean = sanitizeImageUrl(url);
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      out.push(clean);
    }
  }
  return out;
}

export function sanitizeProductColors(
  colors: unknown
): Array<{ name: string; hex: string; images?: string[] }> {
  if (!Array.isArray(colors)) return [];
  return colors
    .map((color) => {
      if (!color || typeof color !== "object") return null;
      const name = "name" in color ? String(color.name || "").trim() : "";
      if (!name) return null;
      const hex =
        "hex" in color && typeof color.hex === "string" && color.hex
          ? color.hex
          : "#000000";
      const images = sanitizeImageList(
        "images" in color ? color.images : undefined
      );
      return { name, hex, ...(images.length ? { images } : {}) };
    })
    .filter(Boolean) as Array<{ name: string; hex: string; images?: string[] }>;
}

/** Gallery URLs for a colour (falls back to product-level images). */
export function resolveColorGalleryImages(
  product: {
    images?: string[];
    colors?: Array<{ name: string; images?: string[] }>;
  },
  colorName: string
): string[] {
  const match = product.colors?.find(
    (c) => c.name.toLowerCase() === colorName.toLowerCase()
  );
  const colorImages = sanitizeImageList(match?.images);
  if (colorImages.length) return colorImages;
  return sanitizeImageList(product.images);
}

export function isStoredUploadUrl(url: string): boolean {
  return Boolean(parseStoredUploadUrl(url));
}
