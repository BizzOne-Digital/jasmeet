"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { PageSectionData } from "@/types";

const sectionSchema = z.object({
  sectionKey: z.string().min(1, "Section key is required"),
  internalName: z.string().min(1, "Internal name is required"),
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  backgroundImage: z.string().optional(),
  sideImage: z.string().optional(),
  mobileImage: z.string().optional(),
  imageAlt: z.string().optional(),
  backgroundColor: z.string().optional(),
  theme: z.enum(["dark", "light", "beige"]),
  alignment: z.enum(["left", "center", "right"]),
  isVisible: z.boolean(),
  order: z.number().int(),
  status: z.enum(["draft", "published"]),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;

interface SectionEditorProps {
  section: PageSectionData;
  onSave: (values: SectionFormValues) => Promise<void>;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleVisibility: () => void;
  saving?: boolean;
}

const fieldClass =
  "w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500";

export default function SectionEditor({
  section,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  saving,
}: SectionEditorProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    values: {
      sectionKey: section.sectionKey,
      internalName: section.internalName,
      eyebrow: section.eyebrow || "",
      heading: section.heading || "",
      subheading: section.subheading || "",
      body: section.body || "",
      ctaLabel: section.ctaLabel || "",
      ctaUrl: section.ctaUrl || "",
      backgroundImage: section.backgroundImage || "",
      sideImage: section.sideImage || "",
      mobileImage: section.mobileImage || "",
      imageAlt: section.imageAlt || "",
      backgroundColor: section.backgroundColor || "",
      theme: section.theme || "dark",
      alignment: section.alignment || "left",
      isVisible: section.isVisible,
      order: section.order,
      status: section.status,
    },
  });

  const bgImage = watch("backgroundImage");
  const sideImage = watch("sideImage");
  const mobileImage = watch("mobileImage");

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="rounded-xl border border-zinc-800 bg-zinc-900/50"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div>
          <h3 className="font-medium text-zinc-100">{section.internalName}</h3>
          <p className="text-xs text-zinc-500">
            {section.sectionKey} · order {section.order}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!onMoveUp}
            className="rounded p-2 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!onMoveDown}
            className="rounded p-2 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleVisibility}
            className="rounded p-2 text-zinc-400 hover:bg-zinc-800"
            aria-label={section.isVisible ? "Hide section" : "Show section"}
          >
            {section.isVisible ? (
              <Eye className="h-4 w-4 text-emerald-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-zinc-500" />
            )}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-2 text-red-400 hover:bg-red-950/50"
            aria-label="Delete section"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Internal name</label>
          <input className={fieldClass} {...register("internalName")} />
          {errors.internalName ? (
            <p className="mt-1 text-xs text-red-400">{errors.internalName.message}</p>
          ) : null}
        </div>
        <div>
          <label className={labelClass}>Section key</label>
          <input className={fieldClass} {...register("sectionKey")} />
        </div>
        <div>
          <label className={labelClass}>Eyebrow</label>
          <input className={fieldClass} {...register("eyebrow")} />
        </div>
        <div>
          <label className={labelClass}>Heading</label>
          <input className={fieldClass} {...register("heading")} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Subheading</label>
          <input className={fieldClass} {...register("subheading")} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Body</label>
          <textarea rows={4} className={fieldClass} {...register("body")} />
        </div>
        <div>
          <label className={labelClass}>CTA label</label>
          <input className={fieldClass} {...register("ctaLabel")} />
        </div>
        <div>
          <label className={labelClass}>CTA URL</label>
          <input className={fieldClass} {...register("ctaUrl")} />
        </div>
        <div>
          <label className={labelClass}>Theme</label>
          <select className={fieldClass} {...register("theme")}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="beige">Beige</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Alignment</label>
          <select className={fieldClass} {...register("alignment")}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Background color</label>
          <input className={fieldClass} {...register("backgroundColor")} />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={fieldClass} {...register("status")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <ImageUpload
          label="Background image"
          value={bgImage}
          onChange={(url) =>
            setValue("backgroundImage", url, { shouldDirty: true })
          }
          onClear={() =>
            setValue("backgroundImage", "", { shouldDirty: true })
          }
          folder="dayaura/sections"
        />
        <div>
          <label className={labelClass}>Image alt text</label>
          <input className={fieldClass} {...register("imageAlt")} />
        </div>
        <ImageUpload
          label="Side image"
          value={sideImage}
          onChange={(url) => setValue("sideImage", url, { shouldDirty: true })}
          onClear={() => setValue("sideImage", "", { shouldDirty: true })}
          folder="dayaura/sections"
        />
        <ImageUpload
          label="Mobile image"
          value={mobileImage}
          onChange={(url) => setValue("mobileImage", url, { shouldDirty: true })}
          onClear={() => setValue("mobileImage", "", { shouldDirty: true })}
          folder="dayaura/sections"
          className="md:col-span-2"
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-zinc-800 px-4 py-3">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save section
        </button>
      </div>
    </form>
  );
}
