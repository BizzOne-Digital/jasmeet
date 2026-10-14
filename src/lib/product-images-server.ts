import { parseStoredUploadUrl } from "@/lib/upload-folders";
import { connectDB } from "@/lib/mongodb";
import StoredUpload from "@/models/StoredUpload";
import {
  sanitizeImageList,
  sanitizeProductColors,
  isStoredUploadUrl,
} from "@/lib/product-images";

/** Drop admin upload URLs that no longer exist in MongoDB (batch query, fail-open on DB errors). */
export async function filterExistingUploadUrls(
  urls: string[]
): Promise<string[]> {
  const stored = urls.filter(isStoredUploadUrl);
  const staticUrls = urls.filter((u) => !isStoredUploadUrl(u));
  if (!stored.length) return urls;

  const parsedPairs = stored
    .map((url) => ({ url, parsed: parseStoredUploadUrl(url) }))
    .filter((entry): entry is { url: string; parsed: { folder: string; filename: string } } =>
      Boolean(entry.parsed)
    );

  if (!parsedPairs.length) return staticUrls;

  try {
    await connectDB();
    const docs = await StoredUpload.find({
      $or: parsedPairs.map(({ parsed }) => ({
        folder: parsed.folder,
        filename: parsed.filename,
      })),
    })
      .select("folder filename")
      .lean();

    const existing = new Set(
      docs.map((d) => `${d.folder}/${d.filename}`)
    );

    const keptStored = parsedPairs
      .filter(({ parsed }) => existing.has(`${parsed.folder}/${parsed.filename}`))
      .map(({ url }) => url);

    return [...staticUrls, ...keptStored];
  } catch (error) {
    console.error("[filterExistingUploadUrls]", error);
    // Keep URLs on save — stripping breaks freshly uploaded images; orphan cleanup is non-critical.
    return urls;
  }
}

export type SanitizeProductImageOptions = {
  /** When true, drop `/api/uploads/` URLs missing from MongoDB. Off by default on admin save. */
  verifyStoredUploads?: boolean;
};

export async function sanitizeProductImagePayload(
  data: Record<string, unknown>,
  options?: SanitizeProductImageOptions
) {
  const verifyStoredUploads = options?.verifyStoredUploads ?? false;

  const finalizeList = async (list: string[]) =>
    verifyStoredUploads ? filterExistingUploadUrls(list) : list;

  if (data.images !== undefined) {
    data.images = await finalizeList(sanitizeImageList(data.images));
  }
  if (data.hoverImage !== undefined) {
    const hover = sanitizeImageList([data.hoverImage])[0] || "";
    data.hoverImage = hover
      ? (await finalizeList([hover]))[0] || ""
      : "";
  }
  if (data.colors !== undefined) {
    const colors = sanitizeProductColors(data.colors);
    data.colors = await Promise.all(
      colors.map(async (color) => ({
        ...color,
        images: color.images?.length
          ? await finalizeList(color.images)
          : undefined,
      }))
    );
  }
  return data;
}
