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
  parseUploadFolderInput,
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

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function resolveUploadMimeType(file: File): string | null {
  if (file.type && ALLOWED_MIME.has(file.type)) {
    return file.type;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const mime = MIME_BY_EXT[ext];
  return mime && ALLOWED_MIME.has(mime) ? mime : null;
}

/** Normalize MongoDB / Mongoose binary fields for HTTP responses. */
export function storedUploadDataToUint8Array(data: unknown): Uint8Array {
  if (data instanceof Uint8Array) {
    return data;
  }
  if (Buffer.isBuffer(data)) {
    return new Uint8Array(data);
  }
  if (
    typeof data === "object" &&
    data !== null &&
    "_bsontype" in data &&
    (data as { _bsontype: string })._bsontype === "Binary" &&
    "buffer" in data
  ) {
    const buf = (data as { buffer: Buffer }).buffer;
    return new Uint8Array(buf);
  }
  const serialized = data as { type?: string; data?: number[] };
  if (
    serialized?.type === "Buffer" &&
    Array.isArray(serialized.data)
  ) {
    return Uint8Array.from(serialized.data);
  }
  throw new Error("Invalid stored upload data");
}

export async function saveStoredUpload(
  file: File,
  folder: UploadFolder
): Promise<{ url: string; filename: string; size: number; folder: UploadFolder }> {
  const mimeType = resolveUploadMimeType(file);
  if (!mimeType) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be 8MB or smaller");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = EXT_BY_MIME[mimeType] || "jpg";
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;

  await connectDB();
  await StoredUpload.syncIndexes();
  await StoredUpload.create({
    folder,
    filename,
    mimeType,
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
    data: storedUploadDataToUint8Array(doc.data),
  };
}

export interface IStoredUploadLean {
  mimeType: string;
  size: number;
  data: Uint8Array;
}
