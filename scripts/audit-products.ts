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

async function main() {
  const { connectDB } = await import("../src/lib/mongodb");
  const Product = (await import("../src/models/Product")).default;
  const Collection = (await import("../src/models/Collection")).default;

  await connectDB();
  const cols = await Collection.find({}).lean();
  const colMap = Object.fromEntries(cols.map((c) => [String(c._id), c.slug]));

  const products = await Product.find({})
    .select("name slug status collection sku createdAt")
    .sort({ slug: 1 })
    .lean();

  console.log(`Total: ${products.length}`);
  console.log(`Published: ${products.filter((p) => p.status === "published").length}`);
  console.log(`Draft: ${products.filter((p) => p.status === "draft").length}`);
  console.log("---");
  for (const p of products) {
    const col = colMap[String(p.collection)] || "?";
    console.log(`${String(p.status || "unknown").padEnd(9)} ${col.padEnd(14)} ${p.slug}`);
  }

  const mongoose = (await import("mongoose")).default;
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
