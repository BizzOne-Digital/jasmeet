import type { MetadataRoute } from "next";
import {
  getCollections,
  getCategories,
  getProducts,
} from "@/lib/data/queries";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/about",
    "/shop",
    "/collections",
    "/gallery",
    "/testimonials",
    "/faq",
    "/contact",
    "/size-guide",
    "/shipping-returns",
    "/privacy-policy",
    "/terms",
  ];

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: now,
    changeFrequency: path === "" || path === "/shop" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.7,
  }));

  try {
    const [collections, categories, productsResult] = await Promise.all([
      getCollections(),
      getCategories(),
      getProducts({ limit: 500, page: 1 }),
    ]);

    const collectionEntries: MetadataRoute.Sitemap = collections.map((c) => ({
      url: absoluteUrl(`/collections/${c.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const productEntries: MetadataRoute.Sitemap = productsResult.products.map(
      (p) => ({
        url: absoluteUrl(`/products/${p.slug}`),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })
    );

    return [
      ...staticEntries,
      ...collectionEntries,
      ...categoryEntries,
      ...productEntries,
    ];
  } catch {
    return staticEntries;
  }
}
