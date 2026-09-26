import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-status";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";

/**
 * Public order tracking — requires order number + email match.
 * Returns status + shipping progress only (no full address dump).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = (searchParams.get("orderNumber") || "").trim();
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!orderNumber || !email) {
      return jsonError("Order number and email are required.", 400);
    }

    await connectDB();
    const order = await Order.findOne({
      orderNumber: new RegExp(
        `^${orderNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i"
      ),
    }).lean();

    if (!order) {
      return jsonError("Order not found. Check your order number and try again.", 404);
    }

    const orderEmail = (order.shippingAddress?.email || "").trim().toLowerCase();
    if (orderEmail !== email) {
      return jsonError("Order not found. Check your order number and email.", 404);
    }

    const status = order.orderStatus as OrderStatus;

    return jsonSuccess({
      orderNumber: order.orderNumber,
      orderStatus: status,
      statusLabel: ORDER_STATUS_LABELS[status] || status,
      shippingMethod: order.shippingMethod,
      courierName: order.courierName || "",
      trackingNumber: order.trackingNumber || "",
      hasPreOrderItems: Boolean(order.hasPreOrderItems),
      itemCount: order.items?.length || 0,
      items: (order.items || []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        isPreOrder: item.isPreOrder,
        preOrderLeadTime: item.preOrderLeadTime,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
