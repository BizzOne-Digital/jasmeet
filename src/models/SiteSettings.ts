import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteSettings extends Document {
  businessName: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  phone: string;
  address: string;
  website: string;
  businessHours: string;
  supportHours: string;
  responseTime: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  announcementMessages: string[];
  /** Free standard shipping when subtotal >= this (CAD). */
  shippingThreshold: number;
  /** Flat Canada standard shipping rate when under threshold. */
  standardShippingRate: number;
  /** Enable personal/local delivery for matching postal codes. */
  localDeliveryEnabled: boolean;
  localDeliveryFee: number;
  /** Comma-separated or array of eligible postal codes / prefixes (e.g. M5V, L6A1B2). */
  localDeliveryPostalCodes: string[];
  firstOrderDiscountText: string;
  footerDescription: string;
  seoTitle: string;
  seoDescription: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    businessName: { type: String, default: "DAYAURA" },
    logo: { type: String, default: "/images/logo.png" },
    favicon: { type: String, default: "/images/logo.png" },
    contactEmail: { type: String, default: "dayauraofficial@gmail.com" },
    phone: { type: String, default: "" },
    address: { type: String, default: "Ontario, Canada" },
    website: { type: String, default: "www.dayaura.com" },
    businessHours: { type: String, default: "Monday–Friday, 9:00 AM–6:00 PM EST" },
    supportHours: { type: String, default: "Online store available 24/7" },
    responseTime: { type: String, default: "Typically within 24 hours" },
    instagramUrl: { type: String, default: "https://instagram.com/dayauraofficial" },
    tiktokUrl: { type: String, default: "https://tiktok.com/@dayauraofficial" },
    facebookUrl: { type: String, default: "https://facebook.com/DAYAURA" },
    announcementMessages: {
      type: [String],
      default: [
        "10% OFF your first order when you join our email list",
        "Free shipping on orders over CAD $99",
      ],
    },
    shippingThreshold: { type: Number, default: 99 },
    standardShippingRate: { type: Number, default: 9.99 },
    localDeliveryEnabled: { type: Boolean, default: false },
    localDeliveryFee: { type: Number, default: 0 },
    localDeliveryPostalCodes: { type: [String], default: [] },
    firstOrderDiscountText: {
      type: String,
      default: "10% OFF your first order when you join our email list",
    },
    footerDescription: {
      type: String,
      default:
        "DAYAURA is a premium activewear brand designed to inspire confidence through movement.",
    },
    seoTitle: { type: String, default: "DAYAURA | Wear Your Aura. Move with Confidence." },
    seoDescription: {
      type: String,
      default:
        "Premium women's activewear combining style, comfort, and performance. Shop collections designed for gym, yoga, and everyday movement.",
    },
    currency: { type: String, default: "CAD" },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
