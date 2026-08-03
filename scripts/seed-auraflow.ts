/**
 * Upsert AuraFlow collection products into the dayaura database.
 * Run: npx tsx scripts/seed-auraflow.ts
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
  "Wash with like colors",
  "Do not bleach",
  "Tumble dry low or hang dry",
  "Cool iron if needed",
].join("\n");

type AuraFlowProduct = {
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

const PRODUCTS: AuraFlowProduct[] = [
  {
    name: "Off-Shoulder Lounge Set",
    slug: "off-shoulder-lounge-set",
    sku: "DA-AF-OFF-SHOULDER",
    categorySlug: "sets",
    price: 79,
    compareAtPrice: 99,
    shortDescription:
      "Elegant off-shoulder long-sleeve top with relaxed wide-leg pants — soft stretch loungewear for everyday ease.",
    description:
      "The AuraFlow Off-Shoulder Lounge Set is designed for effortless comfort and elevated everyday style. Featuring a flattering off-shoulder long-sleeve top paired with relaxed wide-leg pants, this premium two-piece set delivers a perfect balance of softness, stretch, and sophistication.\n\nCrafted from breathable, lightweight fabric with four-way stretch, it moves comfortably with you whether you're relaxing at home, traveling, running errands, or enjoying a casual day out. Finished with DAYAURA's signature hidden motivational message, it's made to inspire confidence every time you wear it.",
    materials: "90% Nylon, 10% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "Relaxed fit. True to size. Wide-leg pants. Off-shoulder neckline. Model wears size S.",
    highlights: [
      "Premium two-piece lounge set",
      "Elegant off-shoulder long-sleeve top",
      "Relaxed wide-leg pants",
      "Soft, breathable fabric",
      "Four-way stretch for unrestricted movement",
      "Moisture-wicking and quick-drying",
      "Lightweight and comfortable",
      "Adjustable drawstring waistband",
      "Functional side pockets",
      "Flattering relaxed silhouette",
      "Hidden motivational message inside",
      "Premium DAYAURA logo detailing",
    ],
    colors: [
      {
        name: "Brown",
        hex: "#6B4F3A",
        images: [
          "/images/products/off-shoulder-lounge-set/brown/01.png",
          "/images/products/off-shoulder-lounge-set/brown/02.png",
          "/images/products/off-shoulder-lounge-set/brown/03.png",
          "/images/products/off-shoulder-lounge-set/brown/04.png",
          "/images/products/off-shoulder-lounge-set/brown/05.png",
          "/images/products/off-shoulder-lounge-set/brown/06.png",
        ],
      },
    ],
    sizes: stockSML(),
    images: [
      "/images/products/off-shoulder-lounge-set/brown/01.png",
      "/images/products/off-shoulder-lounge-set/brown/02.png",
      "/images/products/off-shoulder-lounge-set/brown/03.png",
      "/images/products/off-shoulder-lounge-set/brown/04.png",
      "/images/products/off-shoulder-lounge-set/brown/05.png",
      "/images/products/off-shoulder-lounge-set/brown/06.png",
    ],
    sizeGuide: {
      unit: "CM",
      sections: [
        {
          title: "Long Sleeves",
          columns: [
            "Chest",
            "Waistline",
            "Hem",
            "Sleeve Length",
            "Cuff",
            "Clothes Length",
          ],
          rows: [
            { size: "S", values: ["72", "56", "74", "56", "8", "50"] },
            { size: "M", values: ["76", "60", "78", "58", "8.5", "52"] },
            { size: "L", values: ["80", "64", "82", "60", "9", "54"] },
            { size: "XL", values: ["84", "68", "86", "62", "9.5", "56"] },
          ],
        },
        {
          title: "Trousers",
          columns: ["Hip", "Waistline", "Slack bottom", "Pants length"],
          rows: [
            { size: "S", values: ["108", "60", "62", "106"] },
            { size: "M", values: ["112", "63", "64", "108"] },
            { size: "L", values: ["116", "66", "66", "110"] },
            { size: "XL", values: ["120", "69", "68", "112"] },
          ],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 1,
  },
  {
    name: "AuraFlow Sculpt Flare Set",
    slug: "auraflow-sculpt-flare-set",
    sku: "TZ5558-4",
    categorySlug: "sets",
    price: 79,
    compareAtPrice: 99,
    shortDescription:
      "Sculpting short-sleeve top with high-waisted wide-leg flare pants — studio-to-street comfort in a premium two-piece set.",
    description:
      "Move effortlessly from the studio to everyday life with the AuraFlow Sculpt Flare Set. Designed to sculpt, support, and move with your body, this premium two-piece set features a flattering short-sleeve fitted top paired with elegant high-waisted wide-leg flare pants for a sleek yet relaxed silhouette.\n\nCrafted from an ultra-soft premium nylon-spandex blend, it delivers a buttery-soft, second-skin feel with exceptional stretch, breathability, and moisture-wicking performance. Whether you're heading to Pilates, yoga, traveling, or enjoying a casual day out, the AuraFlow Sculpt Flare Set offers all-day comfort without compromising on style.",
    materials: "78% Nylon, 22% Spandex",
    careInstructions: [
      "Machine wash cold",
      "Wash with similar colors",
      "Do not bleach",
      "Tumble dry low or hang dry",
      "Cool iron if needed",
      "Do not dry clean",
    ].join("\n"),
    fitDetails:
      "Slim-fit top. Relaxed wide-leg flare pants. High-rise fold-over waistband. True to size. Four-way stretch. Model wears size S.",
    highlights: [
      "Premium two-piece matching set",
      "Sculpting slim-fit short-sleeve top",
      "High-waisted fold-over waistband",
      "Wide-leg flare pants",
      "Buttery-soft, second-skin feel",
      "Four-way stretch for unrestricted movement",
      "Breathable and lightweight",
      "Moisture-wicking fabric",
      "Quick-drying performance",
      "High-resilience fabric for lasting shape retention",
      "Smooth flatlock seams for enhanced comfort",
      "Flattering body-contouring design",
      "Signature hidden motivational message",
      "Premium DAYAURA logo detailing",
    ],
    colors: [
      {
        name: "Navy Blue",
        hex: "#1B2A4A",
        images: [
          "/images/products/auraflow-sculpt-flare-set/navy-blue/01.png",
          "/images/products/auraflow-sculpt-flare-set/navy-blue/02.png",
          "/images/products/auraflow-sculpt-flare-set/navy-blue/03.png",
          "/images/products/auraflow-sculpt-flare-set/navy-blue/04.png",
          "/images/products/auraflow-sculpt-flare-set/navy-blue/05.png",
          "/images/products/auraflow-sculpt-flare-set/navy-blue/06.png",
          "/images/products/auraflow-sculpt-flare-set/navy-blue/07.png",
          "/images/products/auraflow-sculpt-flare-set/navy-blue/08.png",
        ],
      },
    ],
    sizes: stockSMLXL(),
    images: [
      "/images/products/auraflow-sculpt-flare-set/navy-blue/01.png",
      "/images/products/auraflow-sculpt-flare-set/navy-blue/02.png",
      "/images/products/auraflow-sculpt-flare-set/navy-blue/03.png",
      "/images/products/auraflow-sculpt-flare-set/navy-blue/04.png",
      "/images/products/auraflow-sculpt-flare-set/navy-blue/05.png",
      "/images/products/auraflow-sculpt-flare-set/navy-blue/06.png",
      "/images/products/auraflow-sculpt-flare-set/navy-blue/07.png",
      "/images/products/auraflow-sculpt-flare-set/navy-blue/08.png",
    ],
    sizeGuide: {
      unit: "CM",
      sections: [
        {
          title: "Short sleeve",
          columns: ["Clothes length", "Sleeve Length", "Chest", "Hem"],
          rows: [
            { size: "S", values: ["47", "26", "74", "79"] },
            { size: "M", values: ["48", "26.8", "78", "83"] },
            { size: "L", values: ["49", "27.6", "82", "87"] },
            { size: "XL", values: ["50", "28.4", "86", "91"] },
          ],
        },
        {
          title: "Trousers",
          columns: ["Pants length", "Waistline", "Hip", "Slack bottom"],
          rows: [
            { size: "S", values: ["108", "68", "92", "58"] },
            { size: "M", values: ["109", "72", "96", "60"] },
            { size: "L", values: ["110", "76", "100", "62"] },
            { size: "XL", values: ["111", "80", "104", "64"] },
          ],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 2,
  },
  {
    name: "AuraFlow Cozy Lounge Set",
    slug: "auraflow-cozy-lounge-set",
    sku: "D-N25550-D-N25551",
    categorySlug: "sets",
    price: 89,
    compareAtPrice: 109,
    shortDescription:
      "Cropped hooded sweatshirt with relaxed wide-leg lounge pants — 100% premium cotton for everyday cozy comfort.",
    description:
      "The AuraFlow Cozy Lounge Set is designed for ultimate comfort with an elevated everyday look. Featuring a cropped hooded sweatshirt paired with relaxed wide-leg lounge pants, this premium cotton set offers effortless style whether you're relaxing at home, traveling, or heading out for casual errands.\n\nMade from 100% premium cotton, it delivers exceptional softness, natural breathability, and all-day comfort while maintaining a relaxed silhouette you'll reach for again and again.",
    materials: "100% Cotton",
    careInstructions: [
      "Machine wash cold",
      "Wash with similar colors",
      "Do not bleach",
      "Tumble dry low",
      "Hang dry for best results",
      "Cool iron if needed",
    ].join("\n"),
    fitDetails:
      "Relaxed fit. Cropped hoodie. Wide-leg pants. True to size. Model wears size S.",
    highlights: [
      "Premium two-piece lounge set",
      "Cropped hooded sweatshirt",
      "Relaxed wide-leg lounge pants",
      "100% premium cotton",
      "Ultra-soft and breathable",
      "Lightweight everyday comfort",
      "Adjustable drawstring waistband",
      "Elastic waistband",
      "Relaxed oversized fit",
      "Wide-leg silhouette",
      "Naturally breathable fabric",
      "Perfect for layering",
      "Signature hidden motivational message",
      "Premium DAYAURA logo detailing",
    ],
    colors: [
      {
        name: "Pink",
        hex: "#E8A0BF",
        images: [
          "/images/products/auraflow-cozy-lounge-set/pink/01.png",
          "/images/products/auraflow-cozy-lounge-set/pink/02.png",
          "/images/products/auraflow-cozy-lounge-set/pink/03.png",
          "/images/products/auraflow-cozy-lounge-set/pink/04.png",
        ],
      },
      { name: "Grey", hex: "#9A9590" },
    ],
    sizes: stockSML(),
    images: [
      "/images/products/auraflow-cozy-lounge-set/pink/01.png",
      "/images/products/auraflow-cozy-lounge-set/pink/02.png",
      "/images/products/auraflow-cozy-lounge-set/pink/03.png",
      "/images/products/auraflow-cozy-lounge-set/pink/04.png",
    ],
    sizeGuide: {
      unit: "CM",
      sections: [
        {
          title: "Long sleeves",
          columns: [
            "Clothes length",
            "Chest",
            "Shoulder",
            "Sleeve Length",
            "Weight",
          ],
          rows: [
            { size: "S", values: ["47", "49", "44", "66", "80-90"] },
            { size: "M", values: ["48", "51", "46", "67", "90-100"] },
            { size: "L", values: ["49", "53", "48", "68", "100-116"] },
            { size: "XL", values: ["50", "55", "50", "69", "120-130"] },
          ],
        },
        {
          title: "Trousers",
          columns: [
            "Pants length",
            "Upper waist",
            "Lower waist",
            "Slack bottom",
            "Weight",
          ],
          rows: [
            { size: "S", values: ["106", "31", "36", "25.8", "80-90"] },
            { size: "M", values: ["108", "31", "38", "26.4", "90-100"] },
            { size: "L", values: ["110", "35", "40", "27", "100-116"] },
            { size: "XL", values: ["112", "37", "42", "27.6", "120-130"] },
          ],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 3,
  },
  {
    name: "AuraFlow Studio Pants",
    slug: "auraflow-studio-pants",
    sku: "DA-AF-STUDIO-PANTS",
    categorySlug: "pants",
    price: 59,
    compareAtPrice: 75,
    shortDescription:
      "Ultra-soft modal-blend wide-leg studio pants with side pockets and modern side slits — gym to everyday.",
    description:
      "Designed for movement beyond the gym, the AuraFlow Studio Pants combine premium comfort with effortless style. Crafted from an ultra-soft modal blend, these lightweight wide-leg pants feature a relaxed silhouette, functional side pockets, and modern side slits for unrestricted movement. Whether you're heading to the studio, traveling, running errands, or relaxing after your workout, they deliver all-day comfort with a refined, elevated look.\n\nComfortable enough for everyday wear and stylish enough for any occasion, the AuraFlow Studio Pants are made to move with you throughout your day.",
    materials: "39% Modal, 56% Polyester, 5% Spandex",
    careInstructions: [
      "Machine wash cold",
      "Wash with similar colors",
      "Do not bleach",
      "Tumble dry low or hang dry",
      "Cool iron if needed",
      "Do not dry clean",
    ].join("\n"),
    fitDetails:
      "Relaxed wide-leg fit. Elastic waistband. Side slit hem. True to size. Model wears size S. XL coming soon.",
    highlights: [
      "Premium ultra-soft modal blend",
      "Lightweight and breathable",
      "Moisture-wicking",
      "Quick-drying",
      "Relaxed wide-leg silhouette",
      "Comfortable elastic waistband",
      "Functional side pockets",
      "Side slit hem for unrestricted movement",
      "Soft drape with a flattering fit",
      "Four-way comfort stretch",
      "Designed for gym, studio, travel, and everyday wear",
      "Premium DAYAURA branding",
    ],
    colors: [
      {
        name: "Black Grey",
        hex: "#3D3D3D",
        images: [
          "/images/products/auraflow-studio-pants/black-grey/01.png",
          "/images/products/auraflow-studio-pants/black-grey/02.png",
        ],
      },
      {
        name: "Mink Grey",
        hex: "#A89F96",
        images: [
          "/images/products/auraflow-studio-pants/mink-grey/01.png",
          "/images/products/auraflow-studio-pants/mink-grey/02.png",
        ],
      },
    ],
    sizes: [
      { size: "S", stock: 30 },
      { size: "M", stock: 30 },
      { size: "L", stock: 30 },
      { size: "XL", stock: 0 }, // Coming soon
    ],
    images: [
      "/images/products/auraflow-studio-pants/black-grey/01.png",
      "/images/products/auraflow-studio-pants/black-grey/02.png",
    ],
    sizeGuide: {
      unit: "CM",
      columns: ["Pants Length", "Waist", "Hip"],
      rows: [
        { size: "S", values: ["101", "64", "96"] },
        { size: "M", values: ["102", "68", "100"] },
        { size: "L", values: ["103", "72", "104"] },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 4,
  },
];

async function main() {
  const { connectDB } = await import("../src/lib/mongodb");
  const Collection = (await import("../src/models/Collection")).default;
  const Category = (await import("../src/models/Category")).default;
  const Product = (await import("../src/models/Product")).default;

  await connectDB();

  let collection = await Collection.findOne({ slug: "auraflow" });
  if (!collection) {
    collection = await Collection.create({
      name: "AuraFlow",
      slug: "auraflow",
      description:
        "Effortless movement and studio-to-street versatility — modern luxury loungewear for everyday comfort.",
      image: "/images/collections/auraflow.png",
      imageAlt: "AuraFlow collection — DAYAURA",
      order: 3,
      isActive: true,
      seoTitle: "AuraFlow | DAYAURA",
      seoDescription:
        "Effortless movement and studio-to-street versatility — modern luxury loungewear for everyday comfort.",
    });
    console.log("✓ Created AuraFlow collection");
  } else {
    await Collection.findByIdAndUpdate(collection._id, {
      description:
        "Effortless movement and studio-to-street versatility — modern luxury loungewear for everyday comfort.",
      image: "/images/collections/auraflow.png",
      seoTitle: "AuraFlow | DAYAURA",
      seoDescription:
        "Effortless movement and studio-to-street versatility — modern luxury loungewear for everyday comfort.",
      isActive: true,
      order: 3,
    });
    console.log("↷ Updated AuraFlow collection");
  }

  const categoryDefs = [
    { name: "Sets", slug: "sets", order: 8 },
    { name: "Pants", slug: "pants", order: 9 },
    { name: "Tops/T-Shirts", slug: "tops-t-shirts", order: 5 },
    { name: "Jackets", slug: "jackets", order: 6 },
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
      seoTitle: `${p.name} | AuraFlow | DAYAURA`,
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
      `✗ Removed non-catalog AuraFlow products: ${removedExtras.deletedCount}`
    );
  }

  console.log("\n────────────────────────────────────────");
  console.log(`AuraFlow upsert complete`);
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
