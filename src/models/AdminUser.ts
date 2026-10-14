import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdminUser extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true, default: "Admin" },
  },
  { timestamps: true }
);

const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser || mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);

export default AdminUser;
