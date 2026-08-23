import { PRODUCT_IMAGE_BACKDROP } from "@/lib/product-image-backdrop";

/** Uniform product card / gallery backdrop. */
export function useProductImageBackdrop(_src?: string | null): string {
  return PRODUCT_IMAGE_BACKDROP;
}
