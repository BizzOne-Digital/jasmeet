import mongoose, { Schema, Document, Model } from "mongoose";
import {
  ORDER_STATUSES,
  SHIPPING_METHODS,
  type OrderStatus,
  type ShippingMethod,
} from "@/lib/order-status";

export interface IOrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  isPreOrder?: boolean;
  preOrderLeadTime?: string;
}

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingMethod: ShippingMethod;
  shippingAddress: IShippingAddress;
  paymentStatus: "pending" | "paid" | "failed" | "test";
  paymentProvider?: string;
  paymentIntentId?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  orderStatus: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
  hasPreOrderItems: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        image: { type: String, default: "" },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        size: { type: String, default: "" },
        color: { type: String, default: "" },
        isPreOrder: { type: Boolean, default: false },
        preOrderLeadTime: { type: String, default: "" },
      },
    ],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shippingMethod: {
      type: String,
      enum: SHIPPING_METHODS,
      default: "standard",
    },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "Canada" },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "test"],
      default: "pending",
    },
    paymentProvider: { type: String },
    paymentIntentId: { type: String },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: "order_received",
    },
    courierName: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    hasPreOrderItems: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ hasPreOrderItems: 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
