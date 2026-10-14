import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPage extends Document {
  title: string;
  slug: string;
  description: string;
  status: "draft" | "published";
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

const Page: Model<IPage> =
  mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);

export default Page;
