"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  luxDuration,
  luxEase,
  luxRevealDistance,
  luxStagger,
} from "@/lib/motion";

export type RevealDirection = "up" | "down" | "left" | "right" | "none" | "fade";

export interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  index?: number;
}

const offsets: Record<
  Exclude<RevealDirection, "none" | "fade">,
  { x: number; y: number }
> = {
  up: { x: 0, y: luxRevealDistance },
  down: { x: 0, y: -luxRevealDistance },
  // Keep horizontal travel minimal so mobile layout stays stable
  left: { x: 12, y: 0 },
  right: { x: -12, y: 0 },
};

export function RevealOnScroll({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = luxDuration.reveal,
  once = true,
  amount = 0.2,
  index = 0,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });
  const reduced = useReducedMotion();

  const offset =
    direction === "none" || direction === "fade"
      ? { x: 0, y: 0 }
      : offsets[direction];

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn("max-w-full", className)}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={
        inView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: offset.x, y: offset.y }
      }
      transition={{
        duration,
        delay: delay + index * luxStagger,
        ease: luxEase,
      }}
    >
      {children}
    </motion.div>
  );
}
