"use client";

import Link from "next/link";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { SafeImage } from "@/components/ui/SafeImage";
import { Button } from "@/components/ui/Button";
import { cn, safeText } from "@/lib/utils";
import { GALLERY_IMAGES, resolveImage } from "@/lib/images";
import type { PageSectionData } from "@/types";

export interface GalleryPreviewItem {
  _id?: string;
  image: string;
  imageAlt?: string;
  altText?: string;
  caption?: string;
}

export interface GalleryPreviewProps {
  items?: GalleryPreviewItem[];
  section?: Partial<PageSectionData> | null;
  className?: string;
}

export function GalleryPreview({
  items = [],
  section,
  className,
}: GalleryPreviewProps) {
  const preview = (items.length ? items : GALLERY_IMAGES.map((image, i) => ({
    _id: `fallback-${i}`,
    image,
    caption: `DAYAURA campaign ${i + 1}`,
    altText: `DAYAURA gallery ${i + 1}`,
  }))).slice(0, 8) as GalleryPreviewItem[];

  return (
    <section className={cn("bg-black py-20 text-[#F5F0E6] lg:py-28", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">
                {safeText(section?.eyebrow, "Social")}
              </p>
              <h2 className="font-serif text-4xl tracking-wide md:text-5xl">
                {safeText(section?.heading, "In the wild.")}
              </h2>
              <p className="mt-4 text-sm text-white/55 md:text-base">
                {safeText(
                  section?.subheading,
                  "A glimpse of DAYAURA in motion — gym floors, studio light, city mornings."
                )}
              </p>
            </div>
            <Link href={safeText(section?.ctaUrl, "/gallery")}>
              <Button variant="outline">
                {safeText(section?.ctaLabel, "View gallery")}
              </Button>
            </Link>
          </div>
        </RevealOnScroll>

        {preview.length ? (
          <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
            {preview.map((item, i) => (
              <RevealOnScroll
                key={item._id || `${item.image}-${i}`}
                index={i}
                className="mb-3 break-inside-avoid"
              >
                <div className="relative overflow-hidden bg-[#141414]">
                  <SafeImage
                    src={resolveImage(
                      GALLERY_IMAGES[i % GALLERY_IMAGES.length],
                      item.image
                    )}
                    alt={
                      item.imageAlt ||
                      item.altText ||
                      item.caption ||
                      "DAYAURA gallery"
                    }
                    width={600}
                    height={i % 3 === 0 ? 800 : 650}
                    className="h-auto w-full object-cover transition duration-700 hover:scale-[1.03]"
                  />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/50">Gallery coming soon.</p>
        )}
      </div>
    </section>
  );
}
