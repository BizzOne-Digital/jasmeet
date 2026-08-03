import type { Metadata } from "next";
import Link from "next/link";
import { getPageBySlug, getPageSections } from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";
import { SafeImage } from "@/components/ui/SafeImage";
import { safeText } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("about");
  return {
    title: page?.seoTitle || "About",
    description:
      page?.seoDescription ||
      page?.description ||
      "The story, philosophy, and purpose behind DAYAURA.",
    alternates: { canonical: "/about" },
  };
}

const FALLBACK = [
  {
    eyebrow: "Our Story",
    heading: "Confidence Through Movement",
    body: "DAYAURA is a premium activewear brand designed to inspire confidence through movement. Born in Ontario, our collections combine style, comfort, and performance — so you can train hard and live fully.",
  },
  {
    eyebrow: "Philosophy",
    heading: "Wear Your Aura",
    body: "Your aura is the quiet strength you carry into every room, every workout, every day. DAYAURA is designed to honor that presence — sculpted silhouettes, elevated fabrics, and intentional details.",
  },
  {
    eyebrow: "Signature",
    heading: "A Message Only You Can Feel",
    body: "Every piece carries a hidden motivational message — a private reminder of your strength, revealed when you look closer and felt every time you move.",
  },
];

export default async function AboutPage() {
  const [page, sectionsRaw] = await Promise.all([
    getPageBySlug("about"),
    getPageSections("about"),
  ]);
  const sections = serialize<Array<Record<string, unknown>>>(sectionsRaw);

  return (
    <div>
      <PageHero
        eyebrow="About"
        title={safeText(page?.title, "About DAYAURA")}
        description={
          page?.description ||
          "Designed for women who move with intention — gym, yoga, lounge, and everything in between."
        }
        image={getPageHeroImage("about")}
      />

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {sections.length
          ? sections.map((section, index) => (
              <section
                key={String(section._id)}
                className="grid items-center gap-10 lg:grid-cols-2"
              >
                <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
                  {section.eyebrow ? (
                    <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
                      {String(section.eyebrow)}
                    </p>
                  ) : null}
                  <h2 className="mt-3 font-heading text-4xl tracking-wide">
                    {safeText(section.heading as string, "DAYAURA")}
                  </h2>
                  {section.subheading ? (
                    <p className="mt-4 text-beige/80">{String(section.subheading)}</p>
                  ) : null}
                  {section.body ? (
                    <p className="mt-4 text-sm leading-relaxed text-muted">
                      {String(section.body)}
                    </p>
                  ) : null}
                </div>
                <div
                  className={`relative aspect-[4/5] overflow-hidden bg-surface ${
                    index % 2 === 1 ? "lg:order-1" : ""
                  }`}
                >
                  <SafeImage
                    src={(section.sideImage || section.backgroundImage) as string}
                    alt={safeText(section.imageAlt as string, "About DAYAURA")}
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 50vw"
                  />
                </div>
              </section>
            ))
          : FALLBACK.map((block) => (
              <section key={block.heading} className="max-w-3xl">
                <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
                  {block.eyebrow}
                </p>
                <h2 className="mt-3 font-heading text-4xl tracking-wide">
                  {block.heading}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted">{block.body}</p>
              </section>
            ))}

        <section className="border border-white/10 bg-surface px-6 py-12 text-center md:px-12">
          <h2 className="font-heading text-3xl md:text-4xl">Brand promises</h2>
          <ul className="mx-auto mt-8 grid max-w-4xl gap-6 text-sm text-beige/75 md:grid-cols-4">
            <li>Design that sculpts</li>
            <li>Comfort that endures</li>
            <li>Confidence that shows</li>
            <li>Performance that delivers</li>
          </ul>
          <Link
            href="/collections"
            className="mt-10 inline-flex h-11 items-center bg-gold px-6 text-xs uppercase tracking-[0.2em] text-black"
          >
            Explore collections
          </Link>
        </section>
      </div>
    </div>
  );
}
