/**
 * Create or update the admin user only (safe for production Atlas).
 * Run locally with Atlas URI in .env.local:
 *   npm run seed:admin
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.warn("⚠ .env.local not found — relying on existing process.env");
    return;
  }
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
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvLocal();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local");
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI in .env.local (use your Atlas URI for production)");
  }

  const { connectDB } = await import("../src/lib/mongodb");
  const AdminUser = (await import("../src/models/AdminUser")).default;

  await connectDB();
  const hashed = await bcrypt.hash(adminPassword, 12);

  const existing = await AdminUser.findOne({ email: adminEmail });
  if (existing) {
    await AdminUser.updateOne(
      { email: adminEmail },
      { $set: { password: hashed, name: existing.name || "DAYAURA Admin" } }
    );
    console.log(`✓ Admin password updated for ${adminEmail}`);
  } else {
    await AdminUser.create({
      email: adminEmail,
      password: hashed,
      name: "DAYAURA Admin",
    });
    console.log(`✓ Admin created: ${adminEmail}`);
  }

  const mongoose = (await import("mongoose")).default;
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
