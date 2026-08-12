"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X, ZoomIn } from "lucide-react";
import { cn, getPlaceholderImage } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";

export interface ProductGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

function isSizeChartImage(src: string) {
  return /size-chart/i.test(src);
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
  const [lightbox, setLightbox] = useState(false);
  const [lbZoomed, setLbZoomed] = useState(false);
  const [lbOrigin, setLbOrigin] = useState({ x: 50, y: 50 });
  const lightboxImgRef = useRef<HTMLDivElement>(null);

  const activeIsChart = isSizeChartImage(gallery[active] || "");

  const go = (dir: -1 | 1) => {
    setActive((i) => (i + dir + gallery.length) % gallery.length);
    setLbZoomed(false);
  };

  const openLightbox = () => {
    setLbZoomed(false);
    setLightbox(true);
  };

  const closeLightbox = () => {
    setLightbox(false);
    setLbZoomed(false);
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, go]);

  const onLightboxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (activeIsChart) return;
    if (!lightboxImgRef.current) {
      setLbZoomed((z) => !z);
      return;
    }
    const rect = lightboxImgRef.current.getBoundingClientRect();
    setLbOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
    setLbZoomed((z) => !z);
  };

  const onLightboxMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!lbZoomed || !lightboxImgRef.current) return;
    const rect = lightboxImgRef.current.getBoundingClientRect();
    setLbOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className={cn("grid gap-4 lg:grid-cols-[96px_1fr]", className)}>
      <div className="order-2 flex gap-2 overflow-x-auto scroll-touch pb-1 no-scrollbar lg:order-1 lg:max-h-[min(80vh,720px)] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0">
        {gallery.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "relative h-24 w-[4.5rem] shrink-0 overflow-hidden border transition sm:h-28 sm:w-20",
              active === i
                ? "border-[#D4AF37]"
                : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <SafeImage
              src={src}
              alt=""
              fill
              quality={100}
              className="object-contain bg-[#141414] p-1"
              sizes="96px"
            />
          </button>
        ))}
      </div>

      <div className="order-1 lg:order-2">
        <div
          className="group relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-[#141414]"
          onClick={openLightbox}
          role="button"
          tabIndex={0}
          aria-label="Open zoomed image"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openLightbox();
            }
          }}
        >
          <SafeImage
            src={gallery[active]}
            alt={activeIsChart ? `${alt} size chart` : alt}
            fill
            priority
            quality={100}
            className={cn(
              "object-contain p-3 sm:p-6",
              activeIsChart && "p-3"
            )}
            sizes="(max-width:1024px) 100vw, 55vw"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition group-hover:opacity-100 sm:opacity-100">
            <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/70 sm:inline-flex">
              <ZoomIn className="h-3.5 w-3.5" />
              Click to zoom
            </span>
          </div>

          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-black/50 text-white backdrop-blur-sm transition hover:text-[#D4AF37]"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-black/50 text-white backdrop-blur-sm transition hover:text-[#D4AF37]"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : null}

          <button
            type="button"
            className="absolute bottom-3 right-3 z-10 flex h-11 w-11 items-center justify-center bg-black/55 text-white backdrop-blur-sm hover:text-[#D4AF37]"
            aria-label="Expand image"
            onClick={(e) => {
              e.stopPropagation();
              openLightbox();
            }}
          >
            <Expand className="h-4 w-4" />
          </button>
        </div>

        {gallery.length > 1 ? (
          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-white/40 lg:text-left">
            {active + 1} / {gallery.length}
          </p>
        ) : null}
      </div>

      <AnimatePresence>
        {lightbox ? (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/92 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button
              type="button"
              className="absolute right-5 top-5 z-10 p-2 text-white/70 hover:text-[#D4AF37]"
              onClick={closeLightbox}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>

            {gallery.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-white/70 hover:text-[#D4AF37] md:left-8"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-white/70 hover:text-[#D4AF37] md:right-8"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            ) : null}

            <div
              ref={lightboxImgRef}
              className={cn(
                "relative h-[85vh] w-full max-w-5xl overflow-hidden",
                activeIsChart
                  ? "cursor-default"
                  : lbZoomed
                    ? "cursor-zoom-out"
                    : "cursor-zoom-in"
              )}
              onClick={onLightboxClick}
              onMouseMove={onLightboxMove}
            >
              <SafeImage
                src={gallery[active]}
                alt={alt}
                fill
                quality={100}
                className={cn(
                  "object-contain transition-transform duration-200 ease-out",
                  lbZoomed && !activeIsChart && "scale-[2.4]"
                )}
                style={
                  lbZoomed && !activeIsChart
                    ? { transformOrigin: `${lbOrigin.x}% ${lbOrigin.y}%` }
                    : undefined
                }
                sizes="100vw"
              />
            </div>

            {!activeIsChart ? (
              <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-white/45">
                {lbZoomed ? "Click to zoom out" : "Click image to zoom in"}
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
