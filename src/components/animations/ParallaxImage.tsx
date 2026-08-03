"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";

export interface ParallaxImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  speed?: number;
  priority?: boolean;
}

export function ParallaxImage({
  src,
  alt,
  className,
  imageClassName,
  speed = 0.08,
  priority,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : [`-${speed * 100}%`, `${speed * 100}%`]
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-[-20%] will-change-transform">
        <SafeImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          className={cn("object-cover", imageClassName)}
          sizes="100vw"
        />
      </motion.div>
    </div>
  );
}
