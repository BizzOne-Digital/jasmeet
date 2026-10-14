"use client";

import Link from "next/link";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn, safeText } from "@/lib/utils";
import { MOVEMENT_IMAGES } from "@/lib/images";
import type { PageSectionData } from "@/types";

const MOVEMENTS = [
  { name: "Gym", href: "/shop?category=sports-bras", image: MOVEMENT_IMAGES.gym },
  { name: "Yoga", href: "/shop?category=leggings", image: MOVEMENT_IMAGES.yoga },
  { name: "Lounge", href: "/shop?category=sets", image: MOVEMENT_IMAGES.lounge },
  { name: "Everyday", href: "/shop?category=tops-t-shirts", image: MOVEMENT_IMAGES.everyday },
  { name: "High Performance", href: "/collections/auraimpact", image: MOVEMENT_IMAGES.train },
];

export interface MovementCategoriesProps {
  section?: Partial<PageSectionData> | null;
  className?: string;
  items?: typeof MOVEMENTS;
}

export function MovementCategories({
  section,
  className,
  items = MOVEMENTS,
}: MovementCategoriesProps) {
  return (
    <section
      className={cn("section-shell overflow-x-clip bg-background text-beige", className)}
    >
      <div className="container-lux">
        <RevealOnScroll>
          <SectionHeader
            eyebrow={safeText(section?.eyebrow, "Shop by movement")}
            heading={safeText(section?.heading, "Move your way.")}
            subheading={safeText(
              section?.subheading,
              "From high-intensity training to quiet mornings — find your rhythm."
            )}
          />
        </RevealOnScroll>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {items.map((item, i) => (
            <RevealOnScroll key={item.name} index={i} direction="up">
              <Link
                href={item.href}
                className="group img-frame relative block aspect-[4/5] overflow-hidden bg-[#141414] sm:aspect-[3/4]"
              >
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain object-center transition duration-700 group-hover:scale-[1.03] sm:object-cover"
                  sizes="(max-width:768px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition duration-700 group-hover:from-black/80" />
                <span className="absolute inset-x-0 bottom-0 p-4 text-center text-[11px] uppercase tracking-[0.24em] text-beige">
                  {item.name}
                </span>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
