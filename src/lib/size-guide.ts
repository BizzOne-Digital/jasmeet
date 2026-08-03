export interface SizeGuideSection {
  title?: string;
  columns: string[];
  rows: Array<{ size: string; values: string[] }>;
}

export interface SizeGuideData {
  unit?: string;
  /** Single-table guide (e.g. Scallop Dress) */
  columns?: string[];
  rows?: Array<{ size: string; values: string[] }>;
  /** Multi-table guide (e.g. Bra + Trousers set) */
  sections?: SizeGuideSection[];
}

export function sizeGuideHasContent(guide?: SizeGuideData | null): boolean {
  if (!guide) return false;
  if (guide.sections?.some((s) => s.columns?.length && s.rows?.length)) {
    return true;
  }
  return !!(guide.columns?.length && guide.rows?.length);
}

function isTopPieceTitle(title: string): boolean {
  const t = title.toLowerCase();
  return (
    t.includes("bra") ||
    t.includes("vest") ||
    t.includes("sleeve") ||
    t.includes("top") ||
    t.includes("tank") ||
    t.includes("hoodie")
  );
}

function isBottomPieceTitle(title: string): boolean {
  const t = title.toLowerCase();
  return (
    t.includes("trouser") ||
    t.includes("pant") ||
    t.includes("legging") ||
    t.includes("short")
  );
}

/** Dual size selection for two-piece sets (Bra/Trousers, Long Sleeves/Trousers, etc.) */
export function isBraTrouserSetGuide(guide?: SizeGuideData | null): boolean {
  if (!guide?.sections?.length) return false;
  const titles = guide.sections.map((s) => s.title || "");
  const hasTop = titles.some(isTopPieceTitle);
  const hasBottom = titles.some(isBottomPieceTitle);
  return hasTop && hasBottom;
}

export function getDualSizeLabels(guide?: SizeGuideData | null): {
  top: string;
  bottom: string;
} {
  const sections = guide?.sections || [];
  const topSection = sections.find((s) => isTopPieceTitle(s.title || ""));
  const bottomSection = sections.find((s) => isBottomPieceTitle(s.title || ""));
  return {
    top: topSection?.title?.trim() || "Top",
    bottom: bottomSection?.title?.trim() || "Bottom",
  };
}
