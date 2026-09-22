"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function CheckoutSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId || !orderId) {
      setStatus("error");
      setMessage("Invalid session or order ID");
      return;
    }

    async function verifyPayment() {
      try {
        const res = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, orderId }),
        });

        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Payment verification failed");
        }

        setOrderNumber(data.orderNumber || orderId);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Failed to verify payment");
      }
    }

    verifyPayment();
  }, [sessionId, orderId]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold border-r-transparent"></div>
        <p className="mt-4 text-sm text-muted">Verifying your payment...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-red-400">
          Error
        </p>
        <h1 className="mt-4 font-heading text-4xl">Something went wrong</h1>
        <p className="mt-4 text-sm text-muted">{message}</p>
        <div className="mt-8">
          <Button onClick={() => router.push("/checkout")}>
            Back to checkout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
        Order received
      </p>
      <h1 className="mt-4 font-heading text-4xl">Thank you</h1>
      <p className="mt-4 text-sm text-muted">
        Your order{" "}
        <strong className="text-beige">{orderNumber}</strong>{" "}
        has been confirmed. A confirmation email is on its way.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button onClick={() => router.push("/shop")}>Continue shopping</Button>
        {orderNumber && (
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                `/track-order?orderNumber=${encodeURIComponent(orderNumber)}`
              )
            }
          >
            Track order
          </Button>
        )}
      </div>
    </div>
  );
}
