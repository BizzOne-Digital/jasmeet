import { connectDB } from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import type { SiteSettingsData } from "@/types";

const defaultSettings: SiteSettingsData = {
  businessName: "DAYAURA",
  logo: "/images/logo.png",
  favicon: "/images/logo.png",
  contactEmail: "dayauraofficial@gmail.com",
  phone: "4377727498",
  address: "Ontario, Canada",
  website: "www.dayaura.com",
  businessHours: "Monday–Friday, 9:00 AM–6:00 PM EST",
  supportHours: "Online store available 24/7",
  responseTime: "Typically within 24 hours",
  instagramUrl: "https://instagram.com/dayauraofficial",
  tiktokUrl: "https://tiktok.com/@dayauraofficial",
  facebookUrl: "https://facebook.com/DAYAURA",
  announcementMessages: [
    "10% OFF your first order when you join our email list",
    "Free shipping on orders over CAD $100",
  ],
  shippingThreshold: 100,
  firstOrderDiscountText: "10% OFF your first order when you join our email list",
  footerDescription:
    "DAYAURA is a premium activewear brand designed to inspire confidence through movement.",
  seoTitle: "DAYAURA | Wear Your Aura. Move with Confidence.",
  seoDescription:
    "Premium women's activewear combining style, comfort, and performance.",
  currency: "CAD",
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    await connectDB();
    const settings = await SiteSettings.findOne().lean();
    if (!settings) return defaultSettings;
    return {
      businessName: settings.businessName || defaultSettings.businessName,
      logo: settings.logo || defaultSettings.logo,
      favicon: settings.favicon || defaultSettings.favicon,
      contactEmail: settings.contactEmail || defaultSettings.contactEmail,
      phone: settings.phone || defaultSettings.phone,
      address: settings.address || defaultSettings.address,
      website: settings.website || defaultSettings.website,
      businessHours: settings.businessHours || defaultSettings.businessHours,
      supportHours: settings.supportHours || defaultSettings.supportHours,
      responseTime: settings.responseTime || defaultSettings.responseTime,
      instagramUrl: settings.instagramUrl || defaultSettings.instagramUrl,
      tiktokUrl: settings.tiktokUrl || defaultSettings.tiktokUrl,
      facebookUrl: settings.facebookUrl || defaultSettings.facebookUrl,
      announcementMessages: settings.announcementMessages?.length
        ? settings.announcementMessages
        : defaultSettings.announcementMessages,
      shippingThreshold: settings.shippingThreshold ?? defaultSettings.shippingThreshold,
      firstOrderDiscountText:
        settings.firstOrderDiscountText || defaultSettings.firstOrderDiscountText,
      footerDescription: settings.footerDescription || defaultSettings.footerDescription,
      seoTitle: settings.seoTitle || defaultSettings.seoTitle,
      seoDescription: settings.seoDescription || defaultSettings.seoDescription,
      currency: settings.currency || defaultSettings.currency,
    };
  } catch {
    return defaultSettings;
  }
}
