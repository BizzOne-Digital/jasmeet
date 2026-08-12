/** Short one-line copy for collection cards on the homepage. */
export const COLLECTION_DESCRIPTIONS: Record<string, string> = {
  aurawave: "Fluid silhouettes made to move.",
  auraimpact: "Sculpting performance for every workout.",
  auraflow: "Soft movement. Everyday comfort.",
  auramesh: "Breathable support with sculpting performance.",
  outerwear: "Refined layers for movement and everyday wear.",
  accessories: "DAYAURA essentials for every move.",
};

export function getCollectionDescription(
  slug: string,
  name: string,
  description?: string | null
): string {
  return (
    COLLECTION_DESCRIPTIONS[slug] ||
    description?.trim() ||
    `Discover the ${name} collection from DAYAURA.`
  );
}
