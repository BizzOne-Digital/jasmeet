/**
 * Enable pre-order on all products (OOS variants can still be purchased).
 * Run: npm run enable:preorder
 */
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

const DEFAULT_LEAD_TIME = "Pre-Order – Ships in 2–3 weeks";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required (.env.local)");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database connection");

  const products = db.collection("products");

  const missingLeadTime = await products.updateMany(
    {
      $or: [
        { preOrderLeadTime: { $exists: false } },
        { preOrderLeadTime: null },
        { preOrderLeadTime: "" },
      ],
    },
    { $set: { preOrderLeadTime: DEFAULT_LEAD_TIME } }
  );

  const enabled = await products.updateMany(
    { allowPreOrder: { $ne: true } },
    { $set: { allowPreOrder: true, preOrderLeadTime: DEFAULT_LEAD_TIME } }
  );

  const total = await products.countDocuments();
  const preOrderCount = await products.countDocuments({ allowPreOrder: true });

  console.log(`✓ Pre-order enabled on ${enabled.modifiedCount} product(s)`);
  console.log(`✓ Lead time set on ${missingLeadTime.modifiedCount} product(s)`);
  console.log(`  ${preOrderCount}/${total} products now allow pre-order`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
