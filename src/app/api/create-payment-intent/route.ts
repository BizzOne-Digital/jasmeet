import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import type Stripe from "stripe";
import { getSiteSettings } from "@/lib/data/settings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerEmail, shippingAddress } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.paymentStatus !== "pending") {
      return NextResponse.json(
        { error: "Order is not awaiting payment" },
        { status: 400 }
      );
    }
    if (order.total <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const settings = await getSiteSettings();
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const productLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      order.items.map((item) => {
        const image = item.image || "";
        const imageUrl = image.startsWith("http") ? image : `${origin}${image}`;
        return {
          price_data: {
            currency: "cad",
            product_data: {
              name: item.name,
              images: imageUrl ? [imageUrl] : undefined,
              metadata: {
                size: item.size ?? "",
                color: item.color ?? "",
              },
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        };
      });

    const lineItems = [...productLineItems];
    if (order.shipping > 0) {
      const shippingLabel =
        order.shippingMethod === "local"
          ? "Local delivery"
          : "Standard shipping (Canada)";
      lineItems.push({
        price_data: {
          currency: "cad",
          product_data: { name: shippingLabel },
          unit_amount: Math.round(order.shipping * 100),
        },
        quantity: 1,
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        orderId: orderId || "",
        store: settings.businessName || "DAYAURA",
        shippingAddress: JSON.stringify(shippingAddress),
      },
      payment_intent_data: {
        metadata: {
          orderId: orderId || "",
        },
      },
      shipping_address_collection: {
        allowed_countries: ['CA'],
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error("Stripe session creation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
