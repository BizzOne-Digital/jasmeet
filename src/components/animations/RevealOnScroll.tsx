"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

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

const offsets: Record<Exclude<RevealDirection, "none">, { x: number; y: number }> = {
  up: { x: 0, y: 48 },
  down: { x: 0, y: -48 },
  left: { x: 48, y: 0 },
  right: { x: -48, y: 0 },
};

export function RevealOnScroll({
  children,
  className,
  direction,
  delay = 0,
  duration = 0.7,
  once = true,
  amount = 0.25,
  index = 0,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });
  const reduced = useReducedMotion();

  const resolved: RevealDirection =
    direction ?? (index % 2 === 0 ? "up" : index % 3 === 0 ? "down" : "left");

  const offset =
    resolved === "none" ? { x: 0, y: 0 } : offsets[resolved];

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={
        inView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: offset.x, y: offset.y }
      }
      transition={{
        duration,
        delay: delay + index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
