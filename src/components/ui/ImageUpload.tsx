"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";
import { deleteStoredUploadByUrl } from "@/lib/stored-uploads-client";
import { normalizeUploadFolder, type UploadFolder } from "@/lib/upload-folders";

export type { UploadFolder };
export type ImageUploadFolder = UploadFolder;

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  folder?: UploadFolder | string;
  label?: string;
  className?: string;
  aspectClassName?: string;
  /** Show toast callbacks when used inside admin */
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

export function ImageUpload({
  value,
  onChange,
  onClear,
  folder = "misc",
  label = "Upload image",
  className,
  aspectClassName = "aspect-[4/5]",
  onSuccess,
  onError,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const resolvedFolder = normalizeUploadFolder(
    typeof folder === "string" ? folder : "misc"
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.type)) {
        const msg = "Please choose a PNG, JPEG, WebP, or GIF image.";
        setError(msg);
        onError?.(msg);
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        const msg = "Image must be 8MB or smaller.";
        setError(msg);
        onError?.(msg);
        return;
      }

      setError("");
      setUploading(true);
      const previousUrl = value;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", resolvedFolder);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "Upload failed");
        }
        const url = data.data.url as string;
        onChange(url);
        if (previousUrl && previousUrl !== url) {
          void deleteStoredUploadByUrl(previousUrl);
        }
        onSuccess?.("Image uploaded");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
        onError?.(msg);
      } finally {
        setUploading(false);
      }
    },
    [onChange, onError, onSuccess, resolvedFolder, value]
  );

  const removeImage = useCallback(async () => {
    if (value) {
      await deleteStoredUploadByUrl(value);
    }
    if (onClear) onClear();
    else onChange("");
  }, [onChange, onClear, value]);

  useEffect(() => {
    setError("");
  }, [value]);

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#F5F0E6]/70">
          {label}
        </p>
      ) : null}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) await uploadFile(file);
        }}
        className={cn(
          "relative overflow-hidden border border-dashed transition-colors",
          aspectClassName,
          dragging
            ? "border-[#D4AF37] bg-[#D4AF37]/10"
            : "border-white/20 bg-white/[0.03]",
          value && "border-solid border-white/10"
        )}
      >
        {value ? (
          <>
            <SafeImage
              src={value}
              alt="Uploaded"
              fill
              className="object-cover"
              sizes="400px"
            />
            <div className="absolute right-2 top-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="rounded bg-black/70 px-2 py-1 text-[10px] uppercase tracking-wider text-white hover:text-[#D4AF37]"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => void removeImage()}
                className="rounded-full bg-black/70 p-1.5 text-white hover:text-[#D4AF37]"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/55 hover:text-[#D4AF37]"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
            <span className="text-xs tracking-wide">
              {uploading ? "Uploading…" : "Drag & drop or click"}
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

/** Alias matching the requested component name. */
export const LocalImageField = ImageUpload;

export default ImageUpload;
