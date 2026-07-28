"use client";

import Link from "next/link";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
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
    <section className={cn("bg-black py-20 text-[#F5F0E6] lg:py-28", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">
              {safeText(section?.eyebrow, "Shop by movement")}
            </p>
            <h2 className="font-serif text-4xl tracking-wide md:text-5xl">
              {safeText(section?.heading, "Move your way.")}
            </h2>
            <p className="mt-4 text-sm text-white/55 md:text-base">
              {safeText(
                section?.subheading,
                "From high-intensity training to quiet mornings — find your rhythm."
              )}
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {items.map((item, i) => (
            <RevealOnScroll key={item.name} index={i} direction="up">
              <Link
                href={item.href}
                className="group relative block aspect-[3/4] overflow-hidden bg-[#141414]"
              >
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width:768px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/35 transition group-hover:bg-black/50" />
                <span className="absolute inset-x-0 bottom-0 p-4 text-center text-[11px] uppercase tracking-[0.22em]">
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
