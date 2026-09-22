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

const base = "/images/products/auraimpact-sculpt-flared-leggings/black";
const images = [`${base}/04.png`, `${base}/03.png`];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI required");

  await mongoose.connect(uri);
  const result = await mongoose.connection.db!.collection("products").updateOne(
    { slug: "auraimpact-sculpt-flared-leggings" },
    {
      $set: {
        colors: [
          {
            name: "Black",
            hex: "#000000",
            images,
          },
        ],
        images,
        hoverImage: `${base}/03.png`,
      },
    }
  );

  console.log(
    `✓ AuraImpact Sculpt Flared Leggings — ${result.modifiedCount} product updated`
  );
  console.log(`  display: ${images[0]}`);
  console.log(`  hover:   ${images[1]}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
