import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data/settings";
import { isPaymentProviderConfigured } from "@/lib/orders";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your DAYAURA order.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const settings = await getSiteSettings();
  const paymentConfigured = isPaymentProviderConfigured();

  return (
    <div>
      <PageHero eyebrow="Checkout" title="Secure Checkout" image={getPageHeroImage("checkout")} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CheckoutClient
          shippingThreshold={settings.shippingThreshold}
          standardShippingRate={settings.standardShippingRate}
          shippingProcessingTime={settings.shippingProcessingTime}
          shippingDeliveryEstimate={settings.shippingDeliveryEstimate}
          localDeliveryEnabled={settings.localDeliveryEnabled}
          localDeliveryFee={settings.localDeliveryFee}
          localDeliveryPostalCodes={settings.localDeliveryPostalCodes}
          paymentConfigured={paymentConfigured}
        />
      </div>
    </div>
  );
}
