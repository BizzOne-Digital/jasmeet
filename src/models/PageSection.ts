import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPageSection extends Document {
  page: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const PageSectionSchema = new Schema<IPageSection>(
  {
    page: { type: Schema.Types.ObjectId, ref: "Page", required: true },
    sectionKey: { type: String, required: true },
    internalName: { type: String, required: true },
    eyebrow: { type: String },
    heading: { type: String },
    subheading: { type: String },
    body: { type: String },
    ctaLabel: { type: String },
    ctaUrl: { type: String },
    backgroundImage: { type: String },
    sideImage: { type: String },
    mobileImage: { type: String },
    imageAlt: { type: String },
    backgroundColor: { type: String },
    theme: { type: String, enum: ["dark", "light", "beige"], default: "dark" },
    alignment: { type: String, enum: ["left", "center", "right"], default: "left" },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

PageSectionSchema.index({ page: 1, order: 1 });
PageSectionSchema.index({ page: 1, sectionKey: 1 });

const PageSection: Model<IPageSection> =
  mongoose.models.PageSection || mongoose.model<IPageSection>("PageSection", PageSectionSchema);

export default PageSection;
