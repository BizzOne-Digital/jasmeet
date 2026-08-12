"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { adminFetch } from "@/lib/admin-fetch";
import { buildInventoryMatrix } from "@/lib/inventory";
import { slugify } from "@/lib/utils";

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  sku: z.string().min(1, "SKU is required"),
  shortDescription: z.string(),
  description: z.string(),
  collection: z.string().min(1, "Collection is required"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0),
  compareAtPrice: z.union([z.coerce.number().min(0), z.literal(""), z.nan()]).optional(),
  images: z.array(z.string()),
  hoverImage: z.string().optional(),
  colors: z.array(
    z.object({
      name: z.string().min(1),
      hex: z.string(),
      images: z.array(z.string()).optional(),
    })
  ),
  sizes: z.array(
    z.object({ size: z.string().min(1), stock: z.coerce.number().int().min(0) })
  ),
  inventory: z.array(
    z.object({
      colorName: z.string().min(1),
      size: z.string().min(1),
      stock: z.coerce.number().int().min(0),
    })
  ),
  materials: z.string(),
  careInstructions: z.string(),
  fitDetails: z.string(),
  hiddenMessage: z.string(),
  highlights: z.array(z.string()),
  modelInfo: z.string().optional(),
  sizeGuideUnit: z.string().optional(),
  sizeGuideColumns: z.string().optional(),
  sizeGuideRowsText: z.string().optional(),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isOnSale: z.boolean(),
  isBestSeller: z.boolean(),
  isComingSoon: z.boolean(),
  allowPreOrder: z.boolean(),
  preOrderLeadTime: z.string(),
  status: z.enum(["draft", "published"]),
  order: z.coerce.number().int(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export type ProductFormSubmitValues = Omit<
  ProductFormValues,
  "sizeGuideUnit" | "sizeGuideColumns" | "sizeGuideRowsText"
> & {
  sizeGuide?: {
    unit: string;
    columns: string[];
    rows: Array<{ size: string; values: string[] }>;
  } | null;
};

function parseSizeGuideFromForm(values: ProductFormValues): ProductFormSubmitValues["sizeGuide"] {
  const columns = (values.sizeGuideColumns || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const rows = (values.sizeGuideRowsText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,|]/).map((p) => p.trim()).filter(Boolean);
      const [size, ...values] = parts;
      return { size: size || "", values };
    })
    .filter((row) => row.size);

  if (!columns.length || !rows.length) return null;
  return {
    unit: (values.sizeGuideUnit || "CM").trim() || "CM",
    columns,
    rows,
  };
}

export function sizeGuideToFormFields(guide?: {
  unit?: string;
  columns?: string[];
  rows?: Array<{ size: string; values: string[] }>;
  sections?: Array<{
    title?: string;
    columns: string[];
    rows: Array<{ size: string; values: string[] }>;
  }>;
} | null) {
  const primary =
    guide?.columns?.length && guide?.rows?.length
      ? { columns: guide.columns, rows: guide.rows, unit: guide.unit }
      : guide?.sections?.find((s) => s.columns?.length && s.rows?.length)
        ? {
            columns: guide.sections.find((s) => s.columns?.length && s.rows?.length)!
              .columns,
            rows: guide.sections.find((s) => s.columns?.length && s.rows?.length)!
              .rows,
            unit: guide.unit,
          }
        : null;

  if (primary) {
    return {
      sizeGuideUnit: primary.unit || "CM",
      sizeGuideColumns: primary.columns.join(", "),
      sizeGuideRowsText: primary.rows
        .map((r) => [r.size, ...(r.values || [])].join(", "))
        .join("\n"),
    };
  }
  return {
    sizeGuideUnit: guide?.unit || "CM",
    sizeGuideColumns: "",
    sizeGuideRowsText: "",
  };
}

interface Option {
  _id: string;
  name: string;
}

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormSubmitValues) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

const fieldClass =
  "w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500";

const emptyDefaults: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  shortDescription: "",
  description: "",
  collection: "",
  category: "",
  price: 0,
  compareAtPrice: undefined as unknown as number,
  images: [],
  hoverImage: "",
  colors: [],
  sizes: [
    { size: "XS", stock: 0 },
    { size: "S", stock: 0 },
    { size: "M", stock: 0 },
    { size: "L", stock: 0 },
    { size: "XL", stock: 0 },
  ],
  inventory: [],
  materials: "",
  careInstructions: "",
  fitDetails: "",
  hiddenMessage: "",
  highlights: [],
  modelInfo: "",
  sizeGuideUnit: "CM",
  sizeGuideColumns: "",
  sizeGuideRowsText: "",
  isFeatured: false,
  isNewArrival: false,
  isOnSale: false,
  isBestSeller: false,
  isComingSoon: false,
  allowPreOrder: false,
  preOrderLeadTime: "Pre-Order – Ships in 2–3 weeks",
  status: "draft",
  order: 0,
  seoTitle: "",
  seoDescription: "",
};

export default function ProductForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save product",
  loading,
}: ProductFormProps) {
  const [collections, setCollections] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [highlightInput, setHighlightInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
  } = useFieldArray({ control, name: "colors" });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({ control, name: "sizes" });

  const {
    fields: inventoryFields,
    replace: replaceInventory,
  } = useFieldArray({ control, name: "inventory" });

  const images = watch("images") || [];
  const hoverImage = watch("hoverImage");
  const highlights = watch("highlights") || [];
  const name = watch("name");
  const watchedColors = watch("colors") || [];
  const watchedSizes = watch("sizes") || [];
  const allowPreOrder = watch("allowPreOrder");

  const syncInventoryMatrix = () => {
    const colors = (watchedColors || []).filter((c) => c.name?.trim());
    const sizes = (watchedSizes || []).filter((s) => s.size?.trim());
    if (!colors.length || !sizes.length) {
      replaceInventory([]);
      return;
    }
    const next = buildInventoryMatrix(
      colors,
      sizes,
      watch("inventory") || []
    );
    replaceInventory(next);
  };

  useEffect(() => {
    void (async () => {
      const [cols, cats] = await Promise.all([
        adminFetch<Option[]>("/api/collections?all=true"),
        adminFetch<Option[]>("/api/categories?all=true"),
      ]);
      if (cols.success) setCollections(cols.data);
      if (cats.success) setCategories(cats.data);
    })();
  }, []);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const compare =
          values.compareAtPrice === undefined ||
          values.compareAtPrice === ("" as unknown as number) ||
          (typeof values.compareAtPrice === "number" &&
            Number.isNaN(values.compareAtPrice))
            ? undefined
            : Number(values.compareAtPrice);

        const sizeGuide = parseSizeGuideFromForm(values);
        const {
          sizeGuideUnit: _unit,
          sizeGuideColumns: _cols,
          sizeGuideRowsText: _rows,
          ...rest
        } = values;

        const inventory =
          rest.inventory?.length > 0
            ? rest.inventory
            : buildInventoryMatrix(rest.colors || [], rest.sizes || [], []);

        // Keep size.stock as total across colours for cards / quick view fallback
        const sizes = (rest.sizes || []).map((sizeRow) => {
          const total = inventory
            .filter(
              (row) =>
                row.size.toLowerCase() === sizeRow.size.toLowerCase()
            )
            .reduce((sum, row) => sum + (row.stock || 0), 0);
          return { ...sizeRow, stock: total };
        });

        await onSubmit({
          ...rest,
          sizes,
          inventory,
          compareAtPrice: compare,
          ...(sizeGuide ? { sizeGuide } : {}),
        });
      })}
      className="space-y-8"
    >
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
          Basics
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Name</label>
            <input
              className={fieldClass}
              {...register("name")}
              onBlur={() => {
                if (!watch("slug") && name) {
                  setValue("slug", slugify(name));
                }
              }}
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            ) : null}
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input className={fieldClass} {...register("slug")} />
            {errors.slug ? (
              <p className="mt-1 text-xs text-red-400">{errors.slug.message}</p>
            ) : null}
          </div>
          <div>
            <label className={labelClass}>SKU</label>
            <input className={fieldClass} {...register("sku")} />
            {errors.sku ? (
              <p className="mt-1 text-xs text-red-400">{errors.sku.message}</p>
            ) : null}
          </div>
          <div>
            <label className={labelClass}>Collection</label>
            <select className={fieldClass} {...register("collection")}>
              <option value="">Select collection</option>
              {collections.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.collection ? (
              <p className="mt-1 text-xs text-red-400">{errors.collection.message}</p>
            ) : null}
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select className={fieldClass} {...register("category")}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category ? (
              <p className="mt-1 text-xs text-red-400">{errors.category.message}</p>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Short description</label>
            <textarea rows={2} className={fieldClass} {...register("shortDescription")} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Full description</label>
            <textarea rows={5} className={fieldClass} {...register("description")} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
          Pricing & status
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>Price (CAD)</label>
            <input type="number" step="0.01" className={fieldClass} {...register("price")} />
          </div>
          <div>
            <label className={labelClass}>Compare-at price</label>
            <input
              type="number"
              step="0.01"
              className={fieldClass}
              {...register("compareAtPrice")}
            />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={fieldClass} {...register("status")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Display order</label>
            <input type="number" className={fieldClass} {...register("order")} />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" {...register("isFeatured")} className="rounded border-zinc-600" />
            Featured (homepage)
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" {...register("isNewArrival")} className="rounded border-zinc-600" />
            New arrival
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" {...register("isOnSale")} className="rounded border-zinc-600" />
            On sale
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" {...register("isBestSeller")} className="rounded border-zinc-600" />
            Best seller
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" {...register("isComingSoon")} className="rounded border-zinc-600" />
            Coming soon
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
          Images
        </h2>
        <p className="mb-4 text-xs text-zinc-500">
          Each upload becomes a gallery slide. Add product photos first, then a size-chart
          image last (paths containing &quot;size-chart&quot; display with contain, not crop).
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <ImageUpload
            label="Add product image"
            value=""
            onChange={(url) => {
              if (url) setValue("images", [...images, url], { shouldDirty: true });
            }}
            folder="products"
          />
          <ImageUpload
            label="Hover image"
            value={hoverImage || ""}
            onChange={(url) => setValue("hoverImage", url, { shouldDirty: true })}
            onClear={() => setValue("hoverImage", "", { shouldDirty: true })}
            folder="products"
          />
        </div>
        {images.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img, i) => (
              <div key={`${img}-${i}`} className="relative overflow-hidden rounded-lg border border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "images",
                      images.filter((_, idx) => idx !== i),
                      { shouldDirty: true }
                    )
                  }
                  className="absolute right-2 top-2 rounded bg-black/70 p-1.5 text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-400/90">
            Colors
          </h2>
          <button
            type="button"
            onClick={() => appendColor({ name: "", hex: "#000000", images: [] })}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5" /> Add color
          </button>
        </div>
        <div className="space-y-4">
          {colorFields.map((field, index) => {
            const colorImages = watch(`colors.${index}.images`) || [];
            return (
              <div
                key={field.id}
                className="space-y-3 rounded-lg border border-zinc-800 p-3"
              >
                <div className="flex gap-2">
                  <input
                    placeholder="Color name"
                    className={fieldClass}
                    {...register(`colors.${index}.name`)}
                  />
                  <input
                    type="color"
                    className="h-10 w-14 rounded border border-zinc-700 bg-zinc-950"
                    {...register(`colors.${index}.hex`)}
                  />
                  <button
                    type="button"
                    onClick={() => removeColor(index)}
                    className="rounded p-2 text-red-400 hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <ImageUpload
                  label={`${watch(`colors.${index}.name`) || "Color"} gallery images`}
                  value=""
                  folder="products"
                  aspectClassName="aspect-[3/2]"
                  onChange={(url) => {
                    if (!url) return;
                    setValue(
                      `colors.${index}.images`,
                      [...colorImages, url],
                      { shouldDirty: true }
                    );
                  }}
                />
                {colorImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {colorImages.map((img, imgIdx) => (
                      <div
                        key={`${img}-${imgIdx}`}
                        className="relative overflow-hidden rounded border border-zinc-800"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="aspect-square w-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setValue(
                              `colors.${index}.images`,
                              colorImages.filter((_, i) => i !== imgIdx),
                              { shouldDirty: true }
                            )
                          }
                          className="absolute right-1 top-1 rounded bg-black/70 p-1 text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-400/90">
            Sizes
          </h2>
          <button
            type="button"
            onClick={() => appendSize({ size: "", stock: 0 })}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5" /> Add size
          </button>
        </div>
        <p className="mb-3 text-xs text-zinc-500">
          Size labels only — stock is managed per colour × size below.
        </p>
        <div className="space-y-2">
          {sizeFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                placeholder="Size"
                className={fieldClass}
                {...register(`sizes.${index}.size`)}
              />
              <button
                type="button"
                onClick={() => removeSize(index)}
                className="rounded p-2 text-red-400 hover:bg-red-950/40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-400/90">
            Inventory (colour × size)
          </h2>
          <button
            type="button"
            onClick={syncInventoryMatrix}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            Sync matrix from colours & sizes
          </button>
        </div>
        {inventoryFields.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Add colours and sizes, then sync the inventory matrix.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="pb-2 pr-3 font-medium">Colour</th>
                  <th className="pb-2 pr-3 font-medium">Size</th>
                  <th className="pb-2 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventoryFields.map((field, index) => (
                  <tr key={field.id} className="border-b border-zinc-800/60">
                    <td className="py-2 pr-3 text-zinc-300">
                      <input type="hidden" {...register(`inventory.${index}.colorName`)} />
                      {watch(`inventory.${index}.colorName`)}
                    </td>
                    <td className="py-2 pr-3 text-zinc-300">
                      <input type="hidden" {...register(`inventory.${index}.size`)} />
                      {watch(`inventory.${index}.size`)}
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={0}
                        className={`${fieldClass} max-w-[120px]`}
                        {...register(`inventory.${index}.stock`)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
          Pre-order
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-start gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              {...register("allowPreOrder")}
              className="mt-1 rounded border-zinc-600"
            />
            <span>
              Available for pre-order when out of stock
              <span className="mt-1 block text-xs text-zinc-500">
                If unchecked, out-of-stock variants show as Sold Out.
              </span>
            </span>
          </label>
          <div>
            <label className={labelClass}>Estimated processing time</label>
            <input
              className={fieldClass}
              disabled={!allowPreOrder}
              placeholder="Pre-Order – Ships in 2–3 weeks"
              {...register("preOrderLeadTime")}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
          Details
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Materials</label>
            <textarea rows={3} className={fieldClass} {...register("materials")} />
          </div>
          <div>
            <label className={labelClass}>Care instructions</label>
            <textarea rows={3} className={fieldClass} {...register("careInstructions")} />
          </div>
          <div>
            <label className={labelClass}>Fit details</label>
            <textarea rows={3} className={fieldClass} {...register("fitDetails")} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Model info (under gallery)</label>
            <input
              className={fieldClass}
              placeholder={`Model Height 5'6" | Bust: 32" | Waist: 24" | Hips: 34" | Wearing Size: Small`}
              {...register("modelInfo")}
            />
          </div>
          <div>
            <label className={labelClass}>Hidden motivational message</label>
            <textarea rows={3} className={fieldClass} {...register("hiddenMessage")} />
          </div>
          <div className="md:col-span-2 space-y-3 rounded-lg border border-zinc-800 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-400/90">
              Size guide table
            </p>
            <p className="text-xs text-zinc-500">
              Shown in the product accordion. Columns comma-separated. Rows one per line:
              Size, value1, value2…
            </p>
            <div>
              <label className={labelClass}>Unit</label>
              <input className={fieldClass} placeholder="CM" {...register("sizeGuideUnit")} />
            </div>
            <div>
              <label className={labelClass}>Columns</label>
              <input
                className={fieldClass}
                placeholder="Chest, Waistline, Shoulder, Clothes length, Sleeve Length"
                {...register("sizeGuideColumns")}
              />
            </div>
            <div>
              <label className={labelClass}>Rows</label>
              <textarea
                rows={5}
                className={fieldClass}
                placeholder={"S, 70, 58, 35.5, 80, 51\nM, 74, 62, 36.5, 81, 52"}
                {...register("sizeGuideRowsText")}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Highlights</label>
            <div className="flex gap-2">
              <input
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                className={fieldClass}
                placeholder="Add a highlight"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (highlightInput.trim()) {
                      setValue("highlights", [...highlights, highlightInput.trim()]);
                      setHighlightInput("");
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (highlightInput.trim()) {
                    setValue("highlights", [...highlights, highlightInput.trim()]);
                    setHighlightInput("");
                  }
                }}
                className="rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {highlights.map((h, i) => (
                <span
                  key={`${h}-${i}`}
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-300"
                >
                  {h}
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        "highlights",
                        highlights.filter((_, idx) => idx !== i)
                      )
                    }
                    className="text-zinc-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
          SEO
        </h2>
        <div className="grid gap-4">
          <div>
            <label className={labelClass}>SEO title</label>
            <input className={fieldClass} {...register("seoTitle")} />
          </div>
          <div>
            <label className={labelClass}>SEO description</label>
            <textarea rows={3} className={fieldClass} {...register("seoDescription")} />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
