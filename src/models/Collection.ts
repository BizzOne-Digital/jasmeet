import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICollection extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  imageAlt: string;
  order: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    imageAlt: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

CollectionSchema.index({ slug: 1 });
CollectionSchema.index({ isActive: 1, order: 1 });

const Collection: Model<ICollection> =
  mongoose.models.Collection || mongoose.model<ICollection>("Collection", CollectionSchema);

export default Collection;
