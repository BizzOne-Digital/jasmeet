import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { orderSchema } from "@/lib/validations/api";
import { generateOrderNumber, isPaymentProviderConfigured } from "@/lib/orders";
import { getSiteSettings } from "@/lib/data/settings";
import { calculateShipping } from "@/lib/shipping";
import {
  isVariantPurchasable,
} from "@/lib/inventory";
import {
  sendOrderStatusEmail,
  sendAdminNewOrderEmail,
} from "@/lib/email/order-emails";
import {
  buildOrderEmailPayload,
  decrementOrderInventory,
} from "@/lib/order-fulfillment";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const preOrder = searchParams.get("preOrder");
    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.orderStatus = status;
    if (preOrder === "true") query.hasPreOrderItems = true;

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(200).lean();
    return jsonSuccess({ orders });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shippingAddress, notes, shippingMethod } =
      orderSchema.parse(body);

    await connectDB();
    const settings = await getSiteSettings();
    const paymentConfigured = isPaymentProviderConfigured();

    const lineItems = [];
    let hasPreOrderItems = false;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.status !== "published") {
        return jsonError(`Product unavailable: ${item.name}`, 400);
      }
      if (product.isComingSoon) {
        return jsonError(
          `${product.name} is coming soon and cannot be purchased yet.`,
          400
        );
      }

      const price = product.price;
      const check = isVariantPurchasable(
        product,
        item.color,
        item.size,
        item.quantity
      );
      if (!check.ok) {
        return jsonError(
          `${product.name} (${item.color} / ${item.size}) is sold out.`,
          400
        );
      }

      if (check.isPreOrder) {
        hasPreOrderItems = true;
      }

      lineItems.push({
        productId: String(product._id),
        name: product.name,
        slug: product.slug,
        image: item.image || product.images?.[0] || "",
        price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        isPreOrder: check.isPreOrder,
        preOrderLeadTime: check.isPreOrder
          ? product.preOrderLeadTime || "Pre-Order – Ships in 2–3 weeks"
          : "",
      });
    }

    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const shippingCalc = calculateShipping({
      subtotal,
      method: shippingMethod || "standard",
      shippingThreshold: settings.shippingThreshold,
      standardShippingRate: settings.standardShippingRate,
      localDeliveryFee: settings.localDeliveryFee,
      localDeliveryEnabled: settings.localDeliveryEnabled,
      localDeliveryPostalCodes: settings.localDeliveryPostalCodes,
      postalCode: shippingAddress.postalCode,
    });

    if (shippingCalc.error) {
      return jsonError(shippingCalc.error, 400);
    }

    const tax = 0;
    const total = subtotal + shippingCalc.shipping + tax;
    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      items: lineItems,
      subtotal,
      shipping: shippingCalc.shipping,
      tax,
      total,
      shippingMethod: shippingCalc.method,
      shippingAddress,
      paymentStatus: paymentConfigured ? "pending" : "test",
      paymentProvider: paymentConfigured ? "stripe" : undefined,
      orderStatus: "order_received",
      hasPreOrderItems,
      notes,
    });

    if (!paymentConfigured) {
      const ok = await decrementOrderInventory(order);
      if (!ok) {
        await Order.findByIdAndDelete(order._id);
        return jsonError(
          "Insufficient stock to complete order. Please try again.",
          400
        );
      }
      await order.save();

      try {
        const payload = buildOrderEmailPayload(order, settings.currency);
        await sendOrderStatusEmail({
          ...payload,
          orderStatus: "order_received",
        });

        const adminInbox =
          process.env.ADMIN_ORDER_EMAIL ||
          settings.contactEmail ||
          process.env.ADMIN_EMAIL ||
          "";
        await sendAdminNewOrderEmail(payload, adminInbox);
      } catch (emailError) {
        console.error("[order emails]", emailError);
      }
    }

    return jsonSuccess(order, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
