"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";
import type { SiteSettingsData } from "@/types";

const settingsSchema = z.object({
  businessName: z.string().min(1),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  contactEmail: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  businessHours: z.string().optional(),
  supportHours: z.string().optional(),
  responseTime: z.string().optional(),
  instagramUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  announcementMessages: z.array(z.string()),
  shippingThreshold: z.coerce.number().min(0),
  standardShippingRate: z.coerce.number().min(0),
  localDeliveryEnabled: z.boolean(),
  localDeliveryFee: z.coerce.number().min(0),
  localDeliveryPostalCodesText: z.string().optional(),
  firstOrderDiscountText: z.string().optional(),
  footerDescription: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  currency: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const fieldClass =
  "w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-amber-500/50 focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500";

export default function AdminSettingsPage() {
  const { openSidebar } = useAdminShell();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  const logo = watch("logo");
  const favicon = watch("favicon");
  const announcements = watch("announcementMessages") || [];
  const localDeliveryEnabled = watch("localDeliveryEnabled");

  useEffect(() => {
    void (async () => {
      const result = await adminFetch<SiteSettingsData>("/api/settings");
      if (!result.success) {
        toastError(result.error);
      } else {
        reset({
          ...result.data,
          announcementMessages: result.data.announcementMessages || [],
          standardShippingRate: result.data.standardShippingRate ?? 9.99,
          shippingThreshold: result.data.shippingThreshold ?? 99,
          localDeliveryEnabled: result.data.localDeliveryEnabled ?? false,
          localDeliveryFee: result.data.localDeliveryFee ?? 0,
          localDeliveryPostalCodesText: (
            result.data.localDeliveryPostalCodes || []
          ).join(", "),
        });
      }
      setLoading(false);
    })();
  }, [reset, toastError]);

  const onSubmit = async (values: SettingsFormValues) => {
    setSaving(true);
    const postalCodes = (values.localDeliveryPostalCodesText || "")
      .split(/[\n,]+/)
      .map((code) => code.trim().toUpperCase().replace(/\s+/g, ""))
      .filter(Boolean);

    const { localDeliveryPostalCodesText: _codes, ...rest } = values;
    const result = await adminFetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        ...rest,
        localDeliveryPostalCodes: postalCodes,
      }),
    });
    setSaving(false);
    if (!result.success) {
      toastError(result.error);
      return;
    }
    success("Settings saved");
  };

  return (
    <>
      <AdminHeader
        title="Settings"
        subtitle="Brand, contact, commerce, and SEO defaults"
        onMenuClick={openSidebar}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl bg-zinc-900/60"
              />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
                Brand
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClass}>Business name</label>
                  <input className={fieldClass} {...register("businessName")} />
                  {errors.businessName ? (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.businessName.message}
                    </p>
                  ) : null}
                </div>
                <ImageUpload
                  label="Logo"
                  value={logo || ""}
                  onChange={(url) => setValue("logo", url, { shouldDirty: true })}
                  onClear={() => setValue("logo", "", { shouldDirty: true })}
                  folder="misc"
                />
                <ImageUpload
                  label="Favicon"
                  value={favicon || ""}
                  onChange={(url) =>
                    setValue("favicon", url, { shouldDirty: true })
                  }
                  onClear={() => setValue("favicon", "", { shouldDirty: true })}
                  folder="misc"
                  aspectClassName="aspect-square max-w-[160px]"
                />
              </div>
            </section>

            <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
                Contact
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Contact email</label>
                  <input className={fieldClass} {...register("contactEmail")} />
                  {errors.contactEmail ? (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.contactEmail.message}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={fieldClass} {...register("phone")} />
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <input className={fieldClass} {...register("website")} />
                </div>
                <div>
                  <label className={labelClass}>Address / location</label>
                  <input className={fieldClass} {...register("address")} />
                </div>
                <div>
                  <label className={labelClass}>Business hours</label>
                  <input className={fieldClass} {...register("businessHours")} />
                </div>
                <div>
                  <label className={labelClass}>Support hours</label>
                  <input className={fieldClass} {...register("supportHours")} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Response time</label>
                  <input className={fieldClass} {...register("responseTime")} />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
                Social
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Instagram URL</label>
                  <input className={fieldClass} {...register("instagramUrl")} />
                </div>
                <div>
                  <label className={labelClass}>TikTok URL</label>
                  <input className={fieldClass} {...register("tiktokUrl")} />
                </div>
                <div>
                  <label className={labelClass}>Facebook URL</label>
                  <input className={fieldClass} {...register("facebookUrl")} />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-400/90">
                  Announcement messages
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setValue("announcementMessages", [...announcements, ""], {
                      shouldDirty: true,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {announcements.map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      className={fieldClass}
                      {...register(`announcementMessages.${index}`)}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setValue(
                          "announcementMessages",
                          announcements.filter((_, i) => i !== index),
                          { shouldDirty: true }
                        )
                      }
                      className="rounded p-2 text-red-400 hover:bg-red-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {announcements.length === 0 ? (
                  <p className="text-sm text-zinc-500">No announcement messages</p>
                ) : null}
              </div>
            </section>

            <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
                Shipping
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Standard shipping rate (CAD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className={fieldClass}
                    {...register("standardShippingRate")}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Free shipping threshold (CAD)
                  </label>
                  <input
                    type="number"
                    className={fieldClass}
                    {...register("shippingThreshold")}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-300 md:col-span-2">
                  <input
                    type="checkbox"
                    {...register("localDeliveryEnabled")}
                    className="rounded border-zinc-600"
                  />
                  Enable local delivery
                </label>
                <div>
                  <label className={labelClass}>Local delivery fee (CAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!localDeliveryEnabled}
                    className={fieldClass}
                    {...register("localDeliveryFee")}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Eligible postal codes / prefixes
                  </label>
                  <textarea
                    rows={3}
                    disabled={!localDeliveryEnabled}
                    className={fieldClass}
                    placeholder="M5V, M4W, L5B (comma or line separated)"
                    {...register("localDeliveryPostalCodesText")}
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Customers whose postal code starts with any of these values
                    can choose local delivery (no tracking required).
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
                Commerce & footer
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Currency</label>
                  <input className={fieldClass} {...register("currency")} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>First-order discount text</label>
                  <input
                    className={fieldClass}
                    {...register("firstOrderDiscountText")}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Footer description</label>
                  <textarea
                    rows={3}
                    className={fieldClass}
                    {...register("footerDescription")}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
                SEO defaults
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className={labelClass}>SEO title</label>
                  <input className={fieldClass} {...register("seoTitle")} />
                </div>
                <div>
                  <label className={labelClass}>SEO description</label>
                  <textarea
                    rows={3}
                    className={fieldClass}
                    {...register("seoDescription")}
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save settings
              </button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}
