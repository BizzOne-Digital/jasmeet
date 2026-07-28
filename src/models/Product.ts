import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProductColor {
  name: string;
  hex: string;
}

export interface IProductSize {
  size: string;
  stock: number;
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
  materials: string;
  careInstructions: string;
  fitDetails: string;
  hiddenMessage: string;
  highlights: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
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
    }],
    sizes: [{
      size: { type: String, required: true },
      stock: { type: Number, default: 0, min: 0 },
    }],
    materials: { type: String, default: "" },
    careInstructions: { type: String, default: "" },
    fitDetails: { type: String, default: "" },
    hiddenMessage: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    order: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

ProductSchema.index({ slug: 1 });
ProductSchema.index({ status: 1, isFeatured: 1 });
ProductSchema.index({ collection: 1, status: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
