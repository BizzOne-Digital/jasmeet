import type { Metadata } from "next";
import Link from "next/link";
import { getFAQsByCategory, getPageBySlug } from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";
import { FAQList } from "@/components/faq/FAQList";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("faq");
  return {
    title: page?.seoTitle || "FAQ",
    description:
      page?.seoDescription ||
      page?.description ||
      "Answers about orders, shipping, returns, sizing, and care.",
    alternates: { canonical: "/faq" },
  };
}

export default async function FAQPage() {
  const groupedRaw = await getFAQsByCategory();
  const grouped = serialize<
    Record<string, Array<{ _id: string; question: string; answer: string }>>
  >(groupedRaw);

  return (
    <div>
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
