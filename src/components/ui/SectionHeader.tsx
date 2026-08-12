import type { ReactNode } from "react";
import { cn, safeText } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  heading,
  subheading,
  align = "left",
  className,
  children,
}: {
  eyebrow?: string | null;
  heading: string;
  subheading?: string | null;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-8 md:mb-12",
        align === "center" && "mx-auto max-w-2xl text-center",
        align === "left" && "max-w-2xl",
        className
      )}
    >
      {eyebrow ? (
        <p className="eyebrow mb-4">{safeText(eyebrow)}</p>
      ) : null}
      <h2 className="display-title text-balance">{safeText(heading)}</h2>
      {subheading ? (
        <p className="body-muted mt-5 max-w-xl text-balance md:mt-6">
          {safeText(subheading)}
        </p>
      ) : null}
      {children}
    </div>
  );
}
