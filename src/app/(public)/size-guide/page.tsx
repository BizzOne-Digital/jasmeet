import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/data/queries";
import { PageHero } from "@/components/layout/PageHero";
import { getPageHeroImage } from "@/lib/images";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("size-guide");
  return {
    title: page?.seoTitle || "Size Guide",
    description:
      page?.seoDescription ||
      page?.description ||
      "Find your perfect DAYAURA fit with our size guide.",
    alternates: { canonical: "/size-guide" },
  };
}

const ROWS = [
  { size: "XS", bust: "32–33", waist: "24–25", hip: "34–35" },
  { size: "S", bust: "34–35", waist: "26–27", hip: "36–37" },
  { size: "M", bust: "36–37", waist: "28–29", hip: "38–39" },
  { size: "L", bust: "38–40", waist: "30–32", hip: "40–42" },
  { size: "XL", bust: "41–43", waist: "33–35", hip: "43–45" },
];

export default async function SizeGuidePage() {
  const page = await getPageBySlug("size-guide");

  return (
    <div>
      <PageHero
        eyebrow="Fit"
        title={page?.title || "Size Guide"}
        description={
          page?.description ||
          "Our pieces are designed with a sculpted athletic fit. If you are between sizes, size up for a more relaxed feel."
        }
        image={getPageHeroImage("sizeGuide")}
      />
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="overflow-x-auto border border-white/10">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-surface text-[11px] uppercase tracking-[0.18em] text-gold">
              <tr>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Bust (in)</th>
                <th className="px-4 py-3">Waist (in)</th>
                <th className="px-4 py-3">Hip (in)</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.size} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium">{row.size}</td>
                  <td className="px-4 py-3 text-muted">{row.bust}</td>
                  <td className="px-4 py-3 text-muted">{row.waist}</td>
                  <td className="px-4 py-3 text-muted">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10 space-y-4 text-sm leading-relaxed text-beige/75">
          <p>
            Measure over light clothing. Bust at the fullest point, waist at the
            narrowest, hips at the fullest.
          </p>
          <p>
            Compression pieces may feel firmer at first — fabrics settle with wear.
            Check each product’s fit details for style-specific guidance.
          </p>
          <p>
            Need help? Email{" "}
            <a href="mailto:dayauraofficial@gmail.com" className="text-gold">
              dayauraofficial@gmail.com
            </a>{" "}
            with your measurements and preferred silhouette.
          </p>
        </div>
      </div>
    </div>
  );
}
