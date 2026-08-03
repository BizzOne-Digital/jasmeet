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

const TRUST_ITEMS: Array<{ label: string; Icon: LucideIcon }> = [
  { label: "Premium Performance Fabric", Icon: Sparkles },
  { label: "Hidden Motivational Messages", Icon: HeartHandshake },
  { label: "Free Shipping over $99", Icon: Truck },
  { label: "30-Day Returns", Icon: RefreshCw },
  { label: "Secure Checkout", Icon: Lock },
];

export function TrustSection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "border-y border-white/10 bg-dark-surface text-beige",
        className
      )}
      aria-label="Trust and benefits"
    >
      <div className="container-lux py-10 sm:py-12">
        <RevealOnScroll direction="up">
          <ul className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {TRUST_ITEMS.map(({ label, Icon }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-3.5 text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center border border-gold/30 text-gold">
                  <Icon className="h-5 w-5" strokeWidth={1.2} aria-hidden />
                </span>
                <span className="max-w-[10rem] text-[11px] uppercase leading-relaxed tracking-[0.18em] text-beige/75">
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
