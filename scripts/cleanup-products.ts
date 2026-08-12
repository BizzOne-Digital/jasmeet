/**
 * Keep only the 26 canonical DAYAURA products (collection seed scripts).
 * Removes legacy placeholder products from the main seed.ts run.
 *
 * Run: npm run cleanup:products
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const raw of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

/** Products from seed-aurawave, auraflow, auraimpact, auramesh, outerwear, accessories. */
export const CANONICAL_PRODUCT_SLUGS = [
  "aurawave-sculpt-leggings",
  "scallop-dress",
  "scallop-one-shoulder-set",
  "scallop-one-shoulder-bra",
  "scallop-halter-flare-set",
  "scallop-halter-bra",
  "flared-leggings",
  "off-shoulder-lounge-set",
  "auraflow-sculpt-flare-set",
  "auraflow-cozy-lounge-set",
  "auraflow-studio-pants",
  "auraimpact-sculpt-shorts",
  "auraimpact-sculpt-leggings",
  "auraimpact-sculpt-bra",
  "auraimpact-performance-tee",
  "auraimpact-performance-jacket",
  "auraimpact-halter-tank",
  "auraimpact-sculpt-flared-leggings",
  "auramesh-high-neck-set",
  "mesh-sculpt-legging-set",
  "mesh-high-neck-sports-bra",
  "mesh-sculpt-shorts",
  "mesh-sculpt-leggings",
  "dayaura-studio-half-zip-hoodie",
  "dayaura-move-duffle-bag",
  "dayaura-performance-headband",
] as const;

async function main() {
  const { connectDB } = await import("../src/lib/mongodb");
  const Product = (await import("../src/models/Product")).default;

  await connectDB();

  const all = await Product.find({}).select("slug name status").lean();
  const canonical = new Set<string>(CANONICAL_PRODUCT_SLUGS);

  const toRemove = all.filter((p) => !canonical.has(p.slug));
  if (toRemove.length) {
    const slugs = toRemove.map((p) => p.slug);
    const result = await Product.deleteMany({ slug: { $in: slugs } });
    console.log(`✗ Removed ${result.deletedCount} non-catalog products:`);
    for (const p of toRemove) {
      console.log(`    - ${p.slug}`);
    }
  } else {
    console.log("✓ No extra products to remove");
  }

  const publishResult = await Product.updateMany(
    { slug: { $in: [...canonical] } },
    { $set: { status: "published" } }
  );
  console.log(`✓ Ensured published status on ${publishResult.modifiedCount} products`);

  const remaining = await Product.countDocuments();
  const published = await Product.countDocuments({ status: "published" });
  console.log(`\nDatabase now: ${remaining} products (${published} published)`);
  console.log("Website storefront shows published products only.");

  const mongoose = (await import("mongoose")).default;
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
