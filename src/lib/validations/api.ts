import { z } from "zod";
import mongoose from "mongoose";

export const objectIdSchema = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), "Invalid ID");

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(30).optional(),
  subject: z.string().min(1, "Subject is required").max(200),
  orderNumber: z.string().max(50).optional(),
  message: z.string().min(1, "Message is required").max(5000),
});

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().default(""),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
  size: z.string().default(""),
  color: z.string().default(""),
});

const shippingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("Canada"),
});

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart must contain at least one item"),
  shippingAddress: shippingAddressSchema,
  notes: z.string().max(1000).optional(),
});

const productColorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().default("#000000"),
});

const productSizeSchema = z.object({
  size: z.string().min(1),
  stock: z.number().int().min(0).default(0),
});

export const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  shortDescription: z.string().default(""),
  description: z.string().default(""),
  collection: objectIdSchema,
  category: objectIdSchema,
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  images: z.array(z.string()).default([]),
  hoverImage: z.string().optional(),
  colors: z.array(productColorSchema).default([]),
  sizes: z.array(productSizeSchema).default([]),
  materials: z.string().default(""),
  careInstructions: z.string().default(""),
  fitDetails: z.string().default(""),
  hiddenMessage: z.string().default(""),
  highlights: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
  order: z.number().int().default(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const collectionCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1).optional(),
  description: z.string().default(""),
  image: z.string().default(""),
  imageAlt: z.string().default(""),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const collectionUpdateSchema = collectionCreateSchema.partial();

export const faqCreateSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().default("General"),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const faqUpdateSchema = faqCreateSchema.partial();

export const galleryCreateSchema = z.object({
  image: z.string().min(1, "Image is required"),
  caption: z.string().default(""),
  altText: z.string().default(""),
  collection: objectIdSchema.optional(),
  category: objectIdSchema.optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const galleryUpdateSchema = galleryCreateSchema.partial();

export const pageSectionCreateSchema = z.object({
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
  theme: z.enum(["dark", "light", "beige"]).default("dark"),
  alignment: z.enum(["left", "center", "right"]).default("left"),
  isVisible: z.boolean().default(true),
  order: z.number().int().default(0),
  status: z.enum(["draft", "published"]).default("published"),
});

export const pageSectionUpdateSchema = pageSectionCreateSchema.partial();

export const siteSettingsUpdateSchema = z.object({
  businessName: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  contactEmail: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  businessHours: z.string().optional(),
  supportHours: z.string().optional(),
  responseTime: z.string().optional(),
  instagramUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  announcementMessages: z.array(z.string()).optional(),
  shippingThreshold: z.number().min(0).optional(),
  firstOrderDiscountText: z.string().optional(),
  footerDescription: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  currency: z.string().optional(),
});
