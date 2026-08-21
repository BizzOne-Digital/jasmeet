import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Stripe from "stripe";
import {
  finalizePaidOrder,
  restoreOrderInventory,
  sendStatusChangeEmail,
} from "@/lib/order-fulfillment";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    console.error(
      "Webhook signature verification failed:",
      err instanceof Error ? err.message : String(err)
    );
    return NextResponse.json(
      {
        error: `Webhook Error: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await finalizePaidOrder(orderId, {
            paymentIntentId: paymentIntent.id,
          });
          console.log(`✅ Payment succeeded for order ${orderId}`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            order.paymentStatus = "failed";
            order.paymentIntentId = paymentIntent.id;
            await order.save();
          }
          console.log(`❌ Payment failed for order ${orderId}`);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const intentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;

        if (intentId) {
          const order = await Order.findOne({ paymentIntentId: intentId });
          if (order) {
            const prevStatus = order.orderStatus;
            order.paymentStatus = "refunded";
            order.orderStatus = "refunded";
            await restoreOrderInventory(order);
            await order.save();

            if (prevStatus !== "refunded") {
              try {
                await sendStatusChangeEmail(order);
              } catch (emailError) {
                console.error("[refund email]", emailError);
              }
            }
          }
          console.log(`💰 Refund processed for payment intent ${intentId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
