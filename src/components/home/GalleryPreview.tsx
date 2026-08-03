"use client";

import Link from "next/link";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
  const preview = (
    items.length
      ? items
      : GALLERY_IMAGES.map((image, i) => ({
          _id: `fallback-${i}`,
          image,
          caption: `DAYAURA campaign ${i + 1}`,
          altText: `DAYAURA gallery ${i + 1}`,
        }))
  ).slice(0, 8) as GalleryPreviewItem[];

  return (
    <section
      className={cn(
        "section-shell overflow-x-clip bg-background text-beige",
        className
      )}
    >
      <div className="container-lux">
        <RevealOnScroll>
          <div className="mb-12 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              className="mb-0"
              eyebrow={safeText(section?.eyebrow, "Gallery")}
              heading={safeText(section?.heading, "In the wild.")}
              subheading={safeText(
                section?.subheading,
                "A glimpse of DAYAURA in motion — gym floors, studio light, city mornings."
              )}
            />
            <Link href={safeText(section?.ctaUrl, "/gallery")} className="shrink-0">
              <Button variant="outline">
                {safeText(section?.ctaLabel, "View gallery")}
              </Button>
            </Link>
          </div>
        </RevealOnScroll>

        {preview.length ? (
          <div className="columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4">
            {preview.map((item, i) => (
              <RevealOnScroll
                key={item._id || `${item.image}-${i}`}
                index={i}
                className="mb-3 break-inside-avoid md:mb-4"
              >
                <div className="group img-frame relative overflow-hidden">
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
                    sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw"
                    className="lux-zoom h-auto w-full object-cover"
                  />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        ) : (
          <p className="body-muted">Gallery coming soon.</p>
        )}
      </div>
    </section>
  );
}
