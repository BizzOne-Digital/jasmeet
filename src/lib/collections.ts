/** Fallback copy when a collection has no CMS description. */
export const COLLECTION_DESCRIPTIONS: Record<string, string> = {
  aurawave:
    "Fluid silhouettes and sculpted movement for studio sessions and elevated everyday wear.",
  auraimpact:
    "High-performance sculpting activewear engineered for training intensity and everyday confidence.",
  auraflow:
    "Effortless movement and studio-to-street versatility — modern luxury loungewear for everyday comfort.",
  auramesh:
    "Designed for high-performance training with breathable mesh panels and sculpting support.",
  outerwear:
    "Refined athletic layers for cool-weather movement — polished protection from studio to street.",
  accessories:
    "Premium essentials designed to complement the full collection — from the Move Duffle Bag to the Performance Headband.",
};

export function getCollectionDescription(
  slug: string,
  name: string,
  description?: string | null
): string {
  return (
    description?.trim() ||
    COLLECTION_DESCRIPTIONS[slug] ||
    `Discover the ${name} collection from DAYAURA.`
  );
}
