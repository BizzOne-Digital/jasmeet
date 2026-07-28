import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data/settings";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";
import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your DAYAURA cart and continue to checkout.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <PageHero eyebrow="Cart" title="Your Cart" image={getPageHeroImage("cart")} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CartPageClient shippingThreshold={settings.shippingThreshold} />
      </div>
    </div>
  );
}
