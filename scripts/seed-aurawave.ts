/**
 * Upsert AuraWave collection products into the dayaura database.
 * Run: npx tsx scripts/seed-aurawave.ts
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

const SIZE_CHART = {
  dress: "/images/products/size-charts/scallop-dress.png",
  oneShoulder: "/images/products/size-charts/one-shoulder-set.png",
  // Halter set reuses the same bra/trouser chart layout until a dedicated chart is provided
  halter: "/images/products/size-charts/one-shoulder-set.png",
} as const;

const CARE_STANDARD = [
  "Machine wash cold",
  "Wash with similar colours",
  "Do not bleach",
  "Hang dry",
  "Do not iron directly on the logo",
].join("\n");

type AuraWaveProduct = {
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
  /** Product photo paths — size chart appended as final gallery slide */
  images: string[];
  sizeChart: string;
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
  replaceSlugs?: string[];
};

function stockSML(stock = 25) {
  return [
    { size: "S", stock },
    { size: "M", stock },
    { size: "L", stock },
  ];
}

function stockSMLXL(stock = 25) {
  return [
    { size: "S", stock },
    { size: "M", stock },
    { size: "L", stock },
    { size: "XL", stock: 0 }, // XL not available for AuraWave
  ];
}

function placeholder(label: string) {
  const text = encodeURIComponent(label);
  return `https://placehold.co/800x1000/1a1a1a/D4AF37/png?text=${text}&font=montserrat`;
}

const PRODUCTS: AuraWaveProduct[] = [
  {
    name: "Scallop Dress",
    slug: "scallop-dress",
    sku: "DA-AW-SCALLOP-DRESS",
    categorySlug: "dresses",
    price: 59,
    compareAtPrice: 79,
    shortDescription:
      "Elegant scallop-edge dress with built-in shorts — made for court, brunch, and everyday confidence.",
    description:
      "Designed to move effortlessly with you, the Scallop Dress combines elegant style with everyday performance. Featuring signature scalloped edges, a flattering sculpted fit, and built-in shorts, it's made for confidence on and off the court. Whether you're heading to tennis, brunch, or a weekend outing, this dress delivers comfort, support, and timeless style.",
    materials: "75% Nylon, 25% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails: "True to size. Model wears size Small.",
    highlights: [
      "Signature scalloped neckline and hem",
      "Sculpting, flattering silhouette",
      "Built-in shorts for comfort and coverage",
      "Four-way stretch for unrestricted movement",
      "Breathable, moisture-wicking fabric",
      "Soft, lightweight feel",
      "Perfect for tennis, pickleball, workouts, and everyday wear",
    ],
    colors: [{ name: "Matcha", hex: "#A3B18A" }],
    sizes: stockSMLXL(),
    // Gallery order: front → back → side/detail
    images: [
      "/images/products/scallop-dress/01-front.png",
      "/images/products/scallop-dress/03-back.png",
      "/images/products/scallop-dress/02-three-quarter.png",
      "/images/products/scallop-dress/04-tennis.png",
      "/images/products/scallop-dress/05-neckline-detail.png",
      "/images/products/scallop-dress/06-built-in-shorts.png",
      "/images/products/scallop-dress/07-hidden-message.png",
    ],
    sizeChart: SIZE_CHART.dress,
    modelInfo:
      "Model Height 5'6\" | Bust: 32\" | Waist: 24\" | Hips: 34\" | Wearing Size: Small",
    sizeGuide: {
      unit: "CM",
      columns: ["Chest", "Waistline", "Shoulder", "Clothes length", "Sleeve Length"],
      rows: [
        { size: "S", values: ["70", "58", "35.5", "80", "51"] },
        { size: "M", values: ["74", "62", "36.5", "81", "52"] },
        { size: "L", values: ["78", "66", "37.5", "82", "53"] },
        { size: "XL", values: ["80", "70", "38.5", "83", "54"] },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 1,
  },
  {
    name: "Scallop One-Shoulder Set",
    slug: "scallop-one-shoulder-set",
    sku: "DA-AW-OS-SET",
    categorySlug: "sets",
    price: 89,
    compareAtPrice: 119,
    shortDescription:
      "Asymmetrical one-shoulder bra + high-waisted sculpt leggings in a matching set.",
    description:
      "Designed to move effortlessly with you, the Scallop One-Shoulder Set blends modern elegance with high-performance comfort. Featuring a signature asymmetrical one-shoulder design, refined scalloped edges, and a sculpting high-waisted legging, this matching set is made to support every movement with confidence. Whether you're training, flowing through yoga, running errands, or meeting friends for coffee, it delivers style, comfort, and versatility throughout your day.",
    materials: "75% Nylon, 25% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. High-rise waistband. Sculpting, supportive fit. Model wears size Small.",
    highlights: [
      "Signature one-shoulder silhouette",
      "Elegant scalloped neckline and hem",
      "Sculpting, body-contouring fit",
      "High-waisted leggings for support and comfort",
      "Four-way stretch for unrestricted movement",
      "Breathable, moisture-wicking fabric",
      "Soft, lightweight feel",
      "Perfect for gym workouts, yoga, Pilates, running, travel, and everyday wear",
    ],
    colors: [
      {
        name: "Olive Green",
        hex: "#556B2F",
        images: [
          "/images/products/scallop-one-shoulder-set/olive-green/01.png",
          "/images/products/scallop-one-shoulder-set/olive-green/02.png",
          "/images/products/scallop-one-shoulder-set/olive-green/03.png",
        ],
      },
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/products/scallop-one-shoulder-set/black/01.png",
          "/images/products/scallop-one-shoulder-set/black/03.png",
          "/images/products/scallop-one-shoulder-set/black/02.png",
        ],
      },
    ],
    sizes: stockSMLXL(),
    images: [
      "/images/products/scallop-one-shoulder-set/olive-green/01.png",
      "/images/products/scallop-one-shoulder-set/olive-green/02.png",
      "/images/products/scallop-one-shoulder-set/olive-green/03.png",
    ],
    sizeChart: SIZE_CHART.oneShoulder,
    sizeGuide: {
      unit: "CM",
      sections: [
        {
          title: "Bra",
          columns: ["Clothes length", "Chest", "Waistline"],
          rows: [
            { size: "S", values: ["32", "67", "61"] },
            { size: "M", values: ["33", "71", "65"] },
            { size: "L", values: ["34", "75", "69"] },
            { size: "XL", values: ["35", "79", "73"] },
          ],
        },
        {
          title: "Trousers",
          columns: ["Pants length", "Hip", "Waistline"],
          rows: [
            { size: "S", values: ["88", "72", "58"] },
            { size: "M", values: ["90", "76", "62"] },
            { size: "L", values: ["92", "80", "66"] },
            { size: "XL", values: ["94", "84", "70"] },
          ],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 2,
    replaceSlugs: ["one-shoulder-set"],
  },
  {
    name: "Scallop One-Shoulder Bra",
    slug: "scallop-one-shoulder-bra",
    sku: "DA-AW-OS-BRA",
    categorySlug: "sports-bras",
    price: 39,
    compareAtPrice: 49,
    shortDescription:
      "Asymmetrical scallop one-shoulder bra with medium support and removable padding.",
    description:
      "Designed to move effortlessly with you, the Scallop One-Shoulder Bra combines modern elegance with all-day comfort. Featuring a signature asymmetrical one-shoulder design and refined scalloped edges, it offers a flattering, sculpted fit with lightweight support. Whether you're training, flowing through yoga, or styling it for everyday wear, this bra delivers confidence, comfort, and timeless style.",
    materials: "75% Nylon, 25% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. Medium support. Removable padding. Model wears size Small.",
    highlights: [
      "Signature one-shoulder silhouette",
      "Elegant scalloped neckline",
      "Sculpting, flattering fit",
      "Soft, supportive elastic underband",
      "Four-way stretch for unrestricted movement",
      "Breathable, moisture-wicking fabric",
      "Soft, lightweight feel",
      "Perfect for gym workouts, yoga, Pilates, walking, and everyday wear",
    ],
    colors: [
      {
        name: "Olive Green",
        hex: "#556B2F",
        images: [
          "/images/products/scallop-one-shoulder-bra/olive-green/03.png",
          "/images/products/scallop-one-shoulder-bra/olive-green/02.png",
          "/images/products/scallop-one-shoulder-bra/olive-green/01.png",
          "/images/products/scallop-one-shoulder-bra/olive-green/04.png",
        ],
      },
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/products/scallop-one-shoulder-bra/black/04.png",
          "/images/products/scallop-one-shoulder-bra/black/01.png",
          "/images/products/scallop-one-shoulder-bra/black/03.png",
          "/images/products/scallop-one-shoulder-bra/black/02.png",
        ],
      },
    ],
    sizes: stockSMLXL(),
    images: [
      "/images/products/scallop-one-shoulder-bra/olive-green/03.png",
      "/images/products/scallop-one-shoulder-bra/olive-green/02.png",
      "/images/products/scallop-one-shoulder-bra/olive-green/01.png",
      "/images/products/scallop-one-shoulder-bra/olive-green/04.png",
    ],
    sizeChart: SIZE_CHART.oneShoulder,
    sizeGuide: {
      unit: "CM",
      columns: ["Clothes length", "Chest", "Waistline"],
      rows: [
        { size: "S", values: ["32", "67", "61"] },
        { size: "M", values: ["33", "71", "65"] },
        { size: "L", values: ["34", "75", "69"] },
        { size: "XL", values: ["35", "79", "73"] },
      ],
    },
    isFeatured: true,
    order: 3,
    replaceSlugs: ["one-shoulder-sports-bra"],
  },
  {
    name: "Sculpt Leggings",
    slug: "aurawave-sculpt-leggings",
    sku: "DA-AW-SCULPT-LEG",
    categorySlug: "leggings",
    price: 55,
    compareAtPrice: 69,
    shortDescription:
      "High-rise sculpting leggings with compression fit — matching the One-Shoulder Set.",
    description:
      "Designed to move with confidence, the Sculpt Leggings deliver the perfect balance of performance and comfort. Featuring a flattering high-rise waistband and body-contouring silhouette, they provide support without compromising flexibility. Whether you're lifting, stretching, running, or relaxing, these leggings are made to keep up with every movement.",
    materials: "75% Nylon, 25% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. High-rise waistband. Sculpting, supportive fit. Full-length design. Model wears size Small.",
    highlights: [
      "High-waisted sculpting waistband",
      "Body-contouring silhouette",
      "Flattering compression fit",
      "Four-way stretch for unrestricted movement",
      "Breathable, moisture-wicking fabric",
      "Soft, lightweight feel",
      "Squat-proof coverage",
      "Perfect for gym workouts, yoga, Pilates, running, travel, and everyday wear",
    ],
    colors: [
      {
        name: "Olive Green",
        hex: "#556B2F",
        images: [
          "/images/products/aurawave-sculpt-leggings/olive-green/03.png",
          "/images/products/aurawave-sculpt-leggings/olive-green/01.png",
          "/images/products/aurawave-sculpt-leggings/olive-green/02.png",
        ],
      },
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/products/aurawave-sculpt-leggings/black/03.png",
          "/images/products/aurawave-sculpt-leggings/black/01.png",
          "/images/products/aurawave-sculpt-leggings/black/02.png",
        ],
      },
    ],
    sizes: stockSMLXL(),
    images: [
      "/images/products/aurawave-sculpt-leggings/olive-green/03.png",
      "/images/products/aurawave-sculpt-leggings/olive-green/01.png",
      "/images/products/aurawave-sculpt-leggings/olive-green/02.png",
    ],
    sizeChart: SIZE_CHART.oneShoulder,
    sizeGuide: {
      unit: "CM",
      columns: ["Pants length", "Hip", "Waistline"],
      rows: [
        { size: "S", values: ["88", "72", "58"] },
        { size: "M", values: ["90", "76", "62"] },
        { size: "L", values: ["92", "80", "66"] },
        { size: "XL", values: ["94", "84", "70"] },
      ],
    },
    isFeatured: true,
    order: 4,
    replaceSlugs: ["high-waist-leggings"],
  },
  {
    name: "Scallop Halter Flare Set",
    slug: "scallop-halter-flare-set",
    sku: "DA-AW-HALTER-SET",
    categorySlug: "sets",
    price: 89,
    compareAtPrice: 119,
    shortDescription:
      "Scallop halter bra + high-waist flared leggings. Bundle & save vs buying separately.",
    description:
      "Designed to flow effortlessly with every movement, the Scallop Halter Flare Set blends elevated style with all-day comfort. Featuring a signature scalloped halter neckline, sculpting high-waist flared leggings, and an ultra-soft second-skin feel, this set is made to transition seamlessly from studio sessions to everyday wear. Whether you're practicing yoga, heading to Pilates, grabbing coffee, or styling it for the weekend, it delivers confidence, comfort, and timeless elegance.\n\nBundle & Save: Buy the complete set for CAD $89 and save CAD $11 compared to purchasing each piece separately.",
    materials: "82% Nylon, 18% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. High-rise waistband. Supportive halter design. Model wears size Small.",
    highlights: [
      "Signature scalloped halter neckline",
      "High-waisted sculpting flare leggings",
      "Buttery-soft second-skin fabric",
      "Four-way stretch for unrestricted movement",
      "Breathable, moisture-wicking performance fabric",
      "Smooth, lightweight feel",
      "Flattering sculpted silhouette",
      "Perfect for yoga, Pilates, gym, travel, and everyday wear",
      "Bundle & save vs buying pieces separately",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/products/scallop-halter-flare-set/black/01.png",
          "/images/products/scallop-halter-flare-set/black/02.png",
          "/images/products/scallop-halter-flare-set/black/04.png",
          "/images/products/scallop-halter-flare-set/black/03.png",
        ],
      },
      {
        name: "Brown",
        hex: "#6F4E37",
        images: [
          "/images/products/scallop-halter-flare-set/brown/02.png",
          "/images/products/scallop-halter-flare-set/brown/01.png",
          "/images/products/scallop-halter-flare-set/brown/04.png",
          "/images/products/scallop-halter-flare-set/brown/03.png",
        ],
      },
    ],
    sizes: stockSMLXL(),
    images: [
      "/images/products/scallop-halter-flare-set/black/01.png",
      "/images/products/scallop-halter-flare-set/black/02.png",
      "/images/products/scallop-halter-flare-set/black/04.png",
      "/images/products/scallop-halter-flare-set/black/03.png",
    ],
    sizeChart: SIZE_CHART.halter,
    sizeGuide: {
      unit: "CM",
      sections: [
        {
          title: "Bra",
          columns: ["Clothes length", "Chest", "Waistline"],
          rows: [
            { size: "S", values: ["32", "67", "61"] },
            { size: "M", values: ["33", "71", "65"] },
            { size: "L", values: ["34", "75", "69"] },
            { size: "XL", values: ["35", "79", "73"] },
          ],
        },
        {
          title: "Trousers",
          columns: ["Pants length", "Hip", "Waistline"],
          rows: [
            { size: "S", values: ["88", "72", "58"] },
            { size: "M", values: ["90", "76", "62"] },
            { size: "L", values: ["92", "80", "66"] },
            { size: "XL", values: ["94", "84", "70"] },
          ],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 5,
    replaceSlugs: ["halter-flare-set"],
  },
  {
    name: "Scallop Halter Bra",
    slug: "scallop-halter-bra",
    sku: "DA-AW-HALTER-BRA",
    categorySlug: "sports-bras",
    price: 45,
    compareAtPrice: 59,
    shortDescription:
      "Scalloped halter sports bra with medium support and buttery-soft fabric.",
    description:
      "Designed for effortless movement and everyday confidence, the Scallop Halter Bra combines elegant scalloped detailing with supportive comfort. The flattering halter neckline and buttery-soft fabric create a sleek silhouette that transitions seamlessly from workouts to everyday wear.",
    materials: "82% Nylon, 18% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails: "True to size. Medium support. Model wears size Small.",
    highlights: [
      "Signature scalloped halter neckline",
      "Medium-support design",
      "Buttery-soft second-skin feel",
      "Four-way stretch",
      "Breathable, moisture-wicking fabric",
      "Lightweight and quick-drying",
      "Perfect for yoga, Pilates, gym, and everyday wear",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/products/scallop-halter-bra/black/01.png",
          "/images/products/scallop-halter-bra/black/03.png",
          "/images/products/scallop-halter-bra/black/02.png",
        ],
      },
      {
        name: "Brown",
        hex: "#6F4E37",
        images: [
          "/images/products/scallop-halter-bra/brown/02.png",
          "/images/products/scallop-halter-bra/brown/03.png",
          "/images/products/scallop-halter-bra/brown/01.png",
        ],
      },
    ],
    sizes: stockSMLXL(),
    images: [
      "/images/products/scallop-halter-bra/black/01.png",
      "/images/products/scallop-halter-bra/black/03.png",
      "/images/products/scallop-halter-bra/black/02.png",
    ],
    sizeChart: SIZE_CHART.halter,
    sizeGuide: {
      unit: "CM",
      columns: ["Clothes length", "Chest", "Waistline"],
      rows: [
        { size: "S", values: ["32", "67", "61"] },
        { size: "M", values: ["33", "71", "65"] },
        { size: "L", values: ["34", "75", "69"] },
        { size: "XL", values: ["35", "79", "73"] },
      ],
    },
    isFeatured: true,
    order: 6,
    replaceSlugs: ["scallop-halter-sports-bra"],
  },
  {
    name: "Flared Leggings",
    slug: "flared-leggings",
    sku: "DA-AW-FLARED-LEG",
    categorySlug: "flared-leggings",
    price: 55,
    compareAtPrice: 69,
    shortDescription:
      "High-rise scallop flared leggings with buttery-soft second-skin fabric.",
    description:
      "Designed to sculpt and move with you, the Scallop Flared Leggings feature a flattering high-rise waistband and elegant flared leg silhouette. Crafted from buttery-soft performance fabric, they offer all-day comfort whether you're at the studio, on the go, or relaxing in style.",
    materials: "82% Nylon, 18% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. High-rise waistband. Sculpting silhouette. Model wears size Small.",
    highlights: [
      "High-waisted sculpting fit",
      "Elegant flared-leg silhouette",
      "Buttery-soft second-skin fabric",
      "Four-way stretch",
      "Breathable, moisture-wicking material",
      "Lightweight and quick-drying",
      "Perfect for yoga, Pilates, gym, travel, and everyday wear",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/products/flared-leggings/black/03.png",
          "/images/products/flared-leggings/black/02.png",
          "/images/products/flared-leggings/black/01.png",
        ],
      },
      {
        name: "Brown",
        hex: "#6F4E37",
        images: [
          "/images/products/flared-leggings/brown/02.png",
          "/images/products/flared-leggings/brown/01.png",
          "/images/products/flared-leggings/brown/03.png",
        ],
      },
    ],
    sizes: stockSMLXL(),
    images: [
      "/images/products/flared-leggings/black/03.png",
      "/images/products/flared-leggings/black/02.png",
      "/images/products/flared-leggings/black/01.png",
    ],
    sizeChart: SIZE_CHART.halter,
    sizeGuide: {
      unit: "CM",
      columns: ["Pants length", "Hip", "Waistline"],
      rows: [
        { size: "S", values: ["88", "72", "58"] },
        { size: "M", values: ["90", "76", "62"] },
        { size: "L", values: ["92", "80", "66"] },
        { size: "XL", values: ["94", "84", "70"] },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 7,
  },
];

async function main() {
  const { connectDB } = await import("../src/lib/mongodb");
  const Collection = (await import("../src/models/Collection")).default;
  const Category = (await import("../src/models/Category")).default;
  const Product = (await import("../src/models/Product")).default;

  await connectDB();

  let collection = await Collection.findOne({ slug: "aurawave" });
  if (!collection) {
    collection = await Collection.create({
      name: "AuraWave",
      slug: "aurawave",
      description:
        "Fluid silhouettes and sculpted movement for studio sessions and elevated everyday wear.",
      image: "/images/collections/aurawave.png",
      imageAlt: "AuraWave collection — DAYAURA",
      order: 1,
      isActive: true,
      seoTitle: "AuraWave | DAYAURA",
      seoDescription:
        "Fluid silhouettes and sculpted movement for studio sessions and elevated everyday wear.",
    });
    console.log("✓ Created AuraWave collection");
  } else {
    await Collection.findByIdAndUpdate(collection._id, {
      description:
        "Fluid silhouettes and sculpted movement for studio sessions and elevated everyday wear.",
      seoTitle: "AuraWave | DAYAURA",
      seoDescription:
        "Fluid silhouettes and sculpted movement for studio sessions and elevated everyday wear.",
      isActive: true,
    });
    console.log("↷ Updated AuraWave collection");
  }

  const categoryDefs = [
    { name: "Sports Bras", slug: "sports-bras", order: 1 },
    { name: "Leggings", slug: "leggings", order: 2 },
    { name: "Flared Leggings", slug: "flared-leggings", order: 3 },
    { name: "Dresses", slug: "dresses", order: 7 },
    { name: "Sets", slug: "sets", order: 8 },
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
  let removed = 0;

  for (const p of PRODUCTS) {
    if (p.replaceSlugs?.length) {
      const del = await Product.deleteMany({
        slug: { $in: p.replaceSlugs },
        collection: collection._id,
      });
      if (del.deletedCount) {
        removed += del.deletedCount;
        console.log(
          `✗ Removed legacy: ${p.replaceSlugs.join(", ")} (${del.deletedCount})`
        );
      }
    }

    const images = p.images.some(
      (url) => url.startsWith("/images/products/") && !url.includes("size-charts")
    )
      ? p.images.filter(Boolean)
      : [...p.images.filter(Boolean), p.sizeChart].filter(
          (url, i, arr) => arr.indexOf(url) === i
        );

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
      seoTitle: `${p.name} | AuraWave | DAYAURA`,
      seoDescription: p.shortDescription,
    };

    const existing = await Product.findOne({ slug: p.slug });
    if (existing) {
      // Preserve real product photos if already uploaded (non-placeholder)
      const payloadHasRealImages = images.some(
        (img) => img.startsWith("/images/") && !img.includes("size-charts")
      );
      const keepImages = payloadHasRealImages
        ? images
        : existing.images?.some(
              (img: string) => img && !img.includes("placehold.co")
            ) && !existing.images.includes(p.sizeChart)
          ? [
              ...existing.images.filter(
                (img: string) => !img.includes("size-charts")
              ),
              p.sizeChart,
            ]
          : existing.images?.some(
                (img: string) => img && !img.includes("placehold.co")
              )
            ? existing.images
            : images;

      await Product.findByIdAndUpdate(existing._id, {
        ...payload,
        images: keepImages,
        hoverImage: payloadHasRealImages
          ? payload.hoverImage
          : existing.hoverImage && !existing.hoverImage.includes("placehold.co")
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

  const legacySlugs = [
    "one-shoulder-set",
    "one-shoulder-sports-bra",
    "high-waist-leggings",
    "halter-flare-set",
    "scallop-halter-sports-bra",
    "aurawave-flared-leggings",
  ];
  const stale = await Product.deleteMany({
    collection: collection._id,
    slug: { $in: legacySlugs },
  });
  if (stale.deletedCount) {
    console.log(`✗ Removed legacy AuraWave products: ${stale.deletedCount}`);
  }

  console.log("\n────────────────────────────────────────");
  console.log(`AuraWave upsert complete`);
  console.log(`  Products upserted: ${upserted}`);
  console.log(`  Legacy removed:    ${removed}`);
  console.log(`  DB:                dayaura`);
  console.log("────────────────────────────────────────");

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
