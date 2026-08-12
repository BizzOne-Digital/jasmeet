import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { orderSchema } from "@/lib/validations/api";
import { generateOrderNumber, isPaymentProviderConfigured } from "@/lib/orders";
import { getSiteSettings } from "@/lib/data/settings";
import { calculateShipping } from "@/lib/shipping";
import {
  decrementPurchasableInventory,
  isVariantPurchasable,
} from "@/lib/inventory";
import { sendOrderStatusEmail, sendAdminNewOrderEmail } from "@/lib/email/order-emails";
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

      // Prefer server price
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

      const ok = decrementPurchasableInventory(
        product,
        item.color,
        item.size,
        item.quantity
      );
      if (!ok) {
        return jsonError(
          `Insufficient stock for ${product.name} (${item.color} / ${item.size}).`,
          400
        );
      }
      await product.save();

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
    const paymentConfigured = isPaymentProviderConfigured();

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

    try {
      const emailPayload = {
        orderNumber: order.orderNumber,
        orderStatus: "order_received" as const,
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
        customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
        customerEmail: shippingAddress.email,
        hasPreOrderItems: order.hasPreOrderItems,
        shippingAddress: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          province: shippingAddress.province,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        notes: notes || "",
      };

      await sendOrderStatusEmail(emailPayload);

      const adminInbox =
        process.env.ADMIN_ORDER_EMAIL ||
        settings.contactEmail ||
        process.env.ADMIN_EMAIL ||
        "";
      await sendAdminNewOrderEmail(emailPayload, adminInbox);
    } catch (emailError) {
      console.error("[order emails]", emailError);
    }

    return jsonSuccess(order, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
