/**
 * Upsert Outerwear collection products into the dayaura database.
 * Run: npx tsx scripts/seed-outerwear.ts
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

const HIDDEN =
  '"THE FIRE TO KEEP GOING." — Every DAYAURA piece features a hidden motivational message inside, designed to remind you of your strength every time you wear it.';

const CARE_HOODIE = [
  "Machine wash cold",
  "Wash with similar colours",
  "Do not bleach",
  "Tumble dry low",
  "Hang dry for best results",
  "Cool iron if needed",
  "Do not iron directly on the logo",
].join("\n");

type OuterwearProduct = {
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
  sizeGuide?: {
    unit: string;
    columns?: string[];
    rows?: Array<{ size: string; values: string[] }>;
    sections?: Array<{
      title?: string;
      columns: string[];
      rows: Array<{ size: string; values: string[] }>;
    }>;
  };
  hoverImage?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  order: number;
};

function stockSMLXL(stock = 30) {
  return [
    { size: "S", stock },
    { size: "M", stock },
    { size: "L", stock },
    { size: "XL", stock },
  ];
}

function placeholder(label: string) {
  const text = encodeURIComponent(label);
  return `https://placehold.co/800x1000/1a1a1a/D4AF37/png?text=${text}&font=montserrat`;
}

const COLLECTION_DESC =
  "Refined athletic layers for cool-weather movement — polished protection from studio to street.";

const PRODUCTS: OuterwearProduct[] = [
  {
    name: "DAYAURA Studio Half-Zip Hoodie",
    slug: "dayaura-studio-half-zip-hoodie",
    sku: "DTL-EWQD006",
    categorySlug: "hoodies",
    price: 45,
    compareAtPrice: 59,
    shortDescription:
      "Relaxed oversized cropped half-zip hoodie in premium soft-touch fabric — lightweight warmth for gym-to-street layering.",
    description: [
      "Designed for movement, comfort, and everyday versatility, the DAYAURA Studio Half-Zip Hoodie blends modern style with functional performance. Crafted from a premium polyester-spandex blend, it offers a soft-touch feel, lightweight warmth, and breathable comfort that makes it ideal for every season.",
      "The oversized cropped fit provides a relaxed silhouette while the half-zip neckline allows for adjustable coverage and ventilation. An oversized hood and spacious kangaroo pocket add practicality, making this hoodie perfect for layering before workouts, after training sessions, or throughout your everyday routine.",
      "Finished with DAYAURA's signature hidden motivational message, it's designed to inspire confidence every time you wear it.",
    ].join("\n\n"),
    materials:
      "Premium Polyester & Spandex Blend · 210 GSM. Soft feel, lightweight warmth, flexibility, and long-lasting durability.",
    careInstructions: CARE_HOODIE,
    fitDetails:
      "Oversized fit. Cropped length. True to size. Designed for layering.",
    highlights: [
      "Premium polyester and spandex blend",
      "Soft-touch brushed fabric",
      "Lightweight warmth",
      "Breathable construction",
      "Relaxed oversized fit",
      "Cropped modern silhouette",
      "Half-zip high neckline",
      "Adjustable hood",
      "Spacious kangaroo pocket",
      "Ribbed cuffs and hem",
      "Flexible four-way comfort",
      "Easy layering piece",
      "Studio-to-street versatility",
      "Premium DAYAURA logo detailing",
    ],
    colors: [
      {
        name: "Blue",
        hex: "#5B7FA6",
        images: [
          "/images/products/dayaura-studio-half-zip-hoodie/blue/01.png",
          "/images/products/dayaura-studio-half-zip-hoodie/blue/02.png",
          "/images/products/dayaura-studio-half-zip-hoodie/blue/03.png",
          "/images/products/dayaura-studio-half-zip-hoodie/blue/04.png",
        ],
      },
      {
        name: "Olive Green",
        hex: "#6B7040",
        images: [
          "/images/products/dayaura-studio-half-zip-hoodie/olive-green/01.png",
          "/images/products/dayaura-studio-half-zip-hoodie/olive-green/02.png",
          "/images/products/dayaura-studio-half-zip-hoodie/olive-green/03.png",
          "/images/products/dayaura-studio-half-zip-hoodie/olive-green/04.png",
          "/images/products/dayaura-studio-half-zip-hoodie/olive-green/05.png",
          "/images/products/dayaura-studio-half-zip-hoodie/olive-green/06.png",
        ],
      },
      {
        name: "Beige",
        hex: "#C8B89A",
        images: [
          "/images/products/dayaura-studio-half-zip-hoodie/beige/01.png",
          "/images/products/dayaura-studio-half-zip-hoodie/beige/02.png",
          "/images/products/dayaura-studio-half-zip-hoodie/beige/03.png",
          "/images/products/dayaura-studio-half-zip-hoodie/beige/04.png",
        ],
      },
    ],
    sizes: stockSMLXL(),
    images: [
      "/images/products/dayaura-studio-half-zip-hoodie/blue/01.png",
      "/images/products/dayaura-studio-half-zip-hoodie/blue/02.png",
      "/images/products/dayaura-studio-half-zip-hoodie/blue/03.png",
      "/images/products/dayaura-studio-half-zip-hoodie/blue/04.png",
    ],
    hoverImage:
      "/images/products/dayaura-studio-half-zip-hoodie/blue/02.png",
    sizeGuide: {
      unit: "CM",
      columns: ["Length", "Shoulder", "Chest", "Hem", "Sleeve"],
      rows: [
        { size: "S", values: ["55", "58.8", "113", "92", "51"] },
        { size: "M", values: ["57", "60", "118", "84", "52"] },
        { size: "L", values: ["59", "61.2", "123", "102", "53"] },
        { size: "XL", values: ["61", "63.4", "131", "110", "54"] },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 1,
  },
];

async function main() {
  const { connectDB } = await import("../src/lib/mongodb");
  const Collection = (await import("../src/models/Collection")).default;
  const Category = (await import("../src/models/Category")).default;
  const Product = (await import("../src/models/Product")).default;

  await connectDB();

  let collection = await Collection.findOne({ slug: "outerwear" });
  if (!collection) {
    collection = await Collection.create({
      name: "Outerwear",
      slug: "outerwear",
      description: COLLECTION_DESC,
      image: "/images/collections/outerwear.png",
      imageAlt: "Outerwear collection — DAYAURA",
      order: 5,
      isActive: true,
      seoTitle: "Outerwear | DAYAURA",
      seoDescription: COLLECTION_DESC,
    });
    console.log("✓ Created Outerwear collection");
  } else {
    await Collection.findByIdAndUpdate(collection._id, {
      name: "Outerwear",
      description: COLLECTION_DESC,
      image: "/images/collections/outerwear.png",
      seoTitle: "Outerwear | DAYAURA",
      seoDescription: COLLECTION_DESC,
      isActive: true,
      order: 5,
    });
    console.log("↷ Updated Outerwear collection");
  }

  const categoryDefs = [
    { name: "Jackets", slug: "jackets", order: 6 },
    { name: "Hoodies", slug: "hoodies", order: 7 },
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

  // Prefer hoodies category if it exists; fall back to jackets
  const hoodieCat =
    categoryMap.get("hoodies") || categoryMap.get("jackets")!;

  let upserted = 0;

  for (const p of PRODUCTS) {
    const images = p.images.filter(Boolean);
    const categoryId =
      categoryMap.get(p.categorySlug) || hoodieCat;

    const payload = {
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      shortDescription: p.shortDescription,
      description: p.description,
      collection: collection._id,
      category: categoryId,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images,
      hoverImage: p.hoverImage || images[0],
      colors: p.colors,
      sizes: p.sizes,
      materials: p.materials,
      careInstructions: p.careInstructions,
      fitDetails: p.fitDetails,
      hiddenMessage: HIDDEN,
      highlights: p.highlights,
      modelInfo: p.modelInfo || "",
      sizeGuide: p.sizeGuide,
      isFeatured: p.isFeatured ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isOnSale: p.compareAtPrice > p.price,
      status: "published" as const,
      order: p.order,
      seoTitle: `${p.name} | Outerwear | DAYAURA`,
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
          (ec: { name: string; images?: string[] }) => ec.name === c.name
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
      `✗ Removed non-catalog Outerwear products: ${removedExtras.deletedCount}`
    );
  }

  console.log("\n────────────────────────────────────────");
  console.log(`Outerwear upsert complete`);
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
