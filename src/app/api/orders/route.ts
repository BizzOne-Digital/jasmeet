import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import SiteSettings from "@/models/SiteSettings";
import { orderSchema } from "@/lib/validations/api";
import { generateOrderNumber, isPaymentProviderConfigured } from "@/lib/orders";
import { jsonSuccess, handleRouteError } from "@/lib/api-response";

const SHIPPING_FLAT_RATE = 12;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shippingAddress, notes } = orderSchema.parse(body);

    await connectDB();

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const settings = await SiteSettings.findOne().lean();
    const shippingThreshold = settings?.shippingThreshold ?? 100;
    const shipping = subtotal >= shippingThreshold ? 0 : SHIPPING_FLAT_RATE;
    const tax = 0;
    const total = subtotal + shipping + tax;

    const orderNumber = await generateOrderNumber();
    const paymentConfigured = isPaymentProviderConfigured();

    const order = await Order.create({
      orderNumber,
      items,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress,
      paymentStatus: paymentConfigured ? "pending" : "test",
      paymentProvider: paymentConfigured ? "stripe" : undefined,
      orderStatus: "pending",
      notes,
    });

    return jsonSuccess(order, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
