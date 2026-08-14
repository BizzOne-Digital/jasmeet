import type { Metadata } from "next";
import Link from "next/link";
import { getPageBySlug, getPageSections } from "@/lib/data/queries";
import { getSiteSettings } from "@/lib/data/settings";
import { PageHero } from "@/components/layout/PageHero";
import { resolvePageHeroImage } from "@/lib/images";
import { ContactForm } from "@/components/contact/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("contact");
  return {
    title: page?.seoTitle || "Contact",
    description:
      page?.seoDescription ||
      page?.description ||
      "Get in touch with the DAYAURA team.",
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const [settings, sectionsRaw] = await Promise.all([
    getSiteSettings(),
    getPageSections("contact"),
  ]);

  const heroSection = sectionsRaw.find(
    (s) => s.sectionKey === "page-hero" || s.sectionKey === "hero"
  );
  const heroImage = resolvePageHeroImage(
    "contact",
    heroSection?.backgroundImage
  );

  return (
    <div>
      <PageHero
        eyebrow={heroSection?.eyebrow || "Contact"}
        title={heroSection?.heading || "Get in Touch"}
        description={
          heroSection?.subheading ||
          "Questions about orders, sizing, or the brand — we're here."
        }
        image={heroImage}
      />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 lg:grid-cols-2 lg:px-8">
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-3xl">Contact details</h2>
            <ul className="mt-6 space-y-3 text-sm text-beige/80">
              <li>
                <span className="text-muted">For inquiries, email: </span>
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-gold">
                  {settings.contactEmail}
                </a>
              </li>
              <li>
                <span className="text-muted">Location: </span>
                {settings.address}
              </li>
              <li>
                <span className="text-muted">Website: </span>
                {settings.website}
              </li>
              <li>
                <span className="text-muted">Business hours: </span>
                {settings.businessHours}
              </li>
              <li>
                <span className="text-muted">Store: </span>
                {settings.supportHours}
              </li>
              <li>
                <span className="text-muted">Response time: </span>
                {settings.responseTime}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold">Social</h3>
            <ul className="mt-4 flex flex-wrap gap-4 text-sm">
              {settings.instagramUrl ? (
                <li>
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold"
                  >
                    Instagram
                  </a>
                </li>
              ) : null}
              {settings.tiktokUrl ? (
                <li>
                  <a
                    href={settings.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold"
                  >
                    TikTok
                  </a>
                </li>
              ) : null}
              {settings.facebookUrl ? (
                <li>
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold"
                  >
                    Facebook
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <p className="text-sm text-muted">
            Prefer email?{" "}
            <Link href={`mailto:${settings.contactEmail}`} className="text-gold hover:underline">
              {settings.contactEmail}
            </Link>
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
