import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/** Lazy Stripe client — avoids throwing during `next build` when env is unset. */
export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
    }
    stripeClient = new Stripe(key, { typescript: true });
  }
  return stripeClient;
}

export const STRIPE_CONFIG = {
  currency: "cad",
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
};
