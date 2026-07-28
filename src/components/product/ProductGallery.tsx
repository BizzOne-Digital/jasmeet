"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Expand, X } from "lucide-react";
import { cn, getPlaceholderImage } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";

export interface ProductGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ProductGallery({
  images,
  alt,
  className,
}: ProductGalleryProps) {
  const gallery =
    images?.filter(Boolean).length > 0
      ? images.filter(Boolean)
      : [getPlaceholderImage(900, 1200, "DAYAURA")];

  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [lightbox, setLightbox] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div className={cn("grid gap-4 lg:grid-cols-[88px_1fr]", className)}>
      <div className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">
        {gallery.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "relative h-20 w-16 shrink-0 overflow-hidden border transition",
              active === i
                ? "border-[#D4AF37]"
                : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <SafeImage
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>

      <div className="order-1 lg:order-2">
        <div
          ref={mainRef}
          className="relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-[#141414]"
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={onMove}
          onClick={() => setLightbox(true)}
        >
          <SafeImage
            src={gallery[active]}
            alt={alt}
            fill
            priority
            className={cn(
              "object-cover transition-transform duration-200",
              zoomed && "scale-150"
            )}
            style={{ transformOrigin: origin }}
            sizes="(max-width:1024px) 100vw, 50vw"
          />
          <button
            type="button"
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-black/55 text-white backdrop-blur-sm hover:text-[#D4AF37]"
            aria-label="Expand image"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(true);
            }}
          >
            <Expand className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {lightbox ? (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute right-5 top-5 p-2 text-white/70 hover:text-[#D4AF37]"
              onClick={() => setLightbox(false)}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative h-[80vh] w-full max-w-3xl">
              <SafeImage
                src={gallery[active]}
                alt={alt}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
