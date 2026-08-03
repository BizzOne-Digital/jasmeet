import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const isCloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export function isCloudinaryEnabled(): boolean {
  return isCloudinaryConfigured;
}

export async function uploadImage(
  file: File,
  folder = "dayaura"
): Promise<{ url: string; publicId?: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (isCloudinaryConfigured) {
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder, resource_type: "image" }, (error, result) => {
            if (error || !result) reject(error || new Error("Upload failed"));
            else resolve(result as { secure_url: string; public_id: string });
          })
          .end(buffer);
      }
    );
    return { url: result.secure_url, publicId: result.public_id };
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);
  return { url: `/uploads/${filename}` };
}

export async function deleteImage(publicId?: string, localUrl?: string): Promise<void> {
  if (publicId && isCloudinaryConfigured) {
    await cloudinary.uploader.destroy(publicId);
    return;
  }
  if (localUrl?.startsWith("/uploads/")) {
    const { unlink } = await import("fs/promises");
    const filepath = path.join(process.cwd(), "public", localUrl);
    try {
      await unlink(filepath);
    } catch {
      // file may not exist
    }
  }
}
