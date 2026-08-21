export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export function isUploadFolder(value: string): value is UploadFolder {
  return (UPLOAD_FOLDERS as readonly string[]).includes(value);
}

export function normalizeUploadFolder(folder?: string | null): UploadFolder {
  const raw = (folder || "misc").trim().toLowerCase();
  if (isUploadFolder(raw)) return raw;
  if (raw.includes("product")) return "products";
  if (raw.includes("gallery")) return "gallery";
  if (raw.includes("page") || raw.includes("section")) return "pages";
  return "misc";
}

export function storedUploadUrl(folder: string, filename: string): string {
  return `/api/uploads/${folder}/${filename}`;
}

export function parseStoredUploadUrl(
  url?: string | null
): { folder: string; filename: string } | null {
  if (!url) return null;

  let path = url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      path = new URL(url).pathname;
    } catch {
      return null;
    }
  }

  if (!path.startsWith("/api/uploads/")) return null;
  const parts = path.replace(/^\/+/, "").split("/");
  if (parts.length !== 4 || parts[0] !== "api" || parts[1] !== "uploads") {
    return null;
  }
  const folder = parts[2];
  const filename = parts[3];
  if (!folder || !filename || filename.includes("..") || filename.includes("/")) {
    return null;
  }
  return { folder, filename };
}

export function isLegacyLocalUploadUrl(url?: string | null): boolean {
  return Boolean(url?.startsWith("/uploads/"));
}
