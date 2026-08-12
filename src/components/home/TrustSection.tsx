"use client";

import {
  HeartHandshake,
  Lock,
  RefreshCw,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { cn } from "@/lib/utils";
import type { PageSectionData } from "@/types";

const DEFAULT_TRUST_ITEMS: Array<{ label: string; Icon: LucideIcon }> = [
  { label: "Premium Performance Fabric", Icon: Sparkles },
  { label: "Hidden Motivational Messages", Icon: HeartHandshake },
  { label: "Free Shipping over $99", Icon: Truck },
  { label: "30-Day Returns", Icon: RefreshCw },
  { label: "Secure Checkout", Icon: Lock },
];

const TRUST_ICONS = [Sparkles, HeartHandshake, Truck, RefreshCw, Lock];

function resolveTrustItems(section?: Partial<PageSectionData> | null) {
  const body = section?.body?.trim();
  if (!body) return DEFAULT_TRUST_ITEMS;

  const labels = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!labels.length) return DEFAULT_TRUST_ITEMS;

  return labels.map((label, i) => ({
    label,
    Icon: TRUST_ICONS[i % TRUST_ICONS.length],
  }));
}

export function TrustSection({
  className,
  section,
}: {
  className?: string;
  section?: Partial<PageSectionData> | null;
}) {
  const items = resolveTrustItems(section);

  return (
    <section
      className={cn(
        "border-y border-white/10 bg-dark-surface text-beige",
        className
      )}
      aria-label="Trust and benefits"
    >
      <div className="container-lux py-6 sm:py-10">
        <RevealOnScroll direction="up">
          <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:snap-none sm:grid-cols-3 sm:gap-6 sm:overflow-visible lg:grid-cols-5 lg:gap-4 [&::-webkit-scrollbar]:hidden">
            {items.map(({ label, Icon }) => (
              <li
                key={label}
                className="flex min-w-[42%] shrink-0 snap-start flex-col items-center gap-2.5 text-center sm:min-w-0 sm:gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center border border-gold/30 text-gold sm:h-11 sm:w-11">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.2} aria-hidden />
                </span>
                <span className="max-w-[9rem] text-[10px] uppercase leading-snug tracking-[0.16em] text-beige/75 sm:max-w-[10rem] sm:text-[11px] sm:tracking-[0.18em]">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  );
}
