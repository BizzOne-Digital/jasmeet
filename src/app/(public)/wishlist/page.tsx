import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";
import { WishlistPageClient } from "@/components/wishlist/WishlistPageClient";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Saved DAYAURA pieces you love.",
  alternates: { canonical: "/wishlist" },
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <div>
      <PageHero eyebrow="Wishlist" title="Saved Pieces" image={getPageHeroImage("wishlist")} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <WishlistPageClient />
      </div>
    </div>
  );
}
