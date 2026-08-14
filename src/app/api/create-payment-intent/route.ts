import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSiteSettings } from "@/lib/data/settings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, orderId, customerEmail } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const settings = await getSiteSettings();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "cad",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: orderId || "",
        store: settings.businessName || "DAYAURA",
      },
      receipt_email: customerEmail,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: unknown) {
    console.error("Payment intent creation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
