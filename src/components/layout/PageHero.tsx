import Link from "next/link";
import Image from "next/image";
import { cn, safeText } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  align = "left",
  image,
  imageAlt,
  imagePositionClass = "object-center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  image?: string;
  imageAlt?: string;
  /** Tailwind object-position class, e.g. object-top */
  imagePositionClass?: string;
}) {
  return (
    <header
      className={cn(
        "relative w-full max-w-full overflow-hidden",
        !image &&
          "border-b border-white/10 bg-gradient-to-b from-[#12100e] to-background",
        align === "center" && "text-center"
      )}
    >
      {image ? (
        <>
          <div className="relative w-full bg-black">
            <div className="relative w-full aspect-[21/9]">
              <Image
                src={image}
                alt={imageAlt || safeText(title)}
                fill
                priority
                unoptimized={
                  image.startsWith("/images/") || image.startsWith("/api/uploads/")
                }
                className={cn(
                  "object-cover object-center",
                  imagePositionClass
                )}
                sizes="100vw"
                quality={100}
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/78 via-black/50 to-black/35" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        </>
      ) : null}

      <div
        className={cn(
          "relative z-10 w-full px-4 py-10 sm:px-6 sm:py-14 md:py-16 lg:px-8",
          image && "absolute inset-x-0 bottom-12 sm:bottom-16 md:bottom-20"
        )}
      >
        <div className={cn(
          "container-lux px-0",
          align === "center" && "flex flex-col items-center"
        )}>
          {eyebrow ? (
            <p className="eyebrow mb-4">{safeText(eyebrow)}</p>
          ) : null}
          <h1 className={cn(
            "display-title max-w-4xl text-[clamp(2.1rem,5vw,3.75rem)]",
            align === "center" && "text-center"
          )}>
            {safeText(title)}
          </h1>
          {description ? (
            <p
              className={cn(
                "body-muted mt-5 max-w-2xl md:mt-6",
                align === "center" && "mx-auto text-center"
              )}
            >
              {safeText(description)}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-8 text-[11px] uppercase tracking-[0.18em] text-muted"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 ? <span className="text-beige/30">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="transition hover:text-gold">
                {item.label}
              </Link>
            ) : (
              <span className="text-beige/85">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
