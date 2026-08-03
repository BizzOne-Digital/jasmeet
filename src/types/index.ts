export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  colorHex?: string;
}

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
}

export interface ProductFilters {
  search?: string;
  collection?: string;
  category?: string;
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  onSale?: boolean;
  status?: "draft" | "published" | "all";
  sort?: "newest" | "price-asc" | "price-desc" | "name";
  page?: number;
  limit?: number;
}

export interface SiteSettingsData {
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
  shippingThreshold: number;
  standardShippingRate: number;
  localDeliveryEnabled: boolean;
  localDeliveryFee: number;
  localDeliveryPostalCodes: string[];
  firstOrderDiscountText: string;
  footerDescription: string;
  seoTitle: string;
  seoDescription: string;
  currency: string;
}

export interface PageSectionData {
  _id: string;
  sectionKey: string;
  internalName: string;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  backgroundImage?: string;
  sideImage?: string;
  mobileImage?: string;
  imageAlt?: string;
  backgroundColor?: string;
  theme?: "dark" | "light" | "beige";
  alignment?: "left" | "center" | "right";
  isVisible: boolean;
  order: number;
  status: "draft" | "published";
}
