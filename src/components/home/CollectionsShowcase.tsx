"use client";

import Link from "next/link";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn, safeText } from "@/lib/utils";
import { getCollectionDescription } from "@/lib/collections";
import { getCollectionImage } from "@/lib/images";
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
  const heading = safeText(section?.heading, "Featured Collections");
  const subheading = safeText(
    section?.subheading,
    "Editorial silhouettes for every rhythm of movement."
  );

  return (
    <section
      className={cn(
        "section-shell overflow-x-clip bg-background text-beige",
        className
      )}
    >
      <div className="container-lux">
        <RevealOnScroll>
          <SectionHeader
            eyebrow={safeText(section?.eyebrow, "The archive")}
            heading={heading}
            subheading={subheading}
          />
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {collections.map((c, i) => {
            const description = getCollectionDescription(
              c.slug,
              c.name,
              c.description
            );
            return (
              <RevealOnScroll key={c.slug} index={i} direction="up">
                <article className="group flex h-full flex-col">
                  <Link
                    href={`/collections/${c.slug}`}
                    className="img-frame relative block aspect-[3/4] overflow-hidden"
                  >
                    <SafeImage
                      src={getCollectionImage(c.slug)}
                      alt={`${c.name} collection cover`}
                      fill
                      className="lux-zoom object-cover"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-90 transition duration-700 group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <h3 className="font-serif text-2xl tracking-[0.04em] text-beige sm:text-[1.65rem]">
                        {c.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-beige/65">
                        {description}
                      </p>
                      <span className="mt-5 inline-flex min-h-10 items-center border border-gold/60 px-4 text-[10px] uppercase tracking-[0.24em] text-gold transition duration-500 group-hover:bg-gold group-hover:text-black">
                        Shop Collection
                      </span>
                    </div>
                  </Link>
                </article>
              </RevealOnScroll>
            );
          })}
        </div>

        {!collections.length ? (
          <p className="body-muted">Collections coming soon.</p>
        ) : null}
      </div>
    </section>
  );
}
