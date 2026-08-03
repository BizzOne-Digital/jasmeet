import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProductColor {
  name: string;
  hex: string;
  images?: string[];
}

export interface IProductSize {
  size: string;
  stock: number;
}

export interface IProductInventoryRow {
  colorName: string;
  size: string;
  stock: number;
}

export interface IProductSizeGuide {
  unit: string;
  columns?: string[];
  rows?: Array<{
    size: string;
    values: string[];
  }>;
  sections?: Array<{
    title?: string;
    columns: string[];
    rows: Array<{
      size: string;
      values: string[];
    }>;
  }>;
}

export interface IProductFeatureTab {
  id: string;
  title: string;
  image: string;
}

export interface IProduct extends Omit<Document, "collection"> {
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  collection: Types.ObjectId;
  category: Types.ObjectId;
  price: number;
  compareAtPrice?: number;
  images: string[];
  hoverImage?: string;
  colors: IProductColor[];
  sizes: IProductSize[];
  /** Per colour × size stock matrix (preferred). Falls back to sizes[].stock when empty. */
  inventory: IProductInventoryRow[];
  materials: string;
  careInstructions: string;
  fitDetails: string;
  hiddenMessage: string;
  highlights: string[];
  modelInfo?: string;
  sizeGuide?: IProductSizeGuide;
  /** Extra accordion tabs that show a feature image (e.g. duffle bag diagrams) */
  featureTabs?: IProductFeatureTab[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  isBestSeller: boolean;
  isComingSoon: boolean;
  /** When true, OOS variants can still be purchased as pre-order. */
  allowPreOrder: boolean;
  /** Shown on PDP + confirmation email, e.g. "Ships in 2–3 weeks". */
  preOrderLeadTime: string;
  status: "draft" | "published";
  order: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    collection: { type: Schema.Types.ObjectId, ref: "Collection", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    hoverImage: { type: String },
    colors: [{
      name: { type: String, required: true },
      hex: { type: String, default: "#000000" },
      images: { type: [String], default: undefined },
    }],
    sizes: [{
      size: { type: String, required: true },
      stock: { type: Number, default: 0, min: 0 },
    }],
    inventory: [
      {
        colorName: { type: String, required: true },
        size: { type: String, required: true },
        stock: { type: Number, default: 0, min: 0 },
      },
    ],
    materials: { type: String, default: "" },
    careInstructions: { type: String, default: "" },
    fitDetails: { type: String, default: "" },
    hiddenMessage: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    modelInfo: { type: String, default: "" },
    sizeGuide: {
      unit: { type: String, default: "CM" },
      columns: { type: [String], default: undefined },
      rows: [
        {
          size: { type: String },
          values: { type: [String], default: [] },
        },
      ],
      sections: [
        {
          title: { type: String },
          columns: { type: [String], default: [] },
          rows: [
            {
              size: { type: String },
              values: { type: [String], default: [] },
            },
          ],
        },
      ],
    },
    featureTabs: [
      {
        id: { type: String },
        title: { type: String },
        image: { type: String },
      },
    ],
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isComingSoon: { type: Boolean, default: false },
    allowPreOrder: { type: Boolean, default: false },
    preOrderLeadTime: {
      type: String,
      default: "Pre-Order – Ships in 2–3 weeks",
    },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    order: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

ProductSchema.index({ status: 1, isFeatured: 1 });
ProductSchema.index({ collection: 1, status: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
