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

const patches = [
  {
    slug: "scallop-one-shoulder-bra",
    label: "Scallop One-Shoulder Bra",
    colors: [
      {
        name: "Olive Green",
        hex: "#556B2F",
        images: [
          "/images/products/scallop-one-shoulder-bra/olive-green/01.png",
          "/images/products/scallop-one-shoulder-bra/olive-green/02.png",
        ],
      },
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/products/scallop-one-shoulder-bra/black/03.png",
          "/images/products/scallop-one-shoulder-bra/black/04.png",
        ],
      },
    ],
    images: [
      "/images/products/scallop-one-shoulder-bra/olive-green/01.png",
      "/images/products/scallop-one-shoulder-bra/olive-green/02.png",
    ],
    hoverImage:
      "/images/products/scallop-one-shoulder-bra/olive-green/02.png",
  },
  {
    slug: "aurawave-sculpt-leggings",
    label: "Sculpt Leggings",
    colors: [
      {
        name: "Olive Green",
        hex: "#556B2F",
        images: [
          "/images/products/aurawave-sculpt-leggings/olive-green/01.png",
          "/images/products/aurawave-sculpt-leggings/olive-green/02.png",
        ],
      },
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/products/aurawave-sculpt-leggings/black/01.png",
          "/images/products/aurawave-sculpt-leggings/black/02.png",
          "/images/products/aurawave-sculpt-leggings/black/03.png",
        ],
      },
    ],
    images: [
      "/images/products/aurawave-sculpt-leggings/olive-green/01.png",
      "/images/products/aurawave-sculpt-leggings/olive-green/02.png",
    ],
    hoverImage: "/images/products/aurawave-sculpt-leggings/olive-green/02.png",
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI required");

  await mongoose.connect(uri);

  for (const patch of patches) {
    const result = await mongoose.connection.db!.collection("products").updateOne(
      { slug: patch.slug },
      {
        $set: {
          colors: patch.colors,
          images: patch.images,
          hoverImage: patch.hoverImage,
        },
      }
    );
    console.log(
      `✓ ${patch.label} (${patch.slug}) — ${result.modifiedCount} updated`
    );
    console.log(`  display: ${patch.images[0]}`);
    console.log(`  hover:   ${patch.hoverImage}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
