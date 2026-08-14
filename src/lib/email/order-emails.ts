import { sendEmail } from "@/lib/email";
import {
  generateCustomerOrderEmail,
  generateAdminOrderEmail,
} from "@/lib/email-templates";

interface OrderEmailPayload {
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

// Send order confirmation email to customer
export async function sendOrderStatusEmail(order: OrderEmailPayload) {
  try {
    const orderDetails = {
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
        image: "", // Can add image URL if available
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: 0, // Add tax if calculated
      total: order.total,
      currency: order.currency || "CAD",
    };

    const subject = `Order Confirmation - ${order.orderNumber}`;
    const html = generateCustomerOrderEmail(orderDetails);

    await sendEmail({
      to: order.customerEmail,
      subject,
      html,
    });

    console.log(`✅ Customer order email sent to: ${order.customerEmail}`);
  } catch (error: unknown) {
    console.error("❌ Failed to send customer order email:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Send new order notification to admin
export async function sendAdminNewOrderEmail(
  order: OrderEmailPayload,
  adminEmail: string
) {
  try {
    if (!adminEmail) {
      console.warn("⚠️ Admin email not configured, skipping admin notification");
      return;
    }

    const orderDetails = {
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
        image: "", // Can add image URL if available
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: 0, // Add tax if calculated
      total: order.total,
      currency: order.currency || "CAD",
    };

    const subject = `🛍️ New Order Received - ${order.orderNumber}`;
    const html = generateAdminOrderEmail(orderDetails);

    await sendEmail({
      to: adminEmail,
      subject,
      html,
    });

    console.log(`✅ Admin order email sent to: ${adminEmail}`);
  } catch (error: unknown) {
    console.error("❌ Failed to send admin order email:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Send shipping confirmation email
export async function sendShippingConfirmationEmail(
  order: OrderEmailPayload & { trackingNumber: string }
) {
  try {
    const subject = `Your Order Has Shipped - ${order.orderNumber}`;
    const html = `
      <h2>Your Order Has Shipped!</h2>
      <p>Hi ${order.customerName},</p>
      <p>Good news! Your order ${order.orderNumber} has been shipped.</p>
      <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
      <p>You can track your package using the tracking number above.</p>
    `;

    await sendEmail({
      to: order.customerEmail,
      subject,
      html,
    });

    console.log(`✅ Shipping confirmation sent to: ${order.customerEmail}`);
  } catch (error: unknown) {
    console.error("❌ Failed to send shipping confirmation:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}
