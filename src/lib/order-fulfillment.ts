import { connectDB } from "@/lib/mongodb";
import Order, { type IOrder } from "@/models/Order";
import Product from "@/models/Product";
import {
  decrementPurchasableInventory,
  restoreInventory,
} from "@/lib/inventory";
import {
  sendOrderStatusEmail,
  sendAdminNewOrderEmail,
} from "@/lib/email/order-emails";
import { getSiteSettings } from "@/lib/data/settings";
import type { OrderEmailPayload } from "@/lib/email/order-emails";

export const INVENTORY_DECREMENTED_TAG = "[inventory-decremented]";
export const INVENTORY_RESTORED_TAG = "[inventory-restored]";

export function hasInventoryDecremented(order: Pick<IOrder, "notes">): boolean {
  return Boolean(order.notes?.includes(INVENTORY_DECREMENTED_TAG));
}

export function hasInventoryRestored(order: Pick<IOrder, "notes">): boolean {
  return Boolean(order.notes?.includes(INVENTORY_RESTORED_TAG));
}

export function buildOrderEmailPayload(
  order: IOrder,
  currency = "CAD"
): OrderEmailPayload {
  return {
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    shippingMethod: order.shippingMethod,
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      size: i.size,
      color: i.color,
      price: i.price,
      isPreOrder: i.isPreOrder,
      preOrderLeadTime: i.preOrderLeadTime,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    currency,
    customerName:
      `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim(),
    customerEmail: order.shippingAddress.email,
    hasPreOrderItems: order.hasPreOrderItems,
    shippingAddress: order.shippingAddress,
    notes: order.notes,
    courierName: order.courierName,
    trackingNumber: order.trackingNumber,
  };
}

export async function decrementOrderInventory(order: IOrder): Promise<boolean> {
  if (hasInventoryDecremented(order)) return true;

  await connectDB();
  for (const item of order.items) {
    if (item.isPreOrder) continue;
    const product = await Product.findById(item.productId);
    if (!product) continue;
    const ok = decrementPurchasableInventory(
      product,
      item.color,
      item.size,
      item.quantity
    );
    if (!ok) return false;
    await product.save();
  }

  order.notes = order.notes?.includes(INVENTORY_DECREMENTED_TAG)
    ? order.notes
    : `${order.notes ? `${order.notes}\n` : ""}${INVENTORY_DECREMENTED_TAG}`;
  return true;
}

export async function restoreOrderInventory(order: IOrder): Promise<void> {
  if (hasInventoryRestored(order) || !hasInventoryDecremented(order)) return;

  await connectDB();
  for (const item of order.items) {
    if (item.isPreOrder) continue;
    const product = await Product.findById(item.productId);
    if (!product) continue;
    restoreInventory(product, item.color, item.size, item.quantity);
    await product.save();
  }

  order.notes = order.notes?.includes(INVENTORY_RESTORED_TAG)
    ? order.notes
    : `${order.notes ? `${order.notes}\n` : ""}${INVENTORY_RESTORED_TAG}`;
}

export async function finalizePaidOrder(
  orderId: string,
  stripeData?: { sessionId?: string; paymentIntentId?: string }
): Promise<{ order: IOrder; alreadyFinalized: boolean }> {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  if (order.paymentStatus === "paid") {
    return { order, alreadyFinalized: true };
  }

  const ok = await decrementOrderInventory(order);
  if (!ok) {
    throw new Error("Insufficient stock to complete order");
  }

  order.paymentStatus = "paid";
  order.paymentProvider = "stripe";
  order.orderStatus = "processing";
  if (stripeData?.sessionId) order.stripeSessionId = stripeData.sessionId;
  if (stripeData?.paymentIntentId) {
    order.stripePaymentIntentId = stripeData.paymentIntentId;
    order.paymentIntentId = stripeData.paymentIntentId;
  }
  await order.save();

  const settings = await getSiteSettings();
  const payload = buildOrderEmailPayload(order, settings.currency);

  try {
    await sendOrderStatusEmail({
      ...payload,
      orderStatus: "order_received",
    });
    await sendOrderStatusEmail({
      ...payload,
      orderStatus: "processing",
    });

    const adminInbox =
      process.env.ADMIN_ORDER_EMAIL ||
      settings.contactEmail ||
      process.env.ADMIN_EMAIL ||
      "";
    if (adminInbox) {
      await sendAdminNewOrderEmail(payload, adminInbox);
    }
  } catch (emailError) {
    console.error("[finalizePaidOrder emails]", emailError);
  }

  return { order, alreadyFinalized: false };
}

export async function sendStatusChangeEmail(order: IOrder): Promise<void> {
  const settings = await getSiteSettings();
  const payload = buildOrderEmailPayload(order, settings.currency);
  await sendOrderStatusEmail(payload);
}
