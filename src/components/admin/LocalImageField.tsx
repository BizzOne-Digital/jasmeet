"use client";

import {
  ImageUpload,
  type ImageUploadProps,
} from "@/components/ui/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";

export type { ImageUploadFolder, UploadFolder } from "@/components/ui/ImageUpload";

export type LocalImageFieldProps = Omit<
  ImageUploadProps,
  "onSuccess" | "onError"
>;

/**
 * Admin image field — uploads to MongoDB via POST /api/upload.
 * Returns a persistent `/api/uploads/{folder}/{filename}` URL (not disk storage).
 */
export function LocalImageField(props: LocalImageFieldProps) {
  const { success, error } = useToast();

  return (
    <ImageUpload
      {...props}
      onSuccess={(message) => success(message)}
      onError={(message) => error(message)}
    />
  );
}

export default LocalImageField;
