import type { Metadata } from "next";
import Link from "next/link";
import { getFAQsByCategory, getPageBySlug } from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { absoluteUrl } from "@/lib/utils";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";
import { FAQList } from "@/components/faq/FAQList";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("faq");
  const title = page?.seoTitle || "FAQ";
  const description =
    page?.seoDescription ||
    page?.description ||
    "Answers about orders, shipping, returns, sizing, and care.";

  return {
    title,
    description,
    alternates: { canonical: "/faq" },
    openGraph: {
      title,
      description,
      url: absoluteUrl("/faq"),
    },
  };
}

export default async function FAQPage() {
  const groupedRaw = await getFAQsByCategory();
  const grouped = serialize<
    Record<string, Array<{ _id: string; question: string; answer: string }>>
  >(groupedRaw);

  const entities = Object.values(grouped).flat();
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entities.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div>
      <JsonLd data={faqJsonLd} />
      <PageHero
        eyebrow="Support"
        title="Frequently Asked Questions"
        description="Everything you need to know about orders, shipping, sizing, and care."
        image={getPageHeroImage("faq")}
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <FAQList groups={grouped} />
        <p className="mt-12 text-center text-sm text-muted">
          Still need help?{" "}
          <Link href="/contact" className="text-gold">
            Contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
