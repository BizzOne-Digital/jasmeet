import { parseStoredUploadUrl } from "@/lib/upload-folders";
import { connectDB } from "@/lib/mongodb";
import StoredUpload from "@/models/StoredUpload";
import {
  sanitizeImageList,
  sanitizeProductColors,
  isStoredUploadUrl,
} from "@/lib/product-images";

/** Drop admin upload URLs that no longer exist in MongoDB. */
export async function filterExistingUploadUrls(
  urls: string[]
): Promise<string[]> {
  const stored = urls.filter(isStoredUploadUrl);
  const staticUrls = urls.filter((u) => !isStoredUploadUrl(u));
  if (!stored.length) return urls;

  await connectDB();
  const checks = await Promise.all(
    stored.map(async (url) => {
      const parsed = parseStoredUploadUrl(url);
      if (!parsed) return null;
      const exists = await StoredUpload.exists({
        folder: parsed.folder,
        filename: parsed.filename,
      });
      return exists ? url : null;
    })
  );

  return [
    ...staticUrls,
    ...checks.filter((url): url is string => Boolean(url)),
  ];
}

export async function sanitizeProductImagePayload(
  data: Record<string, unknown>
) {
  if (data.images !== undefined) {
    data.images = await filterExistingUploadUrls(
      sanitizeImageList(data.images)
    );
  }
  if (data.hoverImage !== undefined) {
    const hover = sanitizeImageList([data.hoverImage])[0] || "";
    data.hoverImage = hover
      ? (await filterExistingUploadUrls([hover]))[0] || ""
      : "";
  }
  if (data.colors !== undefined) {
    const colors = sanitizeProductColors(data.colors);
    data.colors = await Promise.all(
      colors.map(async (color) => ({
        ...color,
        images: color.images?.length
          ? await filterExistingUploadUrls(color.images)
          : undefined,
      }))
    );
  }
  return data;
}
