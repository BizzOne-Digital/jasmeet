import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { sendOrderStatusEmail, sendAdminNewOrderEmail } from "@/lib/email/order-emails";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, orderId } = await request.json();

    if (!sessionId || !orderId) {
      return NextResponse.json(
        { success: false, error: "Missing session ID or order ID" },
        { status: 400 }
      );
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Update order in database
    await connectDB();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order with payment info
    order.paymentStatus = "paid";
    order.paymentProvider = "stripe";
    order.stripeSessionId = sessionId;
    order.stripePaymentIntentId = typeof session.payment_intent === "string" 
      ? session.payment_intent 
      : session.payment_intent?.id || undefined;
    await order.save();

    // Send confirmation emails
    try {
      const emailPayload = {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        shippingMethod: order.shippingMethod,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.price,
          isPreOrder: item.isPreOrder,
          preOrderLeadTime: item.preOrderLeadTime,
        })),
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        currency: "CAD",
        customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        customerEmail: order.shippingAddress.email,
        hasPreOrderItems: order.hasPreOrderItems,
        shippingAddress: order.shippingAddress,
        notes: order.notes,
      };

      await sendOrderStatusEmail(emailPayload);
      
      const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
      if (adminEmail) {
        await sendAdminNewOrderEmail(emailPayload, adminEmail);
      }
    } catch (emailError) {
      console.error("Failed to send emails:", emailError);
      // Don't fail the request if emails fail
    }

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
