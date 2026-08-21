import { sendEmail } from "@/lib/email";
import {
  generateAdminOrderEmail,
  generateOrderStatusEmail,
} from "@/lib/email-templates";
import {
  type OrderStatus,
} from "@/lib/order-status";

export interface OrderEmailPayload {
  orderNumber: string;
  orderStatus: string;
  shippingMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    isPreOrder?: boolean;
    preOrderLeadTime?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  hasPreOrderItems?: boolean;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  trackingNumber?: string;
  courierName?: string;
}

const STATUS_SUBJECTS: Record<OrderStatus, string> = {
  order_received: "Order Confirmation",
  processing: "Your Order Is Being Processed",
  packed: "Your Order Has Been Packed",
  shipped: "Your Order Has Shipped",
  out_for_local_delivery: "Your Order Is Out for Local Delivery",
  delivered: "Your Order Has Been Delivered",
  cancelled: "Your Order Has Been Cancelled",
  refunded: "Your Order Has Been Refunded",
};

function buildOrderDetails(order: OrderEmailPayload) {
  return {
    orderNumber: order.orderNumber,
    orderDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    shippingAddress: order.shippingAddress,
    items: order.items.map((item) => ({
      name: item.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price,
      isPreOrder: item.isPreOrder,
      preOrderLeadTime: item.preOrderLeadTime,
      image: "",
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: 0,
    total: order.total,
    currency: order.currency || "CAD",
    orderStatus: order.orderStatus as OrderStatus,
    shippingMethod: order.shippingMethod,
    hasPreOrderItems: order.hasPreOrderItems,
    courierName: order.courierName,
    trackingNumber: order.trackingNumber,
  };
}

export async function sendOrderStatusEmail(order: OrderEmailPayload) {
  try {
    const status = order.orderStatus as OrderStatus;
    const orderDetails = buildOrderDetails(order);
    const subject = `${STATUS_SUBJECTS[status] || "Order Update"} - ${order.orderNumber}`;
    const html = generateOrderStatusEmail(orderDetails);

    await sendEmail({
      to: order.customerEmail,
      subject,
      html,
    });

    console.log(
      `✅ Customer ${status} email sent to: ${order.customerEmail}`
    );
  } catch (error: unknown) {
    console.error(
      "❌ Failed to send customer order email:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

export async function sendAdminNewOrderEmail(
  order: OrderEmailPayload,
  adminEmail: string
) {
  try {
    if (!adminEmail) {
      console.warn("⚠️ Admin email not configured, skipping admin notification");
      return;
    }

    const orderDetails = buildOrderDetails(order);
    const subject = `🛍️ New Order Received - ${order.orderNumber}`;
    const html = generateAdminOrderEmail(orderDetails);

    await sendEmail({
      to: adminEmail,
      subject,
      html,
    });

    console.log(`✅ Admin order email sent to: ${adminEmail}`);
  } catch (error: unknown) {
    console.error(
      "❌ Failed to send admin order email:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

/** @deprecated Use sendOrderStatusEmail with orderStatus shipped */
export async function sendShippingConfirmationEmail(
  order: OrderEmailPayload & { trackingNumber: string }
) {
  await sendOrderStatusEmail({ ...order, orderStatus: "shipped" });
}
