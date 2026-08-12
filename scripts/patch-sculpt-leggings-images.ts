import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import mongoose from "mongoose";

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

const base = "/images/products/auraimpact-sculpt-leggings";

const colors = [
  {
    name: "Black",
    hex: "#000000",
    images: [`${base}/black/01.png`, `${base}/black/02.png`],
  },
  {
    name: "Brown",
    hex: "#5C4033",
    images: [`${base}/brown/01.png`, `${base}/brown/02.png`],
  },
  {
    name: "Shark Grey",
    hex: "#6B6E73",
    images: [`${base}/shark-grey/01.png`, `${base}/shark-grey/02.png`],
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI required");

  await mongoose.connect(uri);
  const result = await mongoose.connection.db!.collection("products").updateOne(
    { slug: "auraimpact-sculpt-leggings" },
    { $set: { colors, images: colors[0].images } }
  );

  console.log(`✓ AuraImpact Sculpt Leggings — ${result.modifiedCount} product updated`);
  for (const c of colors) {
    console.log(`  ${c.name}: ${c.images.join(", ")}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
