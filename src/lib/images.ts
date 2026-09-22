/**
 * Central image paths for DAYAURA static fallbacks.
 * Admin-uploaded images (MongoDB) and DB fields take priority when set.
 */

const img = (path: string) => `/images/${path}`;

export const PAGE_HERO_IMAGES = {
  shop: img("pages/shop.png"),
  about: img("pages/about.png"),
  collections: img("pages/collections.png"),
  gallery: img("pages/gallery.png"),
  faq: img("pages/faq.png"),
  contact: img("pages/contact.png"),
  testimonials: img("pages/testimonials.png"),
  cart: img("pages/cart.png"),
  checkout: img("pages/checkout.png"),
  wishlist: img("pages/wishlist.png"),
  search: img("pages/search.png"),
  sizeGuide: img("pages/size-guide.png"),
  shippingReturns: img("pages/shipping-returns.png"),
  privacyPolicy: img("pages/privacy-policy.png"),
  terms: img("pages/terms.png"),
} as const;

export const COLLECTION_IMAGES: Record<string, string> = {
  aurawave: img("collections/aurawave.png"),
  auraimpact: img("collections/auraimpact.png"),
  auraflow: img("collections/auraflow.png"),
  auramesh: img("collections/auramesh.png"),
  outerwear: img("collections/outerwear.png"),
  accessories: img("collections/accessories.png"),
};

export const COLLECTION_HERO_POSITION: Record<string, string> = {
  aurawave: "object-[center_18%]",
};

const COLLECTION_IMAGE_VERSION = "20260803b";

export const SECTION_IMAGES = {
  brandStory: img("sections/brand-story.png"),
  hiddenMessage: img("sections/hidden-message.png"),
  campaign: img("sections/campaign.png"),
} as const;

export const MOVEMENT_IMAGES = {
  gym: img("movement/gym.png"),
  yoga: img("movement/yoga.png"),
  lounge: img("movement/lounge.png"),
  everyday: img("movement/everyday.png"),
  train: img("movement/train.png"),
} as const;

export const GALLERY_IMAGES = Array.from({ length: 8 }, (_, i) =>
  img(`gallery/${String(i + 1).padStart(2, "0")}.png`)
);

/** Prefer admin/DB image, then static collection file, then generic fallback. */
export function getCollectionImage(slug: string, dbImage?: string | null): string {
  if (dbImage && dbImage.trim() && !dbImage.includes("placehold.co")) {
    return dbImage;
  }
  const path = COLLECTION_IMAGES[slug] || img("hero-1.png");
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}v=${COLLECTION_IMAGE_VERSION}`;
}

export function resolveImage(localPath: string, dbImage?: string | null): string {
  if (dbImage && dbImage.trim() && !dbImage.includes("placehold.co")) {
    return dbImage;
  }
  return localPath;
}

export function getPageHeroImage(
  key: keyof typeof PAGE_HERO_IMAGES,
  override?: string | null
): string {
  if (override && override.trim() && !override.includes("placehold.co")) {
    return override;
  }
  return PAGE_HERO_IMAGES[key];
}

/** Page hero from a CMS section (e.g. page-hero) or static fallback. */
export function resolvePageHeroImage(
  key: keyof typeof PAGE_HERO_IMAGES,
  sectionImage?: string | null
): string {
  return getPageHeroImage(key, sectionImage);
}
