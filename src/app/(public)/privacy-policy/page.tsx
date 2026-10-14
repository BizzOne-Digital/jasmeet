import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/data/queries";
import { getSiteSettings } from "@/lib/data/settings";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("privacy-policy");
  return {
    title: page?.seoTitle || "Privacy Policy",
    description:
      page?.seoDescription ||
      page?.description ||
      "How DAYAURA collects, uses, and protects your information.",
    alternates: { canonical: "/privacy-policy" },
  };
}

export default async function PrivacyPolicyPage() {
  const [page, settings] = await Promise.all([
    getPageBySlug("privacy-policy"),
    getSiteSettings(),
  ]);

  return (
    <div>
      <PageHero
        eyebrow="Legal"
        title={page?.title || "Privacy Policy"}
        description={
          page?.description ||
          "How we collect, use, and protect your information."
        }
        image={getPageHeroImage("privacyPolicy")}
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 text-sm leading-relaxed text-beige/75 sm:px-6 lg:px-8">
        <p>Last updated: {new Date().getFullYear()}</p>
        <section>
          <h2 className="font-heading text-2xl text-beige">Information we collect</h2>
          <p className="mt-3">
            We may collect contact details, order information, shipping addresses,
            newsletter emails, and messages you send through our contact form.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl text-beige">How we use information</h2>
          <p className="mt-3">
            Information is used to fulfill orders, provide customer support, send
            requested marketing communications, and improve the DAYAURA experience.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl text-beige">Sharing</h2>
          <p className="mt-3">
            We do not sell personal information. We may share data with trusted
            service providers (such as shipping or payment partners) solely to
            operate the store.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl text-beige">Contact</h2>
          <p className="mt-3">
            Privacy questions can be sent to{" "}
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
