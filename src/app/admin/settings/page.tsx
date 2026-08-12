"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  adminCardClass,
  adminCardInnerClass,
  adminFieldClass,
  adminGhostBtnClass,
  adminLabelClass,
  adminPageClass,
  adminPrimaryBtnClass,
  adminSectionTitleClass,
  adminTabClass,
} from "@/components/admin/admin-ui";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";
import type { SiteSettingsData } from "@/types";
import { cn } from "@/lib/utils";

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
type SettingsTab = "general" | "social" | "commerce" | "seo";

export default function AdminSettingsPage() {
  const { openSidebar } = useAdminShell();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<SettingsTab>("general");

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

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "social", label: "Social" },
    { id: "commerce", label: "E-commerce" },
    { id: "seo", label: "SEO" },
  ];

  return (
    <>
      <AdminHeader
        title="Settings"
        subtitle="Manage your site settings. Changes will be reflected across the website."
        onMenuClick={openSidebar}
        actions={
          <button
            type="submit"
            form="settings-form"
            disabled={saving || loading}
            className={adminPrimaryBtnClass}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save settings
          </button>
        }
      />
      <main className={cn(adminPageClass, "mx-auto max-w-4xl space-y-6")}>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(adminCardClass, "h-40 animate-pulse bg-white/[0.02]")}
              />
            ))}
          </div>
        ) : (
          <form
            id="settings-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="flex flex-wrap gap-2">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={adminTabClass(tab === item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === "general" ? (
              <div className="space-y-6">
                <section className={cn(adminCardClass, adminCardInnerClass)}>
                  <h2 className={cn(adminSectionTitleClass, "mb-5")}>Brand</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className={adminLabelClass}>Business name</label>
                      <input
                        className={adminFieldClass}
                        {...register("businessName")}
                      />
                      {errors.businessName ? (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.businessName.message}
                        </p>
                      ) : null}
                    </div>
                    <ImageUpload
                      label="Logo"
                      value={logo || ""}
                      onChange={(url) =>
                        setValue("logo", url, { shouldDirty: true })
                      }
                      onClear={() => setValue("logo", "", { shouldDirty: true })}
                      folder="misc"
                    />
                    <ImageUpload
                      label="Favicon"
                      value={favicon || ""}
                      onChange={(url) =>
                        setValue("favicon", url, { shouldDirty: true })
                      }
                      onClear={() =>
                        setValue("favicon", "", { shouldDirty: true })
                      }
                      folder="misc"
                      aspectClassName="aspect-square max-w-[160px]"
                    />
                  </div>
                </section>

                <section className={cn(adminCardClass, adminCardInnerClass)}>
                  <h2 className={cn(adminSectionTitleClass, "mb-5")}>Contact</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={adminLabelClass}>Email</label>
                      <input
                        className={adminFieldClass}
                        {...register("contactEmail")}
                      />
                      {errors.contactEmail ? (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.contactEmail.message}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label className={adminLabelClass}>Phone</label>
                      <input className={adminFieldClass} {...register("phone")} />
                    </div>
                    <div>
                      <label className={adminLabelClass}>Website</label>
                      <input className={adminFieldClass} {...register("website")} />
                    </div>
                    <div>
                      <label className={adminLabelClass}>Address</label>
                      <input className={adminFieldClass} {...register("address")} />
                    </div>
                    <div>
                      <label className={adminLabelClass}>Business hours</label>
                      <input
                        className={adminFieldClass}
                        {...register("businessHours")}
                      />
                    </div>
                    <div>
                      <label className={adminLabelClass}>Support hours</label>
                      <input
                        className={adminFieldClass}
                        {...register("supportHours")}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={adminLabelClass}>Response time</label>
                      <input
                        className={adminFieldClass}
                        {...register("responseTime")}
                      />
                    </div>
                  </div>
                </section>
              </div>
            ) : null}

            {tab === "social" ? (
              <section className={cn(adminCardClass, adminCardInnerClass)}>
                <h2 className={cn(adminSectionTitleClass, "mb-5")}>Social links</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className={adminLabelClass}>Instagram URL</label>
                    <input
                      className={adminFieldClass}
                      {...register("instagramUrl")}
                    />
                  </div>
                  <div>
                    <label className={adminLabelClass}>TikTok URL</label>
                    <input className={adminFieldClass} {...register("tiktokUrl")} />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Facebook URL</label>
                    <input
                      className={adminFieldClass}
                      {...register("facebookUrl")}
                    />
                  </div>
                </div>
              </section>
            ) : null}

            {tab === "commerce" ? (
              <div className="space-y-6">
                <section className={cn(adminCardClass, adminCardInnerClass)}>
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className={adminSectionTitleClass}>
                      Announcement messages
                    </h2>
                    <button
                      type="button"
                      onClick={() =>
                        setValue("announcementMessages", [...announcements, ""], {
                          shouldDirty: true,
                        })
                      }
                      className={adminGhostBtnClass}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {announcements.map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          className={adminFieldClass}
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
                      <p className="text-sm text-zinc-500">
                        No announcement messages
                      </p>
                    ) : null}
                  </div>
                </section>

                <section className={cn(adminCardClass, adminCardInnerClass)}>
                  <h2 className={cn(adminSectionTitleClass, "mb-5")}>Shipping</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={adminLabelClass}>
                        Standard shipping rate (CAD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className={adminFieldClass}
                        {...register("standardShippingRate")}
                      />
                    </div>
                    <div>
                      <label className={adminLabelClass}>
                        Free shipping threshold (CAD)
                      </label>
                      <input
                        type="number"
                        className={adminFieldClass}
                        {...register("shippingThreshold")}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-zinc-300 md:col-span-2">
                      <input
                        type="checkbox"
                        {...register("localDeliveryEnabled")}
                        className="rounded border-white/20 bg-black"
                      />
                      Enable local delivery
                    </label>
                    <div>
                      <label className={adminLabelClass}>
                        Local delivery fee (CAD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        disabled={!localDeliveryEnabled}
                        className={adminFieldClass}
                        {...register("localDeliveryFee")}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={adminLabelClass}>
                        Eligible postal codes / prefixes
                      </label>
                      <textarea
                        rows={3}
                        disabled={!localDeliveryEnabled}
                        className={adminFieldClass}
                        placeholder="M5V, M4W, L5B (comma or line separated)"
                        {...register("localDeliveryPostalCodesText")}
                      />
                    </div>
                  </div>
                </section>

                <section className={cn(adminCardClass, adminCardInnerClass)}>
                  <h2 className={cn(adminSectionTitleClass, "mb-5")}>
                    Commerce & footer
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={adminLabelClass}>Currency</label>
                      <input className={adminFieldClass} {...register("currency")} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={adminLabelClass}>
                        First-order discount text
                      </label>
                      <input
                        className={adminFieldClass}
                        {...register("firstOrderDiscountText")}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={adminLabelClass}>Footer description</label>
                      <textarea
                        rows={3}
                        className={adminFieldClass}
                        {...register("footerDescription")}
                      />
                    </div>
                  </div>
                </section>
              </div>
            ) : null}

            {tab === "seo" ? (
              <section className={cn(adminCardClass, adminCardInnerClass)}>
                <h2 className={cn(adminSectionTitleClass, "mb-5")}>SEO defaults</h2>
                <div className="grid gap-4">
                  <div>
                    <label className={adminLabelClass}>SEO title</label>
                    <input className={adminFieldClass} {...register("seoTitle")} />
                  </div>
                  <div>
                    <label className={adminLabelClass}>SEO description</label>
                    <textarea
                      rows={3}
                      className={adminFieldClass}
                      {...register("seoDescription")}
                    />
                  </div>
                </div>
              </section>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className={adminPrimaryBtnClass}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save all changes
              </button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}
