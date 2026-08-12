import { randomBytes } from "crypto";
import { connectDB } from "@/lib/mongodb";
import StoredUpload from "@/models/StoredUpload";
import {
  isUploadFolder,
  parseStoredUploadUrl,
  storedUploadUrl,
  type UploadFolder,
} from "@/lib/upload-folders";

export {
  UPLOAD_FOLDERS,
  normalizeUploadFolder,
  parseStoredUploadUrl,
  storedUploadUrl,
  isLegacyLocalUploadUrl,
} from "@/lib/upload-folders";
export type { UploadFolder } from "@/lib/upload-folders";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function saveStoredUpload(
  file: File,
  folder: UploadFolder
): Promise<{ url: string; filename: string; size: number; folder: UploadFolder }> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be 8MB or smaller");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = EXT_BY_MIME[file.type] || "jpg";
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;

  await connectDB();
  await StoredUpload.create({
    folder,
    filename,
    mimeType: file.type,
    size: buffer.length,
    data: buffer,
  });

  return {
    url: storedUploadUrl(folder, filename),
    filename,
    size: buffer.length,
    folder,
  };
}

export async function deleteStoredUploadByUrl(url?: string | null): Promise<void> {
  const parsed = parseStoredUploadUrl(url);
  if (!parsed) return;

  await connectDB();
  await StoredUpload.deleteOne({
    folder: parsed.folder,
    filename: parsed.filename,
  });
}

export async function getStoredUpload(
  folder: string,
  filename: string
): Promise<IStoredUploadLean | null> {
  if (!isUploadFolder(folder)) return null;
  if (!filename || filename.includes("..") || filename.includes("/")) return null;

  await connectDB();
  const doc = await StoredUpload.findOne({ folder, filename })
    .select("mimeType size data")
    .lean();
  if (!doc) return null;
  return {
    mimeType: doc.mimeType,
    size: doc.size,
    data: doc.data as Buffer,
  };
}

export interface IStoredUploadLean {
  mimeType: string;
  size: number;
  data: Buffer;
}
