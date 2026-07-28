"use client";

import Link from "next/link";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn, safeText } from "@/lib/utils";
import { getCollectionImage, resolveImage } from "@/lib/images";
import type { PageSectionData } from "@/types";

export interface CollectionItem {
  _id?: string;
  name: string;
  slug: string;
  image?: string;
  imageAlt?: string;
  description?: string;
}

export interface CollectionsShowcaseProps {
  collections?: CollectionItem[];
  section?: Partial<PageSectionData> | null;
  className?: string;
}

export function CollectionsShowcase({
  collections = [],
  section,
  className,
}: CollectionsShowcaseProps) {
  const heading = safeText(section?.heading, "Collections");
  const subheading = safeText(
    section?.subheading,
    "Editorial silhouettes for every rhythm of movement."
  );

  return (
    <section className={cn("bg-black py-20 text-[#F5F0E6] lg:py-28", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">
              {safeText(section?.eyebrow, "The archive")}
            </p>
            <h2 className="font-serif text-4xl tracking-wide md:text-5xl">
              {heading}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55 md:text-base">
              {subheading}
            </p>
          </div>
        </RevealOnScroll>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-3">
          {collections.map((c, i) => (
            <RevealOnScroll
              key={c.slug}
              index={i}
              className="min-w-[78%] snap-center sm:min-w-[45%] md:min-w-0"
            >
              <Link
                href={`/collections/${c.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden bg-[#141414]"
              >
                <SafeImage
                  src={resolveImage(getCollectionImage(c.slug), c.image)}
                  alt={c.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width:768px) 80vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-serif text-2xl tracking-wide">{c.name}</h3>
                  {c.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-white/60">
                      {c.description}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-block text-[10px] uppercase tracking-[0.24em] text-[#D4AF37] transition group-hover:translate-x-1">
                    Explore
                  </span>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>

        {!collections.length ? (
          <p className="text-sm text-white/50">Collections coming soon.</p>
        ) : null}
      </div>
    </section>
  );
}
