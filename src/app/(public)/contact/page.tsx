import type { Metadata } from "next";
import Link from "next/link";
import { getPageBySlug } from "@/lib/data/queries";
import { getSiteSettings } from "@/lib/data/settings";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";
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
  const settings = await getSiteSettings();

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Get in Touch"
        description="Questions about orders, sizing, or the brand — we're here."
        image={getPageHeroImage("contact")}
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
              {settings.phone ? (
                <li>
                  <span className="text-muted">Phone: </span>
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                    className="hover:text-gold"
                  >
                    {settings.phone}
                  </a>
                </li>
              ) : null}
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
              <li>
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                  Instagram
                </a>
              </li>
              <li>
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                  TikTok
                </a>
              </li>
              <li>
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                  Facebook
                </a>
              </li>
            </ul>
          </div>

          <div className="border border-white/10 p-6">
            <p className="text-sm text-beige/80">
              Looking for quick answers? Visit our{" "}
              <Link href="/faq" className="text-gold">
                FAQ
              </Link>
              . Want first-order savings? Join the list on the homepage for{" "}
              {settings.firstOrderDiscountText.toLowerCase()}.
            </p>
          </div>
        </div>

        <div className="border border-white/10 bg-surface p-6 md:p-8">
          <h2 className="mb-6 font-heading text-3xl">Send a message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
