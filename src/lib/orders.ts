import Order from "@/models/Order";

const ORDER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function isPaymentProviderConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.PAYMENT_PROVIDER
  );
}

function randomOrderSuffix(length = 6): string {
  let suffix = "";
  for (let i = 0; i < length; i++) {
    suffix += ORDER_CHARS.charAt(Math.floor(Math.random() * ORDER_CHARS.length));
  }
  return suffix;
}

export async function generateOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const orderNumber = `DA-${randomOrderSuffix()}`;
    const exists = await Order.exists({ orderNumber });
    if (!exists) return orderNumber;
  }
  throw new Error("Failed to generate unique order number");
}
