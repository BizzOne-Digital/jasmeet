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
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  image?: string;
  imageAlt?: string;
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-white/10",
        image ? "min-h-[42vh] md:min-h-[48vh]" : "bg-gradient-to-b from-[#14110e] to-background",
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
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/35" />
        </>
      ) : null}

      <div
        className={cn(
          "relative z-10 px-4 py-16 sm:px-6 md:py-24 lg:px-8",
          image && "flex min-h-[42vh] items-end md:min-h-[48vh]"
        )}
      >
        <div className="mx-auto w-full max-w-7xl">
          {eyebrow ? (
            <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-gold">
              {safeText(eyebrow)}
            </p>
          ) : null}
          <h1 className="font-heading text-4xl tracking-wide text-beige md:text-6xl">
            {safeText(title)}
          </h1>
          {description ? (
            <p
              className={cn(
                "mt-5 max-w-2xl text-sm leading-relaxed text-beige/75 md:text-base",
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
    <nav aria-label="Breadcrumb" className="mb-6 text-xs uppercase tracking-[0.16em] text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 ? <span>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-gold">
                {item.label}
              </Link>
            ) : (
              <span className="text-beige/80">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
