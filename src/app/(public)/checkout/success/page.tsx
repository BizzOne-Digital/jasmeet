import { Suspense } from "react";
import { CheckoutSuccess } from "@/components/checkout/CheckoutSuccess";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Thank you for your order.",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    <div>
      <PageHero eyebrow="Checkout" title="Secure Checkout" image={getPageHeroImage("checkout")} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <CheckoutSuccess />
        </Suspense>
      </div>
    </div>
  );
}
