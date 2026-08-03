import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { TrackOrderClient } from "@/components/orders/TrackOrderClient";
import { getPageHeroImage } from "@/lib/images";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Check the status of your DAYAURA order.",
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderPage() {
  return (
    <div>
      <PageHero
        eyebrow="Orders"
        title="Track your order"
        description="Enter your order number and checkout email to see the latest status."
        image={getPageHeroImage("contact")}
      />
      <Suspense fallback={<p className="py-14 text-center text-sm text-muted">Loading…</p>}>
        <TrackOrderClient />
      </Suspense>
    </div>
  );
}
