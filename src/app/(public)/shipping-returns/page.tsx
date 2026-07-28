import type { Metadata } from "next";
import Link from "next/link";
import { getPageBySlug } from "@/lib/data/queries";
import { getSiteSettings } from "@/lib/data/settings";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("shipping-returns");
  return {
    title: page?.seoTitle || "Shipping & Returns",
    description:
      page?.seoDescription ||
      page?.description ||
      "Shipping timelines, free shipping threshold, and return policy.",
    alternates: { canonical: "/shipping-returns" },
  };
}

export default async function ShippingReturnsPage() {
  const [page, settings] = await Promise.all([
    getPageBySlug("shipping-returns"),
    getSiteSettings(),
  ]);

  return (
    <div>
      <PageHero
        eyebrow="Policy"
        title={page?.title || "Shipping & Returns"}
        description={
          page?.description ||
          "Clear timelines and a straightforward return process."
        }
        image={getPageHeroImage("shippingReturns")}
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-14 text-sm leading-relaxed text-beige/75 sm:px-6 lg:px-8">
        <section>
          <h2 className="font-heading text-3xl text-beige">Shipping</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              Free shipping on orders over CAD ${settings.shippingThreshold}.
            </li>
            <li>Orders typically process within 1–2 business days.</li>
            <li>
              Standard shipping within Canada usually arrives in 3–7 business days
              depending on location.
            </li>
            <li>
              International options may be available for select destinations —
              contact us before ordering.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="font-heading text-3xl text-beige">Returns</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              Unworn, unwashed items with original tags may be returned within 14
              days of delivery.
            </li>
            <li>
              Sale items and intimates may have limited return eligibility.
            </li>
            <li>
              Email{" "}
              <a href={`mailto:${settings.contactEmail}`} className="text-gold">
                {settings.contactEmail}
              </a>{" "}
              with your order number to start a return.
            </li>
          </ul>
        </section>
        <p>
          Questions? Visit the{" "}
          <Link href="/faq" className="text-gold">
            FAQ
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="text-gold">
            contact
          </Link>{" "}
          page.
        </p>
      </div>
    </div>
  );
}
