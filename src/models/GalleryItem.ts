import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IGalleryItem extends Omit<Document, "collection"> {
  image: string;
  caption: string;
  altText: string;
  collection?: Types.ObjectId;
  category?: Types.ObjectId;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    image: { type: String, required: true },
    caption: { type: String, default: "" },
    altText: { type: String, default: "" },
    collection: { type: Schema.Types.ObjectId, ref: "Collection" },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const GalleryItem: Model<IGalleryItem> =
  mongoose.models.GalleryItem || mongoose.model<IGalleryItem>("GalleryItem", GalleryItemSchema);

export default GalleryItem;
