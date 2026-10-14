/** Shared DAYAURA admin portal design tokens (Tailwind class strings). */

export const adminPageClass = "flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-10";

export const adminCardClass =
  "rounded-lg border border-white/[0.08] bg-[#0a0a0a]";

export const adminCardInnerClass = "p-5 sm:p-6";

export const adminSectionTitleClass =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]/85";

export const adminPageTitleClass =
  "font-display text-[2rem] leading-tight tracking-wide text-white sm:text-[2.35rem]";

export const adminPageSubtitleClass = "mt-1.5 text-sm text-zinc-500";

export const adminLabelClass =
  "mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500";

export const adminFieldClass =
  "w-full rounded-md border border-white/[0.08] bg-black px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#D4AF37]/45 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/20";

export const adminSelectClass =
  "rounded-md border border-white/[0.08] bg-black px-3 py-2.5 text-sm text-zinc-100 focus:border-[#D4AF37]/45 focus:outline-none";

export const adminPrimaryBtnClass =
  "inline-flex items-center justify-center gap-2 rounded-md bg-[#D4AF37] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-[#e5c558] disabled:opacity-50";

export const adminGhostBtnClass =
  "inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-transparent px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-200 transition hover:border-white/30 hover:text-white";

export const adminSearchClass =
  "w-full rounded-md border border-white/[0.08] bg-black py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#D4AF37]/45 focus:outline-none";

export const adminStatCardClass =
  "rounded-lg border border-white/[0.08] bg-[#0a0a0a] p-5 transition hover:border-[#D4AF37]/25 sm:p-6";

export const adminStatLabelClass =
  "text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500";

export const adminStatValueClass =
  "mt-3 font-display text-4xl tracking-wide text-white sm:text-[2.75rem]";

export const adminLinkActionClass =
  "text-[11px] font-medium uppercase tracking-[0.1em] text-[#D4AF37] transition hover:text-[#e5c558]";

export const adminTabClass = (active: boolean) =>
  active
    ? "border border-[#D4AF37]/50 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#D4AF37]"
    : "border border-transparent px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 transition hover:text-zinc-300";
