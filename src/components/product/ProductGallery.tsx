"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const stageRef = useRef<HTMLDivElement>(null);

  const activeIsChart = isSizeChartImage(gallery[active] || "");
  const canZoom = !activeIsChart;

  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => (i + dir + gallery.length) % gallery.length);
    },
    [gallery.length]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, go]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canZoom || !stageRef.current) return;
    // Skip magnifier on touch / coarse pointers — lightbox is the zoom path
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
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
              className="object-contain bg-[#141414] p-1"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      <div className="order-1 lg:order-2">
        <div
          ref={stageRef}
          className={cn(
            "group relative aspect-[3/4] overflow-hidden bg-[#141414]",
            canZoom ? "cursor-zoom-in" : "cursor-pointer"
          )}
          onMouseEnter={() => {
            if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
              canZoom && setZooming(true);
            }
          }}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={onMove}
          onClick={() => setLightbox(true)}
        >
          <SafeImage
            src={gallery[active]}
            alt={activeIsChart ? `${alt} size chart` : alt}
            fill
            priority
            className={cn(
              "object-contain p-3 transition-transform duration-150 ease-out sm:p-6",
              activeIsChart && "p-3",
              zooming && canZoom && "scale-[2.2]"
            )}
            style={
              zooming && canZoom
                ? { transformOrigin: `${origin.x}% ${origin.y}%` }
                : undefined
            }
            sizes="(max-width:1024px) 100vw, 55vw"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition group-hover:opacity-100 sm:opacity-100">
            {canZoom ? (
              <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/70 sm:inline-flex">
                <ZoomIn className="h-3.5 w-3.5" />
                Hover to zoom
              </span>
            ) : (
              <span />
            )}
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
              setLightbox(true);
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
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              className="absolute right-5 top-5 z-10 p-2 text-white/70 hover:text-[#D4AF37]"
              onClick={() => setLightbox(false)}
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
              className="relative h-[85vh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
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
