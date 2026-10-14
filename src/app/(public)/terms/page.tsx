import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/data/queries";
import { getSiteSettings } from "@/lib/data/settings";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("terms");
  return {
    title: page?.seoTitle || "Terms & Conditions",
    description:
      page?.seoDescription ||
      page?.description ||
      "Terms of use for the DAYAURA website and purchases.",
    alternates: { canonical: "/terms" },
  };
}

export default async function TermsPage() {
  const [page, settings] = await Promise.all([
    getPageBySlug("terms"),
    getSiteSettings(),
  ]);

  return (
    <div>
      <PageHero
        eyebrow="Legal"
        title={page?.title || "Terms & Conditions"}
        description={
          page?.description ||
          "Terms of use for the DAYAURA website and purchases."
        }
        image={getPageHeroImage("terms")}
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 text-sm leading-relaxed text-beige/75 sm:px-6 lg:px-8">
        <p>Last updated: {new Date().getFullYear()}</p>
        <section>
          <h2 className="font-heading text-2xl text-beige">Using the site</h2>
          <p className="mt-3">
            By accessing {settings.businessName} online, you agree to these terms
            and to use the site lawfully and respectfully.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl text-beige">Orders & pricing</h2>
          <p className="mt-3">
            Prices are listed in {settings.currency}. We reserve the right to
            correct pricing errors and cancel orders affected by obvious mistakes.
            Product availability is subject to stock.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl text-beige">Intellectual property</h2>
          <p className="mt-3">
            All DAYAURA branding, imagery, and site content are protected. You may
            not reproduce materials without permission.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl text-beige">Contact</h2>
          <p className="mt-3">
            Questions about these terms:{" "}
            <a href={`mailto:${settings.contactEmail}`} className="text-gold">
              {settings.contactEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
