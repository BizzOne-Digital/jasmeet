import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";
import { ORDER_STATUSES, EMAIL_ON_STATUS } from "@/lib/order-status";
import { sendOrderStatusEmail } from "@/lib/email/order-emails";
import { getSiteSettings } from "@/lib/data/settings";
import { z } from "zod";

const updateSchema = z.object({
  orderStatus: z.enum(ORDER_STATUSES).optional(),
  courierName: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "test"]).optional(),
});

type Params = Promise<{ id: string }>;

export async function GET(
  _request: Request,
  { params }: { params: Params }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();
    const order = await Order.findById(id).lean();
    if (!order) return jsonError("Order not found", 404);
    return jsonSuccess(order);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Params }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = updateSchema.parse(await request.json());
    await connectDB();

    const order = await Order.findById(id);
    if (!order) return jsonError("Order not found", 404);

    const prevStatus = order.orderStatus;

    if (body.orderStatus) order.orderStatus = body.orderStatus;
    if (body.courierName !== undefined) order.courierName = body.courierName;
    if (body.trackingNumber !== undefined)
      order.trackingNumber = body.trackingNumber;
    if (body.notes !== undefined) order.notes = body.notes;
    if (body.paymentStatus) order.paymentStatus = body.paymentStatus;

    if (order.orderStatus === "shipped" && order.shippingMethod === "standard") {
      if (!order.courierName?.trim() || !order.trackingNumber?.trim()) {
        return jsonError(
          "Courier name and tracking number are required when marking courier orders as Shipped.",
          400
        );
      }
    }

    await order.save();

    const statusChanged =
      body.orderStatus && body.orderStatus !== prevStatus;
    if (
      statusChanged &&
      EMAIL_ON_STATUS.includes(order.orderStatus)
    ) {
      try {
        const settings = await getSiteSettings();
        await sendOrderStatusEmail({
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
          currency: settings.currency,
          customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim(),
          customerEmail: order.shippingAddress.email,
          courierName: order.courierName,
          trackingNumber: order.trackingNumber,
          hasPreOrderItems: order.hasPreOrderItems,
        });
      } catch (emailError) {
        console.error("[order status email]", emailError);
      }
    }

    return jsonSuccess(order);
  } catch (error) {
    return handleRouteError(error);
  }
}
