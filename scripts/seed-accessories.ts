/**
 * Upsert Accessories collection products into the dayaura database.
 * Run: npx tsx scripts/seed-accessories.ts
 *
 * Requires MONGODB_URI (e.g. mongodb://127.0.0.1:27017/dayaura)
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
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvLocal();

if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/dayaura";
}

const COLLECTION_DESC =
  "Elevate every workout and every day with DAYAURA accessories. Premium essentials designed to complement the full collection — from the Move Duffle Bag to the Performance Headband — with the same luxury activewear identity.";

type AccessoriesProduct = {
  name: string;
  slug: string;
  sku: string;
  categorySlug: string;
  price: number;
  compareAtPrice: number;
  shortDescription: string;
  description: string;
  materials: string;
  careInstructions: string;
  fitDetails: string;
  highlights: string[];
  colors: Array<{ name: string; hex: string; images?: string[] }>;
  sizes: Array<{ size: string; stock: number }>;
  images: string[];
  modelInfo?: string;
  hoverImage?: string;
  featureTabs?: Array<{ id: string; title: string; image: string }>;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  order: number;
};

function placeholder(label: string) {
  const text = encodeURIComponent(label);
  return `https://placehold.co/800x1000/1a1a1a/D4AF37/png?text=${text}&font=montserrat`;
}

const PRODUCTS: AccessoriesProduct[] = [
  {
    name: "DAYAURA Move Duffle Bag",
    slug: "dayaura-move-duffle-bag",
    sku: "DA-MOVE-DUFFLE",
    categorySlug: "bags",
    price: 49,
    compareAtPrice: 69,
    shortDescription:
      "Premium 55L Oxford duffle with shoe compartment and waterproof wet pocket — gym-to-travel organization without compromising style.",
    description: [
      "Designed for movement, travel, and everyday performance, the DAYAURA Move Duffle Bag keeps your essentials organized without compromising on style. Crafted from premium Oxford fabric, it features a spacious 55L interior, a dedicated shoe compartment, and a waterproof wet pocket that separates damp clothing from the rest of your gear.",
      "Whether you're heading to the gym, yoga, work, or a weekend getaway, this lightweight duffle is built to carry everything you need while maintaining a clean, premium aesthetic.",
    ].join("\n\n"),
    materials:
      "Premium wear-resistant Oxford fabric. Water-resistant exterior. Dimensions 43 × 26 × 24 cm. Capacity 55L. Approx. weight 410g.",
    careInstructions: [
      "Wipe clean with a damp cloth",
      "Mild soap if needed",
      "Air dry completely before storing",
      "Do not machine wash",
      "Do not tumble dry",
    ].join("\n"),
    fitDetails: "One Size — 43 × 26 × 24 cm · 55L capacity.",
    highlights: [
      "Premium wear-resistant Oxford fabric",
      "Water-resistant exterior",
      "Spacious 55L capacity",
      "Dedicated ventilated shoe compartment",
      "Waterproof wet & dry separation pocket",
      "Large main storage compartment",
      "Front quick-access zip pocket",
      "Side accessory pocket",
      "Adjustable removable shoulder strap",
      "Reinforced carry handles",
      "Durable metal zipper hardware",
      "Lightweight construction (Approx. 410g)",
      "Easy-to-clean fabric",
      "Odor-resistant interior",
      "Perfect for gym, travel, sports, yoga, and everyday use",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/products/dayaura-move-duffle-bag/black/01.png",
          "/images/products/dayaura-move-duffle-bag/black/02.png",
          "/images/products/dayaura-move-duffle-bag/black/03.png",
          "/images/products/dayaura-move-duffle-bag/black/04.png",
        ],
      },
      {
        name: "Navy Blue",
        hex: "#1B2A4A",
        images: [
          "/images/products/dayaura-move-duffle-bag/navy-blue/01.png",
          "/images/products/dayaura-move-duffle-bag/navy-blue/02.png",
          "/images/products/dayaura-move-duffle-bag/navy-blue/03.png",
          "/images/products/dayaura-move-duffle-bag/navy-blue/04.png",
        ],
      },
      {
        name: "Blush Pink",
        hex: "#E8C4C4",
        images: [
          "/images/products/dayaura-move-duffle-bag/blush-pink/01.png",
          "/images/products/dayaura-move-duffle-bag/blush-pink/02.png",
          "/images/products/dayaura-move-duffle-bag/blush-pink/03.png",
          "/images/products/dayaura-move-duffle-bag/blush-pink/04.png",
        ],
      },
    ],
    sizes: [{ size: "One Size", stock: 50 }],
    images: [
      "/images/products/dayaura-move-duffle-bag/black/01.png",
      "/images/products/dayaura-move-duffle-bag/black/02.png",
      "/images/products/dayaura-move-duffle-bag/black/03.png",
      "/images/products/dayaura-move-duffle-bag/black/04.png",
      "/images/products/dayaura-move-duffle-bag/navy-blue/01.png",
      "/images/products/dayaura-move-duffle-bag/navy-blue/02.png",
      "/images/products/dayaura-move-duffle-bag/navy-blue/03.png",
      "/images/products/dayaura-move-duffle-bag/navy-blue/04.png",
      "/images/products/dayaura-move-duffle-bag/blush-pink/01.png",
      "/images/products/dayaura-move-duffle-bag/blush-pink/02.png",
      "/images/products/dayaura-move-duffle-bag/blush-pink/03.png",
      "/images/products/dayaura-move-duffle-bag/blush-pink/04.png",
    ],
    hoverImage: "/images/products/dayaura-move-duffle-bag/black/01.png",
    featureTabs: [],
    isFeatured: true,
    isNewArrival: true,
    order: 1,
  },
  {
    name: "DAYAURA Performance Headband",
    slug: "dayaura-performance-headband",
    sku: "DTL-YF288",
    categorySlug: "accessories",
    price: 7.99,
    compareAtPrice: 12.99,
    shortDescription:
      "Lightweight moisture-wicking headband with soft four-way stretch — secure, non-slip comfort from warm-up to final rep.",
    description: [
      "Designed to keep you focused from your first warm-up to your final rep, the DAYAURA Performance Headband delivers lightweight comfort with dependable performance. Made from a premium nylon-spandex blend, it offers breathable, moisture-wicking support that keeps sweat under control while ensuring your hair stays comfortably in place.",
      "Its soft four-way stretch provides a secure, non-slip fit without feeling restrictive, making it the perfect companion for intense workouts, yoga sessions, outdoor runs, and everyday wear.",
      "Minimal, versatile, and finished with the signature DAYAURA logo, it's an essential accessory for every active lifestyle.",
    ].join("\n\n"),
    materials: "81% Nylon, 19% Spandex · 225 GSM.",
    careInstructions: [
      "Machine wash cold with similar colors",
      "Wash with mild detergent",
      "Do not bleach",
      "Do not tumble dry",
      "Air dry flat",
      "Do not iron",
      "Do not dry clean",
    ].join("\n"),
    fitDetails: "One Size Fits Most. Soft compression fit. Gentle on hair with no pulling.",
    highlights: [
      "Premium 81% Nylon & 19% Spandex performance fabric",
      "Lightweight 225 GSM construction",
      "Moisture-wicking technology",
      "Quick-drying performance",
      "Breathable fabric for all-day comfort",
      "Soft four-way stretch",
      "Comfortable compression fit",
      "Secure non-slip design",
      "Gentle on hair with no pulling",
      "Retains shape after repeated wear",
      "One size fits most",
      "Soft, smooth finish",
      "Easy-care fabric",
      "Minimal premium DAYAURA branding",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: ["/images/products/dayaura-performance-headband/black/01.png"],
      },
      {
        name: "Brown",
        hex: "#8B4A3A",
        images: ["/images/products/dayaura-performance-headband/brown/01.png"],
      },
      {
        name: "Grey",
        hex: "#6B6E73",
      },
      {
        name: "Blue",
        hex: "#5BA3D9",
        images: ["/images/products/dayaura-performance-headband/blue/01.png"],
      },
    ],
    sizes: [{ size: "One Size Fits Most", stock: 100 }],
    images: [
      "/images/products/dayaura-performance-headband/black/01.png",
      "/images/products/dayaura-performance-headband/blue/01.png",
      "/images/products/dayaura-performance-headband/brown/01.png",
    ],
    hoverImage: "/images/products/dayaura-performance-headband/black/01.png",
    isFeatured: true,
    isNewArrival: true,
    order: 2,
  },
];

async function main() {
  const { connectDB } = await import("../src/lib/mongodb");
  const Collection = (await import("../src/models/Collection")).default;
  const Category = (await import("../src/models/Category")).default;
  const Product = (await import("../src/models/Product")).default;

  await connectDB();

  let collection = await Collection.findOne({ slug: "accessories" });
  if (!collection) {
    collection = await Collection.create({
      name: "Accessories",
      slug: "accessories",
      description: COLLECTION_DESC,
      image: "/images/collections/accessories.png",
      imageAlt: "Accessories collection — DAYAURA",
      order: 6,
      isActive: true,
      seoTitle: "Accessories | DAYAURA",
      seoDescription: COLLECTION_DESC,
    });
    console.log("✓ Created Accessories collection");
  } else {
    await Collection.findByIdAndUpdate(collection._id, {
      name: "Accessories",
      description: COLLECTION_DESC,
      image: "/images/collections/accessories.png",
      seoTitle: "Accessories | DAYAURA",
      seoDescription: COLLECTION_DESC,
      isActive: true,
      order: 6,
    });
    console.log("↷ Updated Accessories collection");
  }

  const categoryDefs = [
    { name: "Bags", slug: "bags", order: 10 },
    { name: "Accessories", slug: "accessories", order: 11 },
  ];

  const categoryMap = new Map<string, mongoose.Types.ObjectId>();
  for (const cat of categoryDefs) {
    let existing = await Category.findOne({ slug: cat.slug });
    if (!existing) {
      existing = await Category.create({
        ...cat,
        description: `Shop DAYAURA ${cat.name.toLowerCase()} designed for confidence through movement.`,
        isActive: true,
      });
      console.log(`✓ Created category: ${cat.name}`);
    }
    categoryMap.set(cat.slug, existing._id);
  }

  let upserted = 0;

  for (const p of PRODUCTS) {
    const images = p.images.filter(Boolean);

    const payload = {
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      shortDescription: p.shortDescription,
      description: p.description,
      collection: collection._id,
      category: categoryMap.get(p.categorySlug)!,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images,
      hoverImage: p.hoverImage || images[0],
      colors: p.colors,
      sizes: p.sizes,
      materials: p.materials,
      careInstructions: p.careInstructions,
      fitDetails: p.fitDetails,
      hiddenMessage: "",
      highlights: p.highlights,
      modelInfo: p.modelInfo || "",
      featureTabs: p.featureTabs || [],
      isFeatured: p.isFeatured ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isOnSale: p.compareAtPrice > p.price,
      status: "published" as const,
      order: p.order,
      seoTitle: `${p.name} | Accessories | DAYAURA`,
      seoDescription: p.shortDescription,
    };

    const existing = await Product.findOne({
      $or: [{ slug: p.slug }, { sku: p.sku }],
    });

    if (existing) {
      const payloadHasRealImages = images.some(
        (img) => img.startsWith("/images/") && !img.includes("placehold.co")
      );
      const keepImages = payloadHasRealImages
        ? images
        : existing.images?.some(
              (img: string) => img && !img.includes("placehold.co")
            )
          ? existing.images
          : images;

      const keepColors = p.colors.map((c) => {
        const prev = existing.colors?.find(
          (ec: { name: string; images?: string[] }) =>
            ec.name.toLowerCase() === c.name.toLowerCase() ||
            ec.name.toLowerCase().includes(c.name.toLowerCase()) ||
            c.name.toLowerCase().includes(ec.name.toLowerCase())
        );
        return {
          ...c,
          images:
            c.images?.length
              ? c.images
              : prev?.images?.length
                ? prev.images
                : undefined,
        };
      });

      await Product.findByIdAndUpdate(existing._id, {
        ...payload,
        images: keepImages,
        colors: keepColors,
        hoverImage: payloadHasRealImages
          ? payload.hoverImage
          : existing.hoverImage &&
              !String(existing.hoverImage).includes("placehold.co")
            ? existing.hoverImage
            : payload.hoverImage,
      });
      console.log(`↻ Updated: ${p.name}`);
    } else {
      await Product.create(payload);
      console.log(`✓ Created: ${p.name}`);
    }
    upserted++;
  }

  const keepSlugs = PRODUCTS.map((p) => p.slug);
  const removedExtras = await Product.deleteMany({
    collection: collection._id,
    slug: { $nin: keepSlugs },
  });
  if (removedExtras.deletedCount) {
    console.log(
      `✗ Removed non-catalog Accessories products: ${removedExtras.deletedCount}`
    );
  }

  console.log("\n────────────────────────────────────────");
  console.log(`Accessories upsert complete`);
  console.log(`  Products upserted: ${upserted}`);
  console.log(`  Extra removed:     ${removedExtras.deletedCount || 0}`);
  console.log(`  Catalog size:      ${keepSlugs.length}`);
  console.log(`  DB:                dayaura`);
  console.log("────────────────────────────────────────");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
