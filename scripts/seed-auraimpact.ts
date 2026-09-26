/**
 * Upsert AuraImpact collection products into the dayaura database.
 * Run: npx tsx scripts/seed-auraimpact.ts
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

const CARE_STANDARD = [
  "Cool wash separately (30°C)",
  "Cool tumble dry",
  "Do not bleach",
  "Do not dry clean",
  "Cool iron if needed",
].join("\n");

type AuraImpactProduct = {
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

/** Flat gallery using 01.png, 02.png, … in order (for folders with only product shots). */
function orderedGallery(base: string, maxIndex: number): string[] {
  return Array.from({ length: maxIndex }, (_, i) =>
    `${base}/${String(i + 1).padStart(2, "0")}.png`
  );
}

/** Model shots (03–05) first, then flat/product shots (01–02). */
function modelFirstGallery(base: string, maxIndex: number): string[] {
  const order: number[] = [];
  for (const n of [3, 4, 5]) {
    if (n <= maxIndex) order.push(n);
  }
  for (const n of [1, 2]) {
    if (n <= maxIndex) order.push(n);
  }
  return order.map((n) => `${base}/${String(n).padStart(2, "0")}.png`);
}

const FLARED_LEGGINGS_SIZE_GUIDE = {
  unit: "IN",
  sections: [
    {
      title: "Detailed Size Chart (Inches)",
      columns: [
        "1/2 Waist Width",
        "Waist Height",
        "Front Rise Length",
        "Back Rise Length",
        "1/2 Hip Circumference",
        "Side Length (Total)",
        "Inseam",
      ],
      rows: [
        {
          size: "XS",
          values: ["10.2", "2.6", "7.1", "6.7", "13.0", "34.6", "29.9"],
        },
        {
          size: "S",
          values: ["11.0", "2.6", "7.5", "7.1", "14.0", "35.4", "30.3"],
        },
        {
          size: "M",
          values: ["11.8", "2.6", "7.9", "7.5", "15.0", "36.2", "30.7"],
        },
        {
          size: "L",
          values: ["12.6", "2.6", "8.3", "7.9", "15.9", "37.0", "31.1"],
        },
        {
          size: "XL",
          values: ["13.4", "2.6", "8.7", "8.3", "16.9", "37.8", "31.5"],
        },
      ],
    },
  ],
};

const PRODUCTS: AuraImpactProduct[] = [
  {
    name: "AuraImpact Sculpt Shorts",
    slug: "auraimpact-sculpt-shorts",
    sku: "5296",
    categorySlug: "shorts",
    price: 55,
    compareAtPrice: 69,
    shortDescription:
      "High-waisted seamless sculpt shorts with scrunch-back detail — mid-to-high compression for training and everyday activewear.",
    description:
      "Push your limits with the DAYAURA AuraImpact Sculpt Shorts. Crafted from premium seamless performance fabric, these high-waisted shorts are designed to sculpt, support, and move effortlessly with your body. The flattering scrunch-back detail enhances your natural shape, while the breathable, moisture-wicking fabric keeps you comfortable through every workout. Finished with DAYAURA's signature hidden motivational message, they're made to inspire confidence every step of the way.",
    materials: "90% Nylon, 10% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "High-waisted fit. True to size. Compression support. Scrunch-back contouring. Model wears Size S.",
    highlights: [
      "Premium seamless construction",
      "High-rise sculpting waistband",
      "Flattering scrunch-back design",
      "Mid-to-high compression support",
      "4-way stretch for unrestricted movement",
      "Squat-proof coverage",
      "Breathable performance fabric",
      "Moisture-wicking technology",
      "Soft, second-skin feel",
      "Lightweight yet durable",
      "Quick-drying fabric",
      "Designed for training, running, yoga, Pilates, and everyday activewear",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: modelFirstGallery(
          "/images/products/auraimpact-sculpt-shorts/black",
          3
        ),
      },
      {
        name: "Brown",
        hex: "#5C4033",
        images: modelFirstGallery(
          "/images/products/auraimpact-sculpt-shorts/brown",
          3
        ),
      },
      {
        name: "Shark Grey",
        hex: "#6B6E73",
        images: modelFirstGallery(
          "/images/products/auraimpact-sculpt-shorts/shark-grey",
          3
        ),
      },
    ],
    sizes: stockSML(),
    images: modelFirstGallery(
      "/images/products/auraimpact-sculpt-shorts/black",
      3
    ),
    sizeGuide: {
      unit: "IN",
      columns: [
        '1/2 Bust (")',
        'Back Center Length (")',
        'Collar Width (")',
        'Sleeve Length (")',
        '1/2 Cuff Width (")',
        'Cuff Height (")',
      ],
      rows: [
        {
          size: "XS",
          values: ["11.81", "18.90", "6.10", "7.87", "4.53", "0.79"],
        },
        {
          size: "S",
          values: ["12.80", "19.69", "6.50", "8.07", "4.92", "0.79"],
        },
        {
          size: "M",
          values: ["13.78", "20.47", "6.69", "8.27", "5.31", "0.79"],
        },
        {
          size: "L",
          values: ["14.76", "21.26", "7.28", "8.46", "5.71", "0.79"],
        },
        {
          size: "XL",
          values: ["15.75", "22.05", "7.68", "8.66", "6.10", "0.79"],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 1,
  },
  {
    name: "AuraImpact Sculpt Leggings",
    slug: "auraimpact-sculpt-leggings",
    sku: "5496",
    categorySlug: "leggings",
    price: 59,
    compareAtPrice: 79,
    shortDescription:
      "Full-length seamless sculpt leggings with scrunch-back detail and mid-to-high compression — built for power training and everyday movement.",
    description:
      "Train harder and move with confidence in the DAYAURA AuraImpact Sculpt Leggings. Crafted from premium seamless performance fabric, these high-waisted leggings provide sculpting support, all-day comfort, and unrestricted movement. The flattering scrunch-back detail enhances your natural shape, while the breathable, moisture-wicking fabric keeps you cool and comfortable through every workout. Finished with DAYAURA's signature hidden motivational message, these leggings are designed to empower every step of your fitness journey.",
    materials: "90% Nylon, 10% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "High-waisted fit. Full-length design. True to size. Compression support. Scrunch-back contouring. Model wears Size S.",
    highlights: [
      "Premium seamless construction",
      "High-rise sculpting waistband",
      "Full-length design",
      "Flattering scrunch-back detail",
      "Mid-to-high compression support",
      "4-way stretch for unrestricted movement",
      "Squat-proof coverage",
      "Breathable performance fabric",
      "Moisture-wicking technology",
      "Soft second-skin feel",
      "Lightweight yet durable",
      "Quick-drying fabric",
      "Designed for training, running, yoga, Pilates, and everyday activewear",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: orderedGallery(
          "/images/products/auraimpact-sculpt-leggings/black",
          2
        ),
      },
      {
        name: "Brown",
        hex: "#5C4033",
        images: orderedGallery(
          "/images/products/auraimpact-sculpt-leggings/brown",
          2
        ),
      },
      {
        name: "Shark Grey",
        hex: "#6B6E73",
        images: orderedGallery(
          "/images/products/auraimpact-sculpt-leggings/shark-grey",
          2
        ),
      },
    ],
    sizes: stockSML(),
    images: orderedGallery(
      "/images/products/auraimpact-sculpt-leggings/black",
      2
    ),
    hoverImage: "/images/products/auraimpact-sculpt-leggings/black/02.png",
    sizeGuide: {
      unit: "IN / CM",
      sections: [
        {
          title: "US Sizing (IN)",
          columns: ["US", "Waist", "Hips", "Length"],
          rows: [
            { size: "XS", values: ["0–4", "20.5", "26.0", "31.5"] },
            { size: "S", values: ["4–8", "22.0", "27.5", "32.2"] },
            { size: "M", values: ["8–10", "23.6", "29.1", "33.0"] },
            { size: "L", values: ["10–12", "25.2", "30.7", "33.8"] },
            { size: "XL", values: ["12–14", "26.8", "32.2", "34.6"] },
          ],
        },
        {
          title: "International Sizing (CM)",
          columns: ["US", "Waist", "Hips", "Length"],
          rows: [
            { size: "XS", values: ["0–4", "52", "66", "80"] },
            { size: "S", values: ["4–8", "56", "70", "82"] },
            { size: "M", values: ["8–10", "60", "74", "84"] },
            { size: "L", values: ["10–12", "64", "78", "86"] },
            { size: "XL", values: ["12–14", "68", "82", "88"] },
          ],
        },
        {
          title: "Detailed Size Chart (Inches)",
          columns: [
            "1/2 Waist Width",
            "Waist Height",
            "Front Rise Length",
            "Back Rise Length",
            "1/2 Hip Circumference",
            "Side Length (Total)",
            "Inseam",
          ],
          rows: [
            {
              size: "XS",
              values: ["10.2", "2.6", "7.1", "6.7", "13.0", "34.6", "29.9"],
            },
            {
              size: "S",
              values: ["11.0", "2.6", "7.5", "7.1", "14.0", "35.4", "30.3"],
            },
            {
              size: "M",
              values: ["11.8", "2.6", "7.9", "7.5", "15.0", "36.2", "30.7"],
            },
            {
              size: "L",
              values: ["12.6", "2.6", "8.3", "7.9", "15.9", "37.0", "31.1"],
            },
            {
              size: "XL",
              values: ["13.4", "2.6", "8.7", "8.3", "16.9", "37.8", "31.5"],
            },
          ],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 2,
  },
  {
    name: "AuraImpact Sculpt Bra",
    slug: "auraimpact-sculpt-bra",
    sku: "V4506",
    categorySlug: "sports-bras",
    price: 45,
    compareAtPrice: 59,
    shortDescription:
      "Seamless sculpt sports bra with medium-to-high support and a smooth, body-contouring fit.",
    description:
      "The DAYAURA AuraImpact Sculpt Bra is designed to deliver the perfect balance of comfort, support, and style. Crafted from premium seamless performance fabric, it offers a smooth, sculpting fit that moves with your body. Whether you're lifting, running, or stretching, this sports bra provides reliable support while keeping you cool and comfortable.",
    materials: "90% Nylon, 10% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. Medium-to-high support. Compression fit. Comfortable stretch. Model wears Size S.",
    highlights: [
      "Premium seamless construction",
      "Medium-to-high support",
      "Sculpting, body-contouring fit",
      "Wide supportive underband",
      "Soft second-skin feel",
      "4-way stretch for unrestricted movement",
      "Breathable performance fabric",
      "Moisture-wicking technology",
      "Mid-to-high compression",
      "Lightweight and durable",
      "Quick-drying fabric",
      "Designed for training, running, yoga, Pilates, and everyday activewear",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: modelFirstGallery(
          "/images/products/auraimpact-sculpt-bra/black",
          3
        ),
      },
      {
        name: "Burgundy",
        hex: "#6B2D3C",
        images: modelFirstGallery(
          "/images/products/auraimpact-sculpt-bra/burgundy",
          3
        ),
      },
    ],
    sizes: stockSML(),
    images: modelFirstGallery("/images/products/auraimpact-sculpt-bra/black", 3),
    sizeGuide: {
      unit: "IN",
      sections: [
        {
          title: "Detailed Size Chart (Inches)",
          columns: [
            "Garment Length",
            "Bust",
            "Hem Drop (from Shoulder)",
            "Bottom Sweep Width",
            "Side Length (Total)",
          ],
          rows: [
            {
              size: "XS",
              values: ["9.4", "12.8", "0.8", "10.6", "3.3"],
            },
            {
              size: "S",
              values: ["9.8", "13.6", "0.8", "11.4", "3.5"],
            },
            {
              size: "M",
              values: ["10.2", "14.4", "0.8", "12.2", "3.7"],
            },
            {
              size: "L",
              values: ["10.6", "15.2", "0.8", "13.0", "3.9"],
            },
            {
              size: "XL",
              values: ["11.0", "16.1", "0.8", "13.8", "4.1"],
            },
          ],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 3,
  },
  {
    name: "AuraImpact Performance Tee",
    slug: "auraimpact-performance-tee",
    sku: "A6396",
    categorySlug: "tops-t-shirts",
    price: 39,
    compareAtPrice: 55,
    shortDescription:
      "Lightweight seamless training tee with a slim athletic fit — cool, dry, and built to move.",
    description:
      "The DAYAURA AuraImpact Performance Tee is designed for women who want lightweight comfort with a sleek athletic look. Crafted from premium seamless performance fabric, this fitted training tee delivers a smooth, body-contouring silhouette while keeping you cool and dry through every workout. Whether you're lifting, running, or training, it moves naturally with your body for all-day comfort.",
    materials: "90% Nylon, 10% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. Slim athletic fit. Stretch comfort. Model wears Size S.",
    highlights: [
      "Premium seamless construction",
      "Lightweight performance fabric",
      "Slim athletic fit",
      "Raglan sleeves for unrestricted movement",
      "Soft second-skin feel",
      "4-way stretch",
      "Breathable performance knit",
      "Moisture-wicking technology",
      "Quick-drying fabric",
      "Mid compression",
      "Durable and shape-retaining",
      "Suitable for training and everyday activewear",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: modelFirstGallery(
          "/images/products/auraimpact-performance-tee/black",
          4
        ),
      },
      {
        name: "Shark Grey",
        hex: "#6B6E73",
        images: modelFirstGallery(
          "/images/products/auraimpact-performance-tee/shark-grey",
          4
        ),
      },
      {
        name: "Brown",
        hex: "#5C4033",
        images: modelFirstGallery(
          "/images/products/auraimpact-performance-tee/brown",
          4
        ),
      },
    ],
    sizes: stockSML(),
    images: modelFirstGallery(
      "/images/products/auraimpact-performance-tee/black",
      4
    ),
    sizeGuide: {
      unit: "IN",
      columns: [
        '1/2 Bust (")',
        'Back Center Length (")',
        'Collar Width (")',
        'Sleeve Length (")',
        '1/2 Cuff Width (")',
        'Cuff Height (")',
      ],
      rows: [
        {
          size: "XS",
          values: ["11.81", "18.90", "6.10", "7.87", "4.53", "0.79"],
        },
        {
          size: "S",
          values: ["12.80", "19.69", "6.50", "8.07", "4.92", "0.79"],
        },
        {
          size: "M",
          values: ["13.78", "20.47", "6.69", "8.27", "5.31", "0.79"],
        },
        {
          size: "L",
          values: ["14.76", "21.26", "7.28", "8.46", "5.71", "0.79"],
        },
        {
          size: "XL",
          values: ["15.75", "22.05", "7.68", "8.66", "6.10", "0.79"],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 4,
  },
  {
    name: "AuraImpact Performance Jacket",
    slug: "auraimpact-performance-jacket",
    sku: "7896",
    categorySlug: "jackets",
    price: 69,
    compareAtPrice: 89,
    shortDescription:
      "Lightweight full-zip performance jacket with a sculpting athletic fit — train, warm up, and go.",
    description:
      "Built for performance and everyday versatility, the DAYAURA AuraImpact Performance Jacket delivers a sleek, sculpting fit with premium comfort. Made from high-quality seamless performance fabric, this lightweight full-zip jacket features a streamlined silhouette, breathable construction, and four-way stretch that moves effortlessly with your body. Whether you're warming up, training, or heading out after your workout, it provides the perfect balance of function and style.",
    materials: "90% Nylon, 10% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. Slim athletic fit. Designed to contour the body without restricting movement. Model wears Size S.",
    highlights: [
      "Premium seamless performance fabric",
      "Full front zipper",
      "High-neck stand collar",
      "Sculpting athletic fit",
      "Long sleeves with comfortable stretch cuffs",
      "4-way stretch for unrestricted movement",
      "Breathable performance fabric",
      "Moisture-wicking technology",
      "Quick-drying material",
      "Mid to high compression",
      "Lightweight yet supportive",
      "Durable and shape-retaining",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: modelFirstGallery(
          "/images/products/auraimpact-performance-jacket/black",
          4
        ),
      },
      {
        name: "Shark Grey",
        hex: "#6B6E73",
        images: modelFirstGallery(
          "/images/products/auraimpact-performance-jacket/shark-grey",
          4
        ),
      },
    ],
    sizes: stockSML(),
    images: modelFirstGallery(
      "/images/products/auraimpact-performance-jacket/black",
      4
    ),
    sizeGuide: {
      unit: "IN",
      sections: [
        {
          title: "Detailed Size Chart (Inches)",
          columns: [
            "Front Length (CF to HPS)",
            "1/2 Bust (underarm)",
            "1/2 Bust (middle rib)",
            "Neck Width",
            "Front Neck Depth",
            "Sleeve Length",
            "1/2 Cuff Width",
            "Cuff Height",
          ],
          rows: [
            {
              size: "XS",
              values: [
                "19.685",
                "13.189",
                "12.205",
                "6.496",
                "1.969",
                "24.016",
                "2.756",
                "0.787",
              ],
            },
            {
              size: "S",
              values: [
                "20.079",
                "14.173",
                "12.992",
                "6.890",
                "1.969",
                "24.409",
                "3.346",
                "0.787",
              ],
            },
            {
              size: "M",
              values: [
                "20.472",
                "15.157",
                "13.780",
                "7.283",
                "2.165",
                "24.803",
                "3.543",
                "0.787",
              ],
            },
            {
              size: "L",
              values: [
                "20.866",
                "16.142",
                "14.567",
                "7.677",
                "2.165",
                "25.197",
                "3.740",
                "0.787",
              ],
            },
            {
              size: "XL",
              values: [
                "21.260",
                "17.126",
                "15.354",
                "8.071",
                "2.362",
                "25.591",
                "3.937",
                "0.787",
              ],
            },
          ],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 5,
  },
  {
    name: "AuraImpact Halter Tank",
    slug: "auraimpact-halter-tank",
    sku: "8596",
    categorySlug: "tops-t-shirts",
    price: 45,
    compareAtPrice: 55,
    shortDescription:
      "Seamless halter tank with built-in support and a sculpting longline cropped fit.",
    description:
      "Confident, sleek, and designed to move with you, the DAYAURA AuraImpact Halter Tank combines a flattering halter neckline with a sculpting fit for performance and everyday style. Crafted from premium seamless fabric, it offers breathable comfort, four-way stretch, and moisture-wicking performance while providing light-to-medium support. Whether you're training, lifting, or styling it beyond the gym, this versatile tank keeps you comfortable and confident all day.",
    materials: "90% Nylon, 10% Spandex",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "True to size. Body-contouring fit. Medium support. Longline cropped length. Model wears Size S.",
    highlights: [
      "Premium seamless performance fabric",
      "Flattering halter neckline",
      "Sculpting body-contouring fit",
      "Built-in support with removable padding",
      "Longline cropped silhouette",
      "4-way stretch for unrestricted movement",
      "Breathable construction",
      "Moisture-wicking technology",
      "Quick-drying fabric",
      "Soft, lightweight feel",
      "Mid compression support",
      "Designed for training and everyday wear",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: modelFirstGallery(
          "/images/products/auraimpact-halter-tank/black",
          4
        ),
      },
      {
        name: "Copper",
        hex: "#B87333",
        images: modelFirstGallery(
          "/images/products/auraimpact-halter-tank/copper",
          4
        ),
      },
      {
        name: "Shark Grey",
        hex: "#6B6E73",
        images: modelFirstGallery(
          "/images/products/auraimpact-halter-tank/shark-grey",
          4
        ),
      },
    ],
    sizes: stockSML(),
    images: modelFirstGallery(
      "/images/products/auraimpact-halter-tank/black",
      4
    ),
    sizeGuide: {
      unit: "IN",
      sections: [
        {
          title: "Detailed Size Chart (Inches)",
          columns: [
            "Garment Length",
            "Bust Width",
            "Inner Collar Depth",
            "Collar Depth",
            "Side Length",
            "Back Center Length",
            "Hem Width",
            "Bottom Sweep Width",
            "Shoulder Strap Length",
          ],
          rows: [
            {
              size: "XS",
              values: [
                "13.4",
                "12.2",
                "6.7",
                "3.3",
                "8.7",
                "8.1",
                "11.0",
                "11.0",
                "10.6",
              ],
            },
            {
              size: "S",
              values: [
                "14.0",
                "13.2",
                "7.1",
                "3.5",
                "8.7",
                "8.5",
                "11.8",
                "11.8",
                "11.4",
              ],
            },
            {
              size: "M",
              values: [
                "14.6",
                "14.2",
                "7.5",
                "3.7",
                "9.1",
                "8.9",
                "12.6",
                "12.6",
                "12.2",
              ],
            },
            {
              size: "L",
              values: [
                "15.2",
                "15.2",
                "7.9",
                "3.9",
                "9.4",
                "9.3",
                "13.4",
                "13.4",
                "13.0",
              ],
            },
            {
              size: "XL",
              values: [
                "15.7",
                "16.1",
                "8.3",
                "4.3",
                "9.8",
                "9.6",
                "14.2",
                "14.2",
                "13.8",
              ],
            },
          ],
        },
      ],
    },
    isFeatured: true,
    isNewArrival: true,
    order: 6,
  },
  {
    name: "AuraImpact Sculpt Flared Leggings",
    slug: "auraimpact-sculpt-flared-leggings",
    sku: "AI-FLARED-LEG",
    categorySlug: "leggings",
    price: 59,
    compareAtPrice: 79,
    shortDescription:
      "High-rise sculpt flared leggings with a body-contouring fit, 4-way stretch, and signature front-waist DAYAURA logo — performance meets everyday style.",
    description: [
      "Move with confidence in the DAYAURA AuraImpact Sculpt Flared Leggings. Designed with a supportive high-rise waistband and a sleek, body-contouring fit, these leggings sculpt comfortably through the waist, hips, and thighs before flowing into a flattering flared silhouette.",
      "Crafted from premium performance fabric with 4-way stretch, they offer the perfect balance of support, flexibility, and all-day comfort. The breathable, moisture-wicking fabric keeps you comfortable whether you're training, stretching, or styling them for everyday wear.",
      "Finished with the signature DAYAURA vertical logo on the front waistband and our hidden motivational message, these flared leggings combine performance, confidence, and effortless style.",
      'Signature Hidden Motivation: "THE FIRE TO KEEP GOING."',
    ].join("\n\n"),
    materials:
      "90% Nylon, 10% Spandex. Premium performance construction. Fabric weight: 200–230 GSM. Mid-to-high compression.",
    careInstructions: CARE_STANDARD,
    fitDetails:
      "High-waisted fit. True to size. Compression support. Sculpting fit through waist, hips, and thighs. Flared from the knee down. Full-length silhouette. Model wears Size S.",
    highlights: [
      "High-rise sculpting waistband",
      "Flattering flared-leg silhouette",
      "Contoured fit through the hips and thighs",
      "Smooth, clean back design",
      "Mid-to-high compression support",
      "4-way stretch for unrestricted movement",
      "Squat-proof coverage",
      "Breathable performance fabric",
      "Moisture-wicking technology",
      "Soft, second-skin feel",
      "Lightweight yet durable",
      "Quick-drying fabric",
      "Excellent stretch and shape retention",
      "Signature DAYAURA front-waist logo",
      "Designed for workouts and everyday wear",
    ],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/products/auraimpact-sculpt-flared-leggings/black/04.png",
          "/images/products/auraimpact-sculpt-flared-leggings/black/03.png",
        ],
      },
    ],
    sizes: stockSML(),
    images: [
      "/images/products/auraimpact-sculpt-flared-leggings/black/04.png",
      "/images/products/auraimpact-sculpt-flared-leggings/black/03.png",
    ],
    hoverImage:
      "/images/products/auraimpact-sculpt-flared-leggings/black/03.png",
    sizeGuide: FLARED_LEGGINGS_SIZE_GUIDE,
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

  let collection = await Collection.findOne({ slug: "auraimpact" });
  if (!collection) {
    collection = await Collection.create({
      name: "AuraImpact",
      slug: "auraimpact",
      description:
        "High-performance sculpting activewear engineered for training intensity and everyday confidence.",
      image: "/images/collections/auraimpact.png",
      imageAlt: "AuraImpact collection — DAYAURA",
      order: 2,
      isActive: true,
      seoTitle: "AuraImpact | DAYAURA",
      seoDescription:
        "High-performance sculpting activewear engineered for training intensity and everyday confidence.",
    });
    console.log("✓ Created AuraImpact collection");
  } else {
    await Collection.findByIdAndUpdate(collection._id, {
      description:
        "High-performance sculpting activewear engineered for training intensity and everyday confidence.",
      image: "/images/collections/auraimpact.png",
      seoTitle: "AuraImpact | DAYAURA",
      seoDescription:
        "High-performance sculpting activewear engineered for training intensity and everyday confidence.",
      isActive: true,
      order: 2,
    });
    console.log("↷ Updated AuraImpact collection");
  }

  const categoryDefs = [
    { name: "Shorts", slug: "shorts", order: 4 },
    { name: "Sports Bras", slug: "sports-bras", order: 1 },
    { name: "Leggings", slug: "leggings", order: 2 },
    { name: "Tops/T-Shirts", slug: "tops-t-shirts", order: 5 },
    { name: "Jackets", slug: "jackets", order: 6 },
    { name: "Pants", slug: "pants", order: 9 },
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
      seoTitle: `${p.name} | AuraImpact | DAYAURA`,
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

      // Preserve per-color gallery images if already uploaded
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
          : existing.hoverImage && !String(existing.hoverImage).includes("placehold.co")
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
      `✗ Removed non-catalog AuraImpact products: ${removedExtras.deletedCount}`
    );
  }

  console.log("\n────────────────────────────────────────");
  console.log(`AuraImpact upsert complete`);
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
