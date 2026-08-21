import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { finalizePaidOrder } from "@/lib/order-fulfillment";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, orderId } = await request.json();

    if (!sessionId || !orderId) {
      return NextResponse.json(
        { success: false, error: "Missing session ID or order ID" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, error: "Payment not completed" },
        { status: 400 }
      );
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    const { order } = await finalizePaidOrder(orderId, {
      sessionId,
      paymentIntentId,
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      message: "Payment verified and order confirmed",
    });
  } catch (error: unknown) {
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Verification failed",
      },
      { status: 500 }
    );
  }
}
