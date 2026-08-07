/**
 * Upsert AuraMesh collection products into the dayaura database.
 * Run: npx tsx scripts/seed-auramesh.ts
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
  "Every DAYAURA piece features a hidden motivational message inside, designed to remind you of your strength every time you wear it.";

const CARE_STANDARD = [
  "Machine wash cold",
  "Wash with similar colors",
  "Do not bleach",
  "Tumble dry low or hang dry",
  "Cool iron if needed",
].join("\n");

type AuraMeshProduct = {
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

function stockSML(stock = 30) {
  return [
    { size: "S", stock },
    { size: "M", stock },
    { size: "L", stock },
  ];
}

function placeholder(label: string) {
  const text = encodeURIComponent(label);
  return `https://placehold.co/800x1000/1a1a1a/D4AF37/png?text=${text}&font=montserrat`;
}

const PRODUCTS: AuraMeshProduct[] = [
  {
    name: "AuraMesh High-Neck Set",
    slug: "auramesh-high-neck-set",
    sku: "DA-AM-HN-SET",
    categorySlug: "sets",
    price: 65,
    compareAtPrice: 79,
    shortDescription:
      "High-neck mesh sports bra with high-waisted sculpting shorts — breathable support for high-performance training.",
    description:
      "Designed for high-performance training, the AuraMesh High-Neck Set combines breathable mesh panels with sculpting support for a sleek, confident fit. Featuring a supportive high-neck sports bra and high-waisted shorts, this premium set moves with you through every workout while delivering exceptional comfort, confidence, and style.",
    materials: "75% Nylon, 25% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. Sculpting compression fit. High-rise shorts. Supportive high-neck sports bra. Model wears size Small.",
    highlights: [
      "High-neck supportive sports bra",
      "Breathable mesh panel detailing",
      "High-waisted sculpting shorts",
      "Four-way stretch for unrestricted movement",
      "Moisture-wicking and quick-drying fabric",
      "Soft, lightweight feel",
      "High-resilience fabric that maintains its shape",
      "Breathable design for enhanced airflow",
      "Perfect for gym training, running, yoga, Pilates, and everyday activewear",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/products/auramesh-high-neck-set/black/01.png",
          "/images/products/auramesh-high-neck-set/black/02.png",
          "/images/products/auramesh-high-neck-set/black/03.png",
        ],
      },
      {
        name: "White",
        hex: "#FFFFFF",
        images: [
          "/images/products/auramesh-high-neck-set/white/01.png",
          "/images/products/auramesh-high-neck-set/white/02.png",
          "/images/products/auramesh-high-neck-set/white/03.png",
        ],
      },
    ],
    sizes: stockSML(),
    images: [
      "/images/products/auramesh-high-neck-set/black/01.png",
      "/images/products/auramesh-high-neck-set/black/02.png",
      "/images/products/auramesh-high-neck-set/black/03.png",
      "/images/products/auramesh-high-neck-set/white/01.png",
      "/images/products/auramesh-high-neck-set/white/02.png",
      "/images/products/auramesh-high-neck-set/white/03.png",
    ],
    hoverImage: "/images/products/auramesh-high-neck-set/black/02.png",
    sizeGuide: {
      unit: "CM",
      sections: [
        {
          title: "Vest",
          columns: ["Clothes length", "Chest", "Waistline"],
          rows: [
            { size: "S", values: ["31.5", "69", "60"] },
            { size: "M", values: ["33.5", "73", "64"] },
            { size: "L", values: ["34.5", "77", "68"] },
            { size: "XL", values: ["35.5", "81", "72"] },
          ],
        },
        {
          title: "Shorts",
          columns: ["Clothes length", "Waistline", "Hip", "Slack bottom"],
          rows: [
            { size: "S", values: ["34", "54", "71", "37"] },
            { size: "M", values: ["35", "58", "75", "39"] },
            { size: "L", values: ["36", "62", "79", "41"] },
            { size: "XL", values: ["37", "66", "83", "42"] },
          ],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 1,
  },
  {
    name: "Mesh Sculpt Legging Set",
    slug: "mesh-sculpt-legging-set",
    sku: "DA-AM-LEG-SET",
    categorySlug: "sets",
    price: 75,
    compareAtPrice: 89,
    shortDescription:
      "High-neck sports bra with high-waisted mesh sculpt leggings — breathable panels and a flattering silhouette.",
    description:
      "Built for performance and designed to flatter, the Mesh Sculpt Legging Set features breathable mesh panels and a sculpting silhouette that moves with your body. The supportive high-neck sports bra and high-waisted leggings provide all-day comfort, confidence, and flexibility—perfect for intense workouts or elevated everyday wear.",
    materials: "75% Nylon, 25% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. High-support sports bra. High-rise sculpting leggings. Four-way stretch compression fit. Model wears size Small.",
    highlights: [
      "Supportive high-neck sports bra",
      "Sculpting high-waisted leggings",
      "Signature breathable mesh panel design",
      "Four-way stretch for unrestricted movement",
      "Moisture-wicking and quick-drying fabric",
      "Soft, lightweight feel",
      "High-resilience fabric that retains its shape",
      "Breathable and comfortable",
      "Squat-proof coverage",
      "Perfect for gym training, running, yoga, Pilates, sports, and everyday wear",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/products/mesh-sculpt-legging-set/black/02.png",
          "/images/products/mesh-sculpt-legging-set/black/01.png",
          "/images/products/mesh-sculpt-legging-set/black/03.png",
        ],
      },
      {
        name: "White",
        hex: "#FFFFFF",
        images: [
          "/images/products/mesh-sculpt-legging-set/white/01.png",
          "/images/products/mesh-sculpt-legging-set/white/02.png",
          "/images/products/mesh-sculpt-legging-set/white/03.png",
        ],
      },
    ],
    sizes: [
      { size: "S", stock: 30 },
      { size: "M", stock: 30 },
      { size: "L", stock: 30 },
      { size: "XL", stock: 30 },
    ],
    images: [
      "/images/products/mesh-sculpt-legging-set/black/02.png",
      "/images/products/mesh-sculpt-legging-set/black/01.png",
      "/images/products/mesh-sculpt-legging-set/black/03.png",
    ],
    hoverImage: "/images/products/mesh-sculpt-legging-set/black/01.png",
    sizeGuide: {
      unit: "CM",
      sections: [
        {
          title: "Vest",
          columns: ["Clothes length", "Chest", "Waistline"],
          rows: [
            { size: "S", values: ["31.5", "69", "60"] },
            { size: "M", values: ["33.5", "73", "64"] },
            { size: "L", values: ["34.5", "77", "68"] },
            { size: "XL", values: ["35.5", "81", "72"] },
          ],
        },
        {
          title: "Trousers",
          columns: ["Clothes length", "Waistline", "Hip", "Slack bottom"],
          rows: [
            { size: "S", values: ["88", "54", "71", "9"] },
            { size: "M", values: ["90", "58", "75", "9.5"] },
            { size: "L", values: ["92", "62", "79", "10"] },
            { size: "XL", values: ["94", "66", "83", "10.5"] },
          ],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 2,
  },
  {
    name: "Mesh High-Neck Sports Bra",
    slug: "mesh-high-neck-sports-bra",
    sku: "DA-AM-HN-BRA",
    categorySlug: "sports-bras",
    price: 39,
    compareAtPrice: 49,
    shortDescription:
      "High-neck sports bra with breathable mesh panels and a sleek sculpting fit.",
    description:
      "Designed to support every movement, the Mesh High-Neck Sports Bra combines breathable mesh panels with a sleek, sculpting fit for all-day comfort and confidence. Whether you're training, stretching, or styling it with your favorite leggings or shorts, this bra delivers the perfect balance of support and performance.",
    materials: "75% Nylon, 25% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. Medium to high support. Sculpting fit. Model wears size Small.",
    highlights: [
      "High-neck supportive design",
      "Signature breathable mesh panel detailing",
      "Medium to high support",
      "Four-way stretch for unrestricted movement",
      "Moisture-wicking and quick-drying fabric",
      "Soft, lightweight feel",
      "Breathable construction for enhanced airflow",
      "Perfect for gym training, running, yoga, Pilates, and everyday wear",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: ["/images/products/mesh-high-neck-sports-bra/black/01.png"],
      },
      {
        name: "White",
        hex: "#FFFFFF",
        images: ["/images/products/mesh-high-neck-sports-bra/white/01.png"],
      },
    ],
    sizes: stockSML(),
    images: [
      "/images/products/mesh-high-neck-sports-bra/black/01.png",
      "/images/products/mesh-high-neck-sports-bra/white/01.png",
    ],
    hoverImage: "/images/products/mesh-high-neck-sports-bra/black/01.png",
    sizeGuide: {
      unit: "CM",
      columns: ["Clothes length", "Chest", "Waistline"],
      rows: [
        { size: "S", values: ["31.5", "69", "60"] },
        { size: "M", values: ["33.5", "73", "64"] },
        { size: "L", values: ["34.5", "77", "68"] },
        { size: "XL", values: ["35.5", "81", "72"] },
      ],
    },
    isFeatured: false,
    isNewArrival: true,
    order: 3,
  },
  {
    name: "Mesh Sculpt Shorts",
    slug: "mesh-sculpt-shorts",
    sku: "DA-AM-SCULPT-SHORTS",
    categorySlug: "shorts",
    price: 35,
    compareAtPrice: 45,
    shortDescription:
      "High-rise mesh sculpt shorts with breathable panels and a flattering, secure fit.",
    description:
      "Designed for unrestricted movement, the Mesh Sculpt Shorts combine breathable mesh panels with a sculpting high-rise waistband for a flattering, secure fit. Lightweight and supportive, they're built to keep you comfortable through every workout and beyond.",
    materials: "75% Nylon, 25% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. High-rise waistband. Sculpting compression fit. Model wears size Small.",
    highlights: [
      "High-waisted sculpting fit",
      "Signature breathable mesh panel detailing",
      "Four-way stretch fabric",
      "Moisture-wicking and quick-drying",
      "Soft, lightweight feel",
      "Breathable design for enhanced airflow",
      "High-resilience fabric that retains its shape",
      "Squat-proof coverage",
      "Perfect for gym training, running, Pilates, yoga, and everyday activewear",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: ["/images/products/mesh-sculpt-shorts/black/01.png"],
      },
      {
        name: "White",
        hex: "#FFFFFF",
        images: ["/images/products/mesh-sculpt-shorts/white/01.png"],
      },
    ],
    sizes: stockSML(),
    images: [
      "/images/products/mesh-sculpt-shorts/black/01.png",
      "/images/products/mesh-sculpt-shorts/white/01.png",
    ],
    hoverImage: "/images/products/mesh-sculpt-shorts/black/01.png",
    sizeGuide: {
      unit: "CM",
      columns: ["Clothes length", "Waistline", "Hip", "Slack bottom"],
      rows: [
        { size: "S", values: ["34", "54", "71", "37"] },
        { size: "M", values: ["35", "58", "75", "39"] },
        { size: "L", values: ["36", "62", "79", "41"] },
        { size: "XL", values: ["37", "66", "83", "42"] },
      ],
    },
    isFeatured: false,
    isNewArrival: true,
    order: 4,
  },
  {
    name: "Mesh Sculpt Leggings",
    slug: "mesh-sculpt-leggings",
    sku: "DA-AM-SCULPT-LEG",
    categorySlug: "leggings",
    price: 45,
    compareAtPrice: 55,
    shortDescription:
      "High-rise mesh sculpt leggings with breathable panels and a flattering performance fit.",
    description:
      "Built for performance and designed to flatter, the Mesh Sculpt Leggings feature breathable mesh panels and a sculpting high-rise fit that moves with your body. Crafted from premium performance fabric, they deliver comfort, flexibility, and confidence through every workout.",
    materials: "75% Nylon, 25% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. High-rise sculpting waistband. Four-way stretch compression fit. Model wears size Small.",
    highlights: [
      "High-waisted sculpting design",
      "Signature breathable mesh panel detailing",
      "Four-way stretch for unrestricted movement",
      "Moisture-wicking and quick-drying fabric",
      "Soft, lightweight feel",
      "High-resilience fabric that maintains its shape",
      "Breathable construction",
      "Squat-proof coverage",
      "Perfect for gym training, running, yoga, Pilates, sports, and everyday activewear",
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
    ],
    sizes: stockSML(),
    images: [placeholder("Mesh+Sculpt+Leggings")],
    isFeatured: false,
    isNewArrival: true,
    order: 5,
  },
];

async function main() {
  const { connectDB } = await import("../src/lib/mongodb");
  const Collection = (await import("../src/models/Collection")).default;
  const Category = (await import("../src/models/Category")).default;
  const Product = (await import("../src/models/Product")).default;

  await connectDB();

  let collection = await Collection.findOne({ slug: "auramesh" });
  if (!collection) {
    collection = await Collection.create({
      name: "AuraMesh",
      slug: "auramesh",
      description:
        "Designed for high-performance training with breathable mesh panels and sculpting support.",
      image: "/images/collections/auramesh.png",
      imageAlt: "AuraMesh collection — DAYAURA",
      order: 4,
      isActive: true,
      seoTitle: "AuraMesh | DAYAURA",
      seoDescription:
        "Designed for high-performance training with breathable mesh panels and sculpting support.",
    });
    console.log("✓ Created AuraMesh collection");
  } else {
    await Collection.findByIdAndUpdate(collection._id, {
      description:
        "Designed for high-performance training with breathable mesh panels and sculpting support.",
      image: "/images/collections/auramesh.png",
      seoTitle: "AuraMesh | DAYAURA",
      seoDescription:
        "Designed for high-performance training with breathable mesh panels and sculpting support.",
      isActive: true,
      order: 4,
    });
    console.log("↷ Updated AuraMesh collection");
  }

  const categoryDefs = [
    { name: "Sets", slug: "sets", order: 8 },
    { name: "Sports Bras", slug: "sports-bras", order: 1 },
    { name: "Shorts", slug: "shorts", order: 4 },
    { name: "Leggings", slug: "leggings", order: 2 },
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
      hiddenMessage: HIDDEN,
      highlights: p.highlights,
      modelInfo: p.modelInfo || "",
      sizeGuide: p.sizeGuide,
      isFeatured: p.isFeatured ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isOnSale: p.compareAtPrice > p.price,
      status: "published" as const,
      order: p.order,
      seoTitle: `${p.name} | AuraMesh | DAYAURA`,
      seoDescription: p.shortDescription,
    };

    const existing = await Product.findOne({ slug: p.slug });
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
      `✗ Removed non-catalog AuraMesh products: ${removedExtras.deletedCount}`
    );
  }

  console.log("\n────────────────────────────────────────");
  console.log(`AuraMesh upsert complete`);
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
