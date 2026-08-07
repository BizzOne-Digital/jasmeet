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
  /** Tailwind object-position class, e.g. object-top / object-[center_20%] */
  imagePositionClass?: string;
}) {
  return (
    <header
      className={cn(
        "relative w-full max-w-full overflow-hidden",
        image
          ? "min-h-[36vh] bg-black sm:min-h-[44vh] md:min-h-[56vh]"
          : "border-b border-white/10 bg-gradient-to-b from-[#12100e] to-background",
        align === "center" && "text-center"
      )}
    >
      {image ? (
        <>
          <Image
            src={image}
            alt={imageAlt || safeText(title)}
            fill
            priority
            unoptimized={image.startsWith("/images/")}
            className={cn(
              "bg-black object-contain object-center md:object-cover",
              imagePositionClass !== "object-center"
                ? imagePositionClass.replace(/^object-/, "md:object-")
                : "md:object-center"
            )}
            sizes="100vw"
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/50 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
        </>
      ) : null}

      <div
        className={cn(
          "relative z-10 w-full px-4 py-14 sm:px-6 sm:py-20 md:py-28 lg:px-8",
          image &&
            "flex min-h-[36vh] items-end sm:min-h-[44vh] md:min-h-[56vh]"
        )}
      >
        <div className="container-lux px-0">
          {eyebrow ? (
            <p className="eyebrow mb-4">{safeText(eyebrow)}</p>
          ) : null}
          <h1 className="display-title max-w-4xl text-[clamp(2.1rem,5vw,3.75rem)]">
            {safeText(title)}
          </h1>
          {description ? (
            <p
              className={cn(
                "body-muted mt-5 max-w-2xl md:mt-6",
                align === "center" && "mx-auto"
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
