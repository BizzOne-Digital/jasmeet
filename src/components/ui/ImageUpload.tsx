"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  folder?: string;
  label?: string;
  className?: string;
  aspectClassName?: string;
}

export function ImageUpload({
  value,
  onChange,
  onClear,
  folder = "dayaura",
  label = "Upload image",
  className,
  aspectClassName = "aspect-[4/5]",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please choose an image file.");
        return;
      }
      setError("");
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "Upload failed");
        }
        onChange(data.data.url as string);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

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
            <button
              type="button"
              onClick={() => {
                if (onClear) onClear();
                else onChange("");
              }}
              className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:text-[#D4AF37]"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
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
          accept="image/*"
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

export default ImageUpload;
