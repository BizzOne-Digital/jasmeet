/**
 * Verify MongoDB connectivity and DAYAURA data (local or Atlas).
 * Run: npx tsx scripts/verify-atlas.ts
 * Atlas: set MONGODB_URI in .env.local to your mongodb+srv://... string first.
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

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("FAIL: MONGODB_URI is not set.");
    process.exit(1);
  }

  const isAtlas = uri.includes("mongodb+srv://");
  console.log(`Connecting to ${isAtlas ? "MongoDB Atlas" : "MongoDB"}…`);

  const { connectDB } = await import("../src/lib/mongodb");
  await connectDB();
  console.log("OK: Connected");

  const mongoose = (await import("mongoose")).default;
  const db = mongoose.connection.db;
  if (!db) {
    console.error("FAIL: No database handle");
    process.exit(1);
  }

  const dbName = db.databaseName;
  console.log(`Database: ${dbName}`);

  const collections = [
    "products",
    "collections",
    "categories",
    "sitesettings",
    "orders",
    "pages",
    "pagesections",
    "storeduploads",
    "galleryitems",
    "faqs",
    "adminusers",
  ];

  console.log("\nCollections:");
  for (const name of collections) {
    try {
      const count = await db.collection(name).countDocuments();
      const status = count > 0 ? "OK" : "EMPTY";
      console.log(`  ${status.padEnd(5)} ${name}: ${count}`);
    } catch {
      console.log(`  MISS  ${name}: (not found)`);
    }
  }

  const Product = (await import("../src/models/Product")).default;
  const published = await Product.countDocuments({ status: "published" });
  console.log(`\nPublished products: ${published}`);

  const AdminUser = (await import("../src/models/AdminUser")).default;
  const adminCount = await AdminUser.countDocuments();
  console.log(`Admin users: ${adminCount}${adminCount === 0 ? " (run npm run seed:admin)" : ""}`);

  const StoredUpload = (await import("../src/models/StoredUpload")).default;
  await StoredUpload.syncIndexes();
  console.log("OK: StoredUpload indexes synced (uploads ready for Atlas/Vercel)");

  const { getSiteSettings } = await import("../src/lib/data/settings");
  const settings = await getSiteSettings();
  console.log(
    `\nSite settings: shipping $${settings.standardShippingRate}, free over $${settings.shippingThreshold}, local delivery ${settings.localDeliveryEnabled ? "on" : "off"}`
  );

  console.log("\nAll checks passed. Safe to deploy with this MONGODB_URI.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\nFAIL:", err instanceof Error ? err.message : err);
  if (String(process.env.MONGODB_URI).includes("mongodb+srv")) {
    console.error(
      "\nAtlas tips:\n" +
        "  1. Network Access → allow 0.0.0.0/0 (or Vercel IPs)\n" +
        "  2. Database User with read/write on this database\n" +
        "  3. URI format: mongodb+srv://user:pass@cluster.mongodb.net/dayaura?retryWrites=true&w=majority"
    );
  }
  process.exit(1);
});
