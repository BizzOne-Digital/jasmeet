"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only enable auto-scroll on mobile (screens < 640px)
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    if (!isMobile) return;

    let scrollInterval: NodeJS.Timeout;
    let isUserScrolling = false;
    let userScrollTimeout: NodeJS.Timeout;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (isUserScrolling || !container) return;

        const itemWidth = container.scrollWidth / items.length;
        const currentScroll = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        // If we've reached the end, scroll back to start
        if (currentScroll >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Scroll to next item
          container.scrollBy({ left: itemWidth, behavior: "smooth" });
        }
      }, 3000); // Scroll every 3 seconds
    };

    // Pause auto-scroll when user manually scrolls
    const handleUserScroll = () => {
      isUserScrolling = true;
      clearTimeout(userScrollTimeout);
      
      userScrollTimeout = setTimeout(() => {
        isUserScrolling = false;
      }, 5000); // Resume auto-scroll 5 seconds after user stops scrolling
    };

    container.addEventListener("touchstart", handleUserScroll);
    container.addEventListener("scroll", handleUserScroll, { passive: true });

    startAutoScroll();

    return () => {
      clearInterval(scrollInterval);
      clearTimeout(userScrollTimeout);
      container.removeEventListener("touchstart", handleUserScroll);
      container.removeEventListener("scroll", handleUserScroll);
    };
  }, [items.length]);

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
          <ul 
            ref={scrollContainerRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:snap-none sm:grid-cols-3 sm:gap-6 sm:overflow-visible lg:grid-cols-5 lg:gap-4 [&::-webkit-scrollbar]:hidden"
          >
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
