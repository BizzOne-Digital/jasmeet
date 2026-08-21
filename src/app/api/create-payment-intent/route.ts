import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSiteSettings } from "@/lib/data/settings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, orderId, customerEmail, items, shippingAddress } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const settings = await getSiteSettings();
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'cad',
          product_data: {
            name: item.name,
            images: [item.image.startsWith('http') ? item.image : `${origin}${item.image}`],
            metadata: {
              size: item.size,
              color: item.color,
            }
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
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
