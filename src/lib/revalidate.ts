import { revalidatePath } from "next/cache";

export function revalidatePublicPaths(paths: string[] = []) {
  const defaults = [
    "/",
    "/about",
    "/shop",
    "/collections",
    "/gallery",
    "/faq",
    "/contact",
    "/size-guide",
    "/shipping-returns",
    "/privacy-policy",
    "/terms",
  ];
  [...new Set([...defaults, ...paths])].forEach((p) => revalidatePath(p));
}

export function revalidateProductPaths(slug?: string) {
  revalidatePath("/shop");
  revalidatePath("/");
  if (slug) {
    revalidatePath(`/products/${slug}`);
    revalidatePath(`/collections`);
  }
}
