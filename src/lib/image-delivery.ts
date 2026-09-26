/** Pathname for relative or absolute image URLs. */
export function imageUrlPathname(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    try {
      return new URL(src).pathname;
    } catch {
      return src;
    }
  }
  return src;
}

/** Stored uploads and static /images assets should never pass through the Next optimizer. */
export function isStoredOrStaticImage(src: string): boolean {
  const path = imageUrlPathname(src);
  return (
    path.startsWith("/images/") ||
    path.startsWith("/api/uploads/") ||
    path.startsWith("/uploads/")
  );
}

/**
 * Product and marketing photos should stay at full resolution.
 * Next.js image optimization can downscale via `sizes`, which makes uploads look soft.
 */
export function shouldServeImageUnoptimized(src?: string | null): boolean {
  if (!src) return true;
  if (src.includes("placehold.co")) return true;
  if (isStoredOrStaticImage(src)) return true;
  return true;
}
