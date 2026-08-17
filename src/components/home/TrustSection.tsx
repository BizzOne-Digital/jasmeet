"use client";

import { useRef } from "react";
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
  const scrollContainerRef = useRef<HTMLUListElement>(null);

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
          <div className="relative overflow-hidden sm:overflow-visible">
            <ul 
              ref={scrollContainerRef}
              className="flex gap-3 sm:grid sm:grid-cols-3 sm:gap-6 lg:grid-cols-5 lg:gap-4 sm:animate-none animate-scroll-mobile"
              style={{
                // On mobile, create continuous scroll animation - faster speed (12s instead of 20s)
                animation: 'scroll-mobile 12s linear infinite',
              }}
            >
              {items.map(({ label, Icon }, idx) => (
                <li
                  key={`${label}-${idx}`}
                  className="flex min-w-[42%] shrink-0 flex-col items-center gap-2.5 text-center sm:min-w-0 sm:gap-3"
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
          </div>
        </RevealOnScroll>
      </div>
      <style jsx>{`
        @media (max-width: 639px) {
          @keyframes scroll-mobile {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          
          ul:hover {
            animation-play-state: paused;
          }
        }
        
        @media (min-width: 640px) {
          ul {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
