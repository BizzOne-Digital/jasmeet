/**
 * DAYAURA database seed — idempotent.
 * Run: npm run seed
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import mongoose from "mongoose";
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

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "Beige", hex: "#F5F0E6" },
  { name: "White", hex: "#FFFFFF" },
];

const HIDDEN_MESSAGES = [
  "You are stronger than you think.",
  "Move with purpose. Shine with confidence.",
  "Your aura is unstoppable.",
  "Progress over perfection.",
  "She believed she could, so she did.",
  "Breathe. Focus. Rise.",
  "Own every step.",
  "Strength looks good on you.",
  "Trust the process. Trust yourself.",
  "Wear your power.",
  "Built for the woman who shows up.",
  "Quiet confidence. Loud results.",
  "Elevate every moment.",
  "Your energy is magnetic.",
  "Discipline is your superpower.",
  "Flow through every challenge.",
  "Radiate. Recover. Repeat.",
  "Made for movement. Made for you.",
  "Courage is a daily practice.",
  "Glow from within.",
  "Push past comfort.",
  "You belong in every room you enter.",
  "Soft strength. Bold presence.",
  "Today, you rise.",
  "Leave doubt at the door.",
  "Your pace is perfect.",
  "Train hard. Rest harder.",
  "Be the aura.",
];

function stockSizes(defaultStock = 25) {
  return SIZES.map((size) => ({ size, stock: defaultStock }));
}

function skuFromSlug(slug: string) {
  return `DA-${slug.replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

async function main() {
  const { connectDB } = await import("../src/lib/mongodb");
  const { getPlaceholderImage, slugify } = await import("../src/lib/utils");
  const AdminUser = (await import("../src/models/AdminUser")).default;
  const Collection = (await import("../src/models/Collection")).default;
  const Category = (await import("../src/models/Category")).default;
  const Product = (await import("../src/models/Product")).default;
  const Page = (await import("../src/models/Page")).default;
  const PageSection = (await import("../src/models/PageSection")).default;
  const FAQ = (await import("../src/models/FAQ")).default;
  const SiteSettings = (await import("../src/models/SiteSettings")).default;
  const GalleryItem = (await import("../src/models/GalleryItem")).default;

  await connectDB();
  console.log("Connected to MongoDB\n");

  const counts = {
    admin: 0,
    collections: 0,
    categories: 0,
    products: 0,
    pages: 0,
    pageSections: 0,
    faqs: 0,
    siteSettings: 0,
    gallery: 0,
    skipped: 0,
  };

  // ── Admin ──────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
  }

  const existingAdmin = await AdminUser.findOne({ email: adminEmail.toLowerCase() });
  if (existingAdmin) {
    console.log(`↷ Admin already exists: ${adminEmail}`);
    counts.skipped++;
  } else {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await AdminUser.create({
      email: adminEmail.toLowerCase(),
      password: hashed,
      name: "DAYAURA Admin",
    });
    console.log(`✓ Admin created: ${adminEmail}`);
    counts.admin++;
  }

  // ── Collections ─────────────────────────────────────────────────────────
  const collectionDefs = [
    {
      name: "AuraWave",
      slug: "aurawave",
      description:
        "Fluid silhouettes and sculpted movement for studio sessions and elevated everyday wear.",
      order: 1,
    },
    {
      name: "AuraImpact",
      slug: "auraimpact",
      description:
        "High-intensity training pieces engineered for power, support, and uncompromising performance.",
      order: 2,
    },
    {
      name: "AuraFlow",
      slug: "auraflow",
      description:
        "Soft lounge and everyday movement essentials designed for ease, comfort, and quiet luxury.",
      order: 3,
    },
    {
      name: "AuraMesh",
      slug: "auramesh",
      description:
        "Designed for high-performance training with breathable mesh panels and sculpting support.",
      order: 4,
    },
    {
      name: "Outerwear",
      slug: "outerwear",
      description:
        "Refined athletic layers for cool-weather movement — polished protection from studio to street.",
      order: 5,
    },
    {
      name: "Accessories",
      slug: "accessories",
      description:
        "Finishing touches that elevate every workout and every day — bags, bands, and essentials.",
      order: 6,
    },
  ];

  const collectionMap = new Map<string, mongoose.Types.ObjectId>();

  for (const col of collectionDefs) {
    const existing = await Collection.findOne({ slug: col.slug });
    if (existing) {
      collectionMap.set(col.slug, existing._id);
      console.log(`↷ Collection exists: ${col.name}`);
      counts.skipped++;
      continue;
    }
    const created = await Collection.create({
      ...col,
      image: getPlaceholderImage(1200, 1500, col.name),
      imageAlt: `${col.name} collection — DAYAURA`,
      isActive: true,
      seoTitle: `${col.name} | DAYAURA`,
      seoDescription: col.description,
    });
    collectionMap.set(col.slug, created._id);
    console.log(`✓ Collection: ${col.name}`);
    counts.collections++;
  }

  // ── Categories ──────────────────────────────────────────────────────────
  const categoryDefs = [
    { name: "Sports Bras", slug: "sports-bras", order: 1 },
    { name: "Leggings", slug: "leggings", order: 2 },
    { name: "Flared Leggings", slug: "flared-leggings", order: 3 },
    { name: "Shorts", slug: "shorts", order: 4 },
    { name: "Tops/T-Shirts", slug: "tops-t-shirts", order: 5 },
    { name: "Jackets", slug: "jackets", order: 6 },
    { name: "Dresses", slug: "dresses", order: 7 },
    { name: "Sets", slug: "sets", order: 8 },
    { name: "Accessories", slug: "accessories", order: 9 },
  ];

  const categoryMap = new Map<string, mongoose.Types.ObjectId>();

  for (const cat of categoryDefs) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      categoryMap.set(cat.slug, existing._id);
      console.log(`↷ Category exists: ${cat.name}`);
      counts.skipped++;
      continue;
    }
    const created = await Category.create({
      ...cat,
      description: `Shop DAYAURA ${cat.name.toLowerCase()} designed for confidence through movement.`,
      image: getPlaceholderImage(800, 1000, cat.name),
      imageAlt: `${cat.name} — DAYAURA`,
      isActive: true,
    });
    categoryMap.set(cat.slug, created._id);
    console.log(`✓ Category: ${cat.name}`);
    counts.categories++;
  }

  // ── Products ────────────────────────────────────────────────────────────
  type ProductSeed = {
    name: string;
    collectionSlug: string;
    categorySlug: string;
    price: number;
    compareAtPrice?: number;
    shortDescription: string;
    description: string;
    materials: string;
    careInstructions: string;
    fitDetails: string;
    highlights: string[];
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isOnSale?: boolean;
    order: number;
  };

  const productDefs: ProductSeed[] = [
    // AuraImpact
    {
      name: "Performance Sports Bra",
      collectionSlug: "auraimpact",
      categorySlug: "sports-bras",
      price: 49,
      shortDescription: "High-support training bra with sculpted structure.",
      description:
        "Engineered for high-intensity sessions, the Performance Sports Bra delivers locked-in support with a sleek silhouette. Moisture-wicking fabric and a secure band keep you focused from warm-up to cool-down.",
      materials: "78% nylon, 22% elastane",
      careInstructions: "Machine wash cold. Hang dry. Do not iron.",
      fitDetails: "Compression fit. High support. Removable cups.",
      highlights: ["High support", "Sweat-wicking", "Secure band"],
      isFeatured: true,
      order: 1,
    },
    {
      name: "Sculpt Tank",
      collectionSlug: "auraimpact",
      categorySlug: "tops-t-shirts",
      price: 39,
      shortDescription: "Body-sculpting tank for training and beyond.",
      description:
        "The Sculpt Tank contours with a second-skin feel while staying breathable through every rep. A refined athletic essential for gym days and polished athleisure looks.",
      materials: "80% nylon, 20% elastane",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "Fitted. Cropped length. Soft-touch finish.",
      highlights: ["Sculpting fit", "Breathable", "Four-way stretch"],
      isNewArrival: true,
      order: 2,
    },
    {
      name: "Performance Tee",
      collectionSlug: "auraimpact",
      categorySlug: "tops-t-shirts",
      price: 39,
      compareAtPrice: 49,
      shortDescription: "Lightweight performance tee with elevated ease.",
      description:
        "A lightweight training tee that moves with you — soft hand-feel, breathable mesh-ready construction, and a clean athletic cut for everyday performance.",
      materials: "88% polyester, 12% elastane",
      careInstructions: "Machine wash cold. Tumble dry low.",
      fitDetails: "Relaxed athletic fit. Hip length.",
      highlights: ["Lightweight", "Quick-dry", "Soft hand-feel"],
      isOnSale: true,
      order: 3,
    },
    {
      name: "Long Sleeve Top",
      collectionSlug: "auraimpact",
      categorySlug: "tops-t-shirts",
      price: 49,
      shortDescription: "Sleek long sleeve for cool studios and outdoor runs.",
      description:
        "Layer up without bulk. The Long Sleeve Top offers a sleek, compressive feel with thumbhole-ready sleeves and a refined neckline for training in cooler conditions.",
      materials: "75% nylon, 25% elastane",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "Fitted. Full length sleeves. Soft compression.",
      highlights: ["Cool-weather ready", "Compressive", "Seamless feel"],
      isFeatured: true,
      order: 4,
    },
    {
      name: "Training Shorts",
      collectionSlug: "auraimpact",
      categorySlug: "shorts",
      price: 39,
      compareAtPrice: 45,
      shortDescription: "Secure, stretch training shorts for high-output sessions.",
      description:
        "Built for HIIT, circuit training, and studio heat. These Training Shorts stay put with a wide waistband and four-way stretch that never restricts your range.",
      materials: "82% nylon, 18% elastane",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "Mid-thigh length. High-rise waistband.",
      highlights: ["No-ride waistband", "Four-way stretch", "Pocket-ready"],
      isOnSale: true,
      order: 5,
    },
    {
      name: "Sculpt Leggings",
      collectionSlug: "auraimpact",
      categorySlug: "leggings",
      price: 49,
      shortDescription: "Signature sculpt leggings with locked-in support.",
      description:
        "Our signature Sculpt Leggings contour and support through every squat and stride. Opaque, squat-proof fabric with a flattering high rise and hidden motivational message.",
      materials: "75% nylon, 25% elastane",
      careInstructions: "Machine wash cold. Hang dry. Do not bleach.",
      fitDetails: "High-rise. Full length. Compression sculpt.",
      highlights: ["Squat-proof", "High-rise", "Sculpting compression"],
      isFeatured: true,
      order: 6,
    },
    {
      name: "Wide-Leg Sweat Pants",
      collectionSlug: "auraimpact",
      categorySlug: "leggings",
      price: 59,
      shortDescription: "Elevated wide-leg sweats for recovery and street.",
      description:
        "Wide-leg ease meets athletic polish. Soft French-terry inspired fabric with a structured drape — perfect for recovery days and elevated lounge looks.",
      materials: "70% cotton, 30% polyester",
      careInstructions: "Machine wash cold. Tumble dry low.",
      fitDetails: "High-rise. Wide leg. Relaxed through hip.",
      highlights: ["Soft drape", "Wide leg", "Everyday luxury"],
      isNewArrival: true,
      order: 7,
    },
    // AuraWave
    {
      name: "Scallop Dress",
      collectionSlug: "aurawave",
      categorySlug: "dresses",
      price: 49,
      shortDescription: "Sculpted scallop-edge dress for studio-to-street.",
      description:
        "A statement active dress with delicate scallop detailing and body-sculpting stretch. Move from yoga flow to brunch without changing your energy — or your outfit.",
      materials: "78% nylon, 22% elastane",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "Bodycon. Mini length. Built-in support.",
      highlights: ["Scallop edge", "Built-in support", "Studio-to-street"],
      isFeatured: true,
      isNewArrival: true,
      order: 10,
    },
    {
      name: "One-Shoulder Sports Bra",
      collectionSlug: "aurawave",
      categorySlug: "sports-bras",
      price: 35,
      compareAtPrice: 42,
      shortDescription: "Asymmetric one-shoulder bra with medium support.",
      description:
        "An editorial one-shoulder silhouette with medium support for yoga, pilates, and everyday movement. Soft compression and a refined finish that photographs beautifully.",
      materials: "80% nylon, 20% elastane",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "Medium support. Asymmetric neckline.",
      highlights: ["One-shoulder", "Medium support", "Editorial cut"],
      isOnSale: true,
      order: 11,
    },
    {
      name: "Scallop Halter Sports Bra",
      collectionSlug: "aurawave",
      categorySlug: "sports-bras",
      price: 35,
      shortDescription: "Halter sports bra with signature scallop trim.",
      description:
        "Feminine halter lines meet performance stretch. Scallop detailing frames the neckline while soft support keeps you secure through flow-based movement.",
      materials: "78% nylon, 22% elastane",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "Light-to-medium support. Halter neck.",
      highlights: ["Halter neck", "Scallop trim", "Soft support"],
      isNewArrival: true,
      order: 12,
    },
    {
      name: "High-Waist Leggings",
      collectionSlug: "aurawave",
      categorySlug: "leggings",
      price: 49,
      shortDescription: "Flattering high-waist leggings with buttery stretch.",
      description:
        "High-waist coverage with a buttery soft hand-feel. These AuraWave leggings flatter and flex through yoga, walks, and everyday wear.",
      materials: "75% nylon, 25% elastane",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "High-rise. Full length. Soft compression.",
      highlights: ["Buttery soft", "High-waist", "Opaque coverage"],
      isFeatured: true,
      order: 13,
    },
    {
      name: "Flared Leggings",
      collectionSlug: "aurawave",
      categorySlug: "flared-leggings",
      price: 55,
      shortDescription: "Iconic flare silhouette with sculpted high rise.",
      description:
        "The flare that redefined athleisure. A sculpted high rise meets a dramatic flare from the knee — designed to elongate and elevate every step.",
      materials: "75% nylon, 25% elastane",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "High-rise. Flare from knee. Full length.",
      highlights: ["Signature flare", "Lengthening cut", "Sculpted rise"],
      isFeatured: true,
      isNewArrival: true,
      order: 14,
    },
    {
      name: "One-Shoulder Set",
      collectionSlug: "aurawave",
      categorySlug: "sets",
      price: 79,
      shortDescription: "Matching one-shoulder bra and leggings set.",
      description:
        "A complete matching set with asymmetric energy. Includes the One-Shoulder Sports Bra and coordinating high-waist bottoms for a cohesive, camera-ready look.",
      materials: "80% nylon, 20% elastane",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "Set includes top + bottom. Coordinated fit.",
      highlights: ["Matching set", "Asymmetric design", "Complete look"],
      isFeatured: true,
      order: 15,
    },
    {
      name: "Halter Flare Set",
      collectionSlug: "aurawave",
      categorySlug: "sets",
      price: 85,
      shortDescription: "Halter bra paired with signature flared leggings.",
      description:
        "Our most elevated AuraWave pairing — scallop halter bra with flared leggings for movement that feels as powerful as it looks.",
      materials: "78% nylon, 22% elastane",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "Set includes halter bra + flared leggings.",
      highlights: ["Halter + flare", "Statement set", "Studio-ready"],
      isNewArrival: true,
      order: 16,
    },
    // AuraMesh
    {
      name: "Mesh Sports Bra",
      collectionSlug: "auramesh",
      categorySlug: "sports-bras",
      price: 35,
      shortDescription: "Breathable mesh-panel sports bra for intense training.",
      description:
        "Strategic mesh panels maximize airflow where you need it most. Medium-high support with sculpting seams for high-performance training sessions.",
      materials: "76% nylon, 24% elastane with mesh panels",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "Medium-high support. Mesh ventilation panels.",
      highlights: ["Breathable mesh", "Sculpting seams", "Training ready"],
      isNewArrival: true,
      order: 20,
    },
    {
      name: "Mesh Biker Shorts",
      collectionSlug: "auramesh",
      categorySlug: "shorts",
      price: 35,
      shortDescription: "Sculpting biker shorts with mesh ventilation.",
      description:
        "High-rise biker shorts with mesh panels for heat-releasing comfort. Stay locked in through spin, HIIT, and summer training.",
      materials: "76% nylon, 24% elastane with mesh panels",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "High-rise. Mid-thigh biker length.",
      highlights: ["Mesh panels", "High-rise", "Stay-put waistband"],
      isFeatured: true,
      isNewArrival: true,
      order: 21,
    },
    {
      name: "Mesh Leggings",
      collectionSlug: "auramesh",
      categorySlug: "leggings",
      price: 49,
      shortDescription: "Full-length mesh-panel leggings for peak performance.",
      description:
        "Breathable mesh meets sculpting compression. Full-length coverage with strategic ventilation for long training blocks and high-output workouts.",
      materials: "76% nylon, 24% elastane with mesh panels",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "High-rise. Full length. Mesh side panels.",
      highlights: ["Ventilated mesh", "Compression sculpt", "Squat-proof"],
      isFeatured: true,
      order: 22,
    },
    {
      name: "Biker Short Set",
      collectionSlug: "auramesh",
      categorySlug: "sets",
      price: 59,
      shortDescription: "Matching mesh sports bra and biker shorts set.",
      description:
        "Train as a set. Coordinated mesh sports bra and biker shorts deliver matched performance and a cohesive training aesthetic.",
      materials: "76% nylon, 24% elastane with mesh panels",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "Set includes mesh bra + biker shorts.",
      highlights: ["Matching set", "Mesh ventilation", "Gym-ready"],
      isOnSale: false,
      order: 23,
    },
    {
      name: "Legging Set",
      collectionSlug: "auramesh",
      categorySlug: "sets",
      price: 79,
      shortDescription: "Full mesh legging set with sports bra.",
      description:
        "Complete high-performance pairing — mesh sports bra and full-length mesh leggings engineered for breathable support from warm-up to final set.",
      materials: "76% nylon, 24% elastane with mesh panels",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "Set includes mesh bra + mesh leggings.",
      highlights: ["Full set", "Breathable performance", "Sculpting support"],
      isFeatured: true,
      order: 24,
    },
    // AuraFlow
    {
      name: "Off-Shoulder Lounge Set",
      collectionSlug: "auraflow",
      categorySlug: "sets",
      price: 59,
      shortDescription: "Soft off-shoulder lounge set for elevated recovery.",
      description:
        "Lounge without lowering your standards. An off-shoulder top paired with soft coordinating bottoms — designed for recovery days, travel, and quiet luxury at home.",
      materials: "65% cotton, 30% polyester, 5% elastane",
      careInstructions: "Machine wash cold. Tumble dry low.",
      fitDetails: "Relaxed set. Soft stretch. Off-shoulder neckline.",
      highlights: ["Off-shoulder", "Soft lounge", "Coordinated set"],
      isFeatured: true,
      isNewArrival: true,
      order: 30,
    },
    {
      name: "Flare Set",
      collectionSlug: "auraflow",
      categorySlug: "sets",
      price: 59,
      shortDescription: "Relaxed flare lounge set with easy movement.",
      description:
        "Flow into your day. A soft matching set with flared bottoms and a relaxed top — perfect for yoga at home, errands, and weekend ease.",
      materials: "65% cotton, 30% polyester, 5% elastane",
      careInstructions: "Machine wash cold. Tumble dry low.",
      fitDetails: "Relaxed fit. Flared bottoms. Soft stretch.",
      highlights: ["Flare silhouette", "Everyday ease", "Matching set"],
      isNewArrival: true,
      order: 31,
    },
    {
      name: "Wide-Leg Lounge Pants",
      collectionSlug: "auraflow",
      categorySlug: "leggings",
      price: 59,
      shortDescription: "Wide-leg lounge pants with elevated drape.",
      description:
        "Wide-leg softness with intentional structure. Ideal for lounge, travel, and low-key movement days when comfort still needs to look considered.",
      materials: "68% cotton, 27% polyester, 5% elastane",
      careInstructions: "Machine wash cold. Tumble dry low.",
      fitDetails: "High-rise. Wide leg. Relaxed through thigh.",
      highlights: ["Wide leg", "Soft drape", "Travel ready"],
      order: 32,
    },
    {
      name: "Jacket",
      collectionSlug: "auraflow",
      categorySlug: "jackets",
      price: 39,
      shortDescription: "Lightweight layering jacket for studio-to-street.",
      description:
        "A lightweight AuraFlow jacket that layers cleanly over sets and tanks. Soft structure, minimal hardware, and everyday polish for cool mornings.",
      materials: "90% polyester, 10% elastane",
      careInstructions: "Machine wash cold. Hang dry.",
      fitDetails: "Relaxed fit. Full zip. Hip length.",
      highlights: ["Lightweight layer", "Full zip", "Everyday polish"],
      isNewArrival: true,
      order: 33,
    },
    {
      name: "Jogger",
      collectionSlug: "auraflow",
      categorySlug: "leggings",
      price: 59,
      shortDescription: "Tapered joggers with soft stretch and refined finish.",
      description:
        "Tapered joggers that balance recovery comfort with athletic polish. Soft stretch, clean cuffs, and a flattering rise for lounging or light movement.",
      materials: "68% cotton, 27% polyester, 5% elastane",
      careInstructions: "Machine wash cold. Tumble dry low.",
      fitDetails: "Mid-rise. Tapered leg. Soft cuff.",
      highlights: ["Tapered fit", "Soft stretch", "Refined cuff"],
      order: 34,
    },
    // Accessories
    {
      name: "Performance Headband",
      collectionSlug: "accessories",
      categorySlug: "accessories",
      price: 9.99,
      shortDescription: "Sweat-wicking performance headband.",
      description:
        "Stay focused and polished. A soft, sweat-wicking headband that holds hair back through every session without digging in.",
      materials: "85% polyester, 15% elastane",
      careInstructions: "Hand wash. Air dry.",
      fitDetails: "One-size stretch. Soft non-slip grip.",
      highlights: ["Sweat-wicking", "Non-slip", "Soft stretch"],
      isNewArrival: true,
      order: 40,
    },
    {
      name: "Gym Bag",
      collectionSlug: "accessories",
      categorySlug: "accessories",
      price: 29,
      compareAtPrice: 39,
      shortDescription: "Sleek gym bag for training essentials.",
      description:
        "Carry your aura. A sleek, spacious gym bag with dedicated compartments for shoes, bottles, and essentials — designed to look as intentional as your wardrobe.",
      materials: "Water-resistant polyester with vegan leather accents",
      careInstructions: "Wipe clean. Spot clean only.",
      fitDetails: "Roomy main compartment. Exterior pockets.",
      highlights: ["Spacious", "Water-resistant", "Shoe compartment"],
      isOnSale: true,
      isFeatured: true,
      order: 41,
    },
  ];

  let messageIndex = 0;

  for (const p of productDefs) {
    const slug = slugify(p.name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      console.log(`↷ Product exists: ${p.name}`);
      counts.skipped++;
      continue;
    }

    const collectionId = collectionMap.get(p.collectionSlug);
    const categoryId = categoryMap.get(p.categorySlug);
    if (!collectionId || !categoryId) {
      console.warn(`⚠ Skipping ${p.name} — missing collection/category ref`);
      continue;
    }

    const imgLabel = p.name.replace(/\s+/g, "+");
    const primary = getPlaceholderImage(800, 1000, imgLabel);
    const hover = getPlaceholderImage(800, 1000, `${imgLabel}+Hover`);
    const secondary = getPlaceholderImage(800, 1000, `${imgLabel}+2`);

    await Product.create({
      name: p.name,
      slug,
      sku: skuFromSlug(slug),
      shortDescription: p.shortDescription,
      description: p.description,
      collection: collectionId,
      category: categoryId,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: [primary, secondary],
      hoverImage: hover,
      colors: COLORS,
      sizes: stockSizes(p.categorySlug === "accessories" ? 100 : 25),
      materials: p.materials,
      careInstructions: p.careInstructions,
      fitDetails: p.fitDetails,
      hiddenMessage: HIDDEN_MESSAGES[messageIndex % HIDDEN_MESSAGES.length],
      highlights: p.highlights,
      isFeatured: p.isFeatured ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isOnSale: p.isOnSale ?? false,
      status: "published",
      order: p.order,
      seoTitle: `${p.name} | DAYAURA`,
      seoDescription: p.shortDescription,
    });

    messageIndex++;
    console.log(`✓ Product: ${p.name}`);
    counts.products++;
  }

  // ── Pages ───────────────────────────────────────────────────────────────
  const pageDefs = [
    {
      title: "Home",
      slug: "home",
      description: "DAYAURA homepage — wear your aura, move with confidence.",
    },
    {
      title: "About",
      slug: "about",
      description: "The story, philosophy, and purpose behind DAYAURA.",
    },
    {
      title: "Shop",
      slug: "shop",
      description: "Shop all DAYAURA premium women's activewear.",
    },
    {
      title: "Collections",
      slug: "collections",
      description: "Explore AuraWave, AuraImpact, AuraFlow, AuraMesh, and more.",
    },
    {
      title: "Gallery",
      slug: "gallery",
      description: "Campaign imagery and movement moments from DAYAURA.",
    },
    {
      title: "FAQ",
      slug: "faq",
      description: "Answers about orders, shipping, returns, sizing, and care.",
    },
    {
      title: "Contact",
      slug: "contact",
      description: "Get in touch with the DAYAURA team.",
    },
    {
      title: "Size Guide",
      slug: "size-guide",
      description: "Find your perfect DAYAURA fit with our size guide.",
    },
    {
      title: "Shipping & Returns",
      slug: "shipping-returns",
      description: "Shipping timelines, free shipping threshold, and return policy.",
    },
    {
      title: "Privacy Policy",
      slug: "privacy-policy",
      description: "How DAYAURA collects, uses, and protects your information.",
    },
    {
      title: "Terms & Conditions",
      slug: "terms",
      description: "Terms of use for the DAYAURA website and purchases.",
    },
  ];

  const pageMap = new Map<string, mongoose.Types.ObjectId>();

  for (const page of pageDefs) {
    const existing = await Page.findOne({ slug: page.slug });
    if (existing) {
      pageMap.set(page.slug, existing._id);
      console.log(`↷ Page exists: ${page.title}`);
      counts.skipped++;
      continue;
    }
    const created = await Page.create({
      ...page,
      status: "published",
      seoTitle: `${page.title} | DAYAURA`,
      seoDescription: page.description,
    });
    pageMap.set(page.slug, created._id);
    console.log(`✓ Page: ${page.title}`);
    counts.pages++;
  }

  // ── Home page sections ──────────────────────────────────────────────────
  const homePageId = pageMap.get("home");
  if (homePageId) {
    const homeSections = [
      {
        sectionKey: "hero",
        internalName: "Home Hero",
        eyebrow: "Wear Your Aura",
        heading: "Move with Confidence",
        subheading: "Premium women's activewear designed for gym, yoga, and everyday movement.",
        body: "Discover sculpted silhouettes, elevated fabrics, and a hidden motivational message in every piece.",
        ctaLabel: "Shop Collections",
        ctaUrl: "/collections",
        backgroundImage: getPlaceholderImage(1920, 1080, "DAYAURA+Hero"),
        mobileImage: getPlaceholderImage(800, 1200, "DAYAURA+Hero+Mobile"),
        imageAlt: "DAYAURA model in premium activewear",
        theme: "dark" as const,
        alignment: "left" as const,
        order: 1,
      },
      {
        sectionKey: "announcement",
        internalName: "Home Announcement",
        eyebrow: "Welcome Offer",
        heading: "10% OFF Your First Order",
        subheading: "Join the list. Free shipping on orders over CAD $100.",
        body: "Be the first to know about new drops, campaigns, and exclusive member offers.",
        ctaLabel: "Join Newsletter",
        ctaUrl: "/#newsletter",
        theme: "beige" as const,
        alignment: "center" as const,
        order: 2,
      },
      {
        sectionKey: "collections",
        internalName: "Shop by Collection",
        eyebrow: "Collections",
        heading: "Shop by Collection",
        subheading: "Four signatures. One aura.",
        body: "From high-impact training to fluid studio movement and soft lounge — find the collection that matches your energy.",
        ctaLabel: "View All Collections",
        ctaUrl: "/collections",
        theme: "dark" as const,
        alignment: "center" as const,
        order: 3,
      },
      {
        sectionKey: "featured-products",
        internalName: "Featured Products",
        eyebrow: "Featured",
        heading: "Pieces That Define the Aura",
        subheading: "Our most-loved silhouettes, selected for performance and presence.",
        body: "Explore bestsellers engineered for movement and finished for the camera.",
        ctaLabel: "Shop Featured",
        ctaUrl: "/shop?featured=true",
        theme: "dark" as const,
        alignment: "left" as const,
        order: 4,
      },
      {
        sectionKey: "brand-story",
        internalName: "Brand Story",
        eyebrow: "Our Story",
        heading: "Confidence Through Movement",
        subheading: "Designed in Ontario for women who train hard and live fully.",
        body: "DAYAURA is a premium activewear brand designed to inspire confidence through movement. Our collections combine style, comfort, and performance — with every piece featuring a hidden motivational message to remind you of your strength every time you wear it.",
        ctaLabel: "About DAYAURA",
        ctaUrl: "/about",
        sideImage: getPlaceholderImage(900, 1200, "Brand+Story"),
        imageAlt: "DAYAURA brand story editorial",
        theme: "dark" as const,
        alignment: "left" as const,
        order: 5,
      },
      {
        sectionKey: "hidden-message",
        internalName: "Hidden Message Feature",
        eyebrow: "Signature Detail",
        heading: "A Message Only You Can Feel",
        subheading: "Every piece carries a hidden motivational message.",
        body: "Sewn into the details of each garment is a quiet reminder of your strength — revealed when you look closer, felt every time you move. This is the DAYAURA difference.",
        ctaLabel: "Discover the Detail",
        ctaUrl: "/about",
        sideImage: getPlaceholderImage(900, 1100, "Hidden+Message"),
        backgroundImage: getPlaceholderImage(1920, 900, "Hidden+Message+BG"),
        imageAlt: "Close-up of DAYAURA hidden motivational message",
        theme: "dark" as const,
        alignment: "right" as const,
        order: 6,
      },
      {
        sectionKey: "shop-by-movement",
        internalName: "Shop by Movement",
        eyebrow: "Move Your Way",
        heading: "Shop by Movement",
        subheading: "Gym. Yoga. Lounge. Everyday. High-performance.",
        body: "Choose pieces purpose-built for how you move — then wear them wherever your day takes you.",
        ctaLabel: "Shop All",
        ctaUrl: "/shop",
        theme: "beige" as const,
        alignment: "center" as const,
        order: 7,
      },
      {
        sectionKey: "new-arrivals",
        internalName: "New Arrivals",
        eyebrow: "Just Dropped",
        heading: "New Arrivals",
        subheading: "Fresh silhouettes for the season ahead.",
        body: "Be first to move in the latest DAYAURA releases across AuraWave, AuraImpact, AuraFlow, and AuraMesh.",
        ctaLabel: "Shop New",
        ctaUrl: "/shop?newArrival=true",
        theme: "dark" as const,
        alignment: "left" as const,
        order: 8,
      },
      {
        sectionKey: "campaign-banner",
        internalName: "Campaign Banner",
        eyebrow: "Campaign",
        heading: "Wear Your Aura",
        subheading: "The season of presence, power, and polish.",
        body: "A cinematic look at movement redefined — soft gold light, sculpted silhouettes, and unapologetic confidence.",
        ctaLabel: "Explore Campaign",
        ctaUrl: "/gallery",
        backgroundImage: getPlaceholderImage(1920, 800, "Campaign"),
        mobileImage: getPlaceholderImage(800, 1000, "Campaign+Mobile"),
        imageAlt: "DAYAURA campaign editorial",
        theme: "dark" as const,
        alignment: "center" as const,
        order: 9,
      },
      {
        sectionKey: "testimonials",
        internalName: "Testimonials",
        eyebrow: "Community",
        heading: "What Women Are Saying",
        subheading: "Real movement. Real confidence.",
        body: "“The fit is unreal — supportive without feeling restrictive. And that hidden message? Instant motivation.” — Maya R.",
        theme: "dark" as const,
        alignment: "center" as const,
        order: 10,
      },
      {
        sectionKey: "gallery-preview",
        internalName: "Gallery Preview",
        eyebrow: "Visual Diary",
        heading: "In Motion",
        subheading: "Campaign frames and community moments.",
        body: "Scroll the gallery for editorial stills, training energy, and the DAYAURA aesthetic in motion.",
        ctaLabel: "View Gallery",
        ctaUrl: "/gallery",
        theme: "dark" as const,
        alignment: "center" as const,
        order: 11,
      },
      {
        sectionKey: "newsletter",
        internalName: "Newsletter Signup",
        eyebrow: "Stay Close",
        heading: "Join the Aura",
        subheading: "10% OFF your first order when you join our email list.",
        body: "New drops, early access, and movement inspiration — delivered with intention.",
        ctaLabel: "Subscribe",
        ctaUrl: "/api/newsletter",
        theme: "beige" as const,
        alignment: "center" as const,
        order: 12,
      },
    ];

    for (const section of homeSections) {
      const existing = await PageSection.findOne({
        page: homePageId,
        sectionKey: section.sectionKey,
      });
      if (existing) {
        console.log(`↷ Page section exists: ${section.sectionKey}`);
        counts.skipped++;
        continue;
      }
      await PageSection.create({
        page: homePageId,
        ...section,
        isVisible: true,
        status: "published",
      });
      console.log(`✓ Page section: ${section.sectionKey}`);
      counts.pageSections++;
    }
  }

  // ── FAQs ────────────────────────────────────────────────────────────────
  const faqDefs = [
    // Orders
    {
      category: "Orders",
      question: "How do I track my order?",
      answer:
        "Once your order ships, you will receive a confirmation email with tracking details. You can also contact us at dayauraofficial@gmail.com with your order number for assistance.",
      order: 1,
    },
    {
      category: "Orders",
      question: "Can I modify or cancel my order after placing it?",
      answer:
        "We process orders quickly to get them to you sooner. Contact us as soon as possible at dayauraofficial@gmail.com or 4377727498. If your order has not yet shipped, we will do our best to update or cancel it.",
      order: 2,
    },
    {
      category: "Orders",
      question: "Do you offer gift messaging?",
      answer:
        "Yes — leave a note at checkout and we will include a complimentary DAYAURA message card with your order when available.",
      order: 3,
    },
    // Shipping
    {
      category: "Shipping",
      question: "Do you offer free shipping?",
      answer:
        "Yes. Enjoy free shipping on orders over CAD $100 within our standard shipping regions.",
      order: 1,
    },
    {
      category: "Shipping",
      question: "How long does shipping take?",
      answer:
        "Orders typically process within 1–2 business days. Standard shipping within Canada usually arrives in 3–7 business days depending on your location.",
      order: 2,
    },
    {
      category: "Shipping",
      question: "Do you ship internationally?",
      answer:
        "We currently prioritize Canadian shipping from Ontario. International options may be available for select destinations — contact us for details before ordering.",
      order: 3,
    },
    // Returns
    {
      category: "Returns",
      question: "What is your return policy?",
      answer:
        "Unworn, unwashed items with original tags may be returned within 14 days of delivery. Sale items and intimates may have limited return eligibility — see Shipping & Returns for full details.",
      order: 1,
    },
    {
      category: "Returns",
      question: "How do I start a return?",
      answer:
        "Email dayauraofficial@gmail.com with your order number and reason for return. Our team will guide you through the return process and next steps.",
      order: 2,
    },
    // Sizing
    {
      category: "Sizing",
      question: "How do I find my size?",
      answer:
        "Visit our Size Guide for detailed measurements. Our pieces are designed with a sculpted athletic fit — if you are between sizes, we recommend sizing up for a more relaxed feel.",
      order: 1,
    },
    {
      category: "Sizing",
      question: "Do your products run true to size?",
      answer:
        "Most DAYAURA pieces run true to size with a compressive, performance-minded fit. Check each product’s fit details for specific guidance.",
      order: 2,
    },
    // Products
    {
      category: "Products",
      question: "What is the hidden motivational message?",
      answer:
        "Every DAYAURA piece includes a discreet motivational message sewn into the garment — a private reminder of your strength every time you wear it.",
      order: 1,
    },
    {
      category: "Products",
      question: "Are the fabrics squat-proof and opaque?",
      answer:
        "Our performance leggings and training bottoms are designed to be opaque and squat-proof under normal training conditions. Always follow care instructions to maintain fabric integrity.",
      order: 2,
    },
    {
      category: "Products",
      question: "What colors are available?",
      answer:
        "Core colors include Black, Beige, and White across most styles. Availability may vary by product — select your preferred color on each product page.",
      order: 3,
    },
    // Care
    {
      category: "Care",
      question: "How should I wash my DAYAURA pieces?",
      answer:
        "Machine wash cold with like colors, and hang dry whenever possible. Avoid fabric softener and high heat to preserve stretch, opacity, and shape.",
      order: 1,
    },
    {
      category: "Care",
      question: "Can I put activewear in the dryer?",
      answer:
        "We recommend hanging dry for longevity. If you must use a dryer, choose low heat. High heat can damage elastane and reduce performance over time.",
      order: 2,
    },
    // Discounts
    {
      category: "Discounts",
      question: "How do I get 10% off my first order?",
      answer:
        "Join our email list to receive 10% off your first order. The offer details will be sent to your inbox after you subscribe.",
      order: 1,
    },
    {
      category: "Discounts",
      question: "Can discounts be combined?",
      answer:
        "Unless otherwise stated, promotional codes and first-order offers cannot be combined. The best available offer will apply at checkout.",
      order: 2,
    },
  ];

  for (const faq of faqDefs) {
    const existing = await FAQ.findOne({ question: faq.question });
    if (existing) {
      console.log(`↷ FAQ exists: ${faq.question.slice(0, 48)}…`);
      counts.skipped++;
      continue;
    }
    await FAQ.create({ ...faq, isActive: true });
    console.log(`✓ FAQ: ${faq.question.slice(0, 48)}`);
    counts.faqs++;
  }

  // ── Site settings ───────────────────────────────────────────────────────
  const settingsPayload = {
    businessName: "DAYAURA",
    logo: "/images/logo.png",
    favicon: "/images/logo.png",
    contactEmail: "dayauraofficial@gmail.com",
    phone: "4377727498",
    address: "Ontario, Canada",
    website: "www.dayaura.com",
    businessHours: "Monday–Friday, 9:00 AM–6:00 PM EST",
    supportHours: "Online store available 24/7",
    responseTime: "Typically within 24 hours",
    instagramUrl: "https://instagram.com/dayauraofficial",
    tiktokUrl: "https://tiktok.com/@dayauraofficial",
    facebookUrl: "https://facebook.com/DAYAURA",
    announcementMessages: [
      "10% OFF your first order when you join our email list",
      "Free shipping on orders over CAD $100",
    ],
    shippingThreshold: 100,
    firstOrderDiscountText: "10% OFF your first order when you join our email list",
    footerDescription:
      "DAYAURA is a premium activewear brand designed to inspire confidence through movement. Our collections combine style, comfort, and performance, with every piece featuring a hidden motivational message.",
    seoTitle: "DAYAURA | Wear Your Aura. Move with Confidence.",
    seoDescription:
      "Premium women's activewear combining style, comfort, and performance. Shop collections designed for gym, yoga, and everyday movement.",
    currency: "CAD",
  };

  const existingSettings = await SiteSettings.findOne();
  if (existingSettings) {
    await SiteSettings.updateOne({ _id: existingSettings._id }, { $set: settingsPayload });
    console.log("↷ SiteSettings updated (existing document)");
    counts.siteSettings++;
  } else {
    await SiteSettings.create(settingsPayload);
    console.log("✓ SiteSettings created");
    counts.siteSettings++;
  }

  // ── Gallery ─────────────────────────────────────────────────────────────
  const galleryDefs = [
    {
      caption: "AuraWave editorial — fluid movement",
      altText: "Model in AuraWave scallop dress",
      collectionSlug: "aurawave",
    },
    {
      caption: "AuraImpact training session",
      altText: "Athlete in AuraImpact sculpt leggings",
      collectionSlug: "auraimpact",
    },
    {
      caption: "AuraMesh high-performance detail",
      altText: "Close-up of AuraMesh breathable panels",
      collectionSlug: "auramesh",
    },
    {
      caption: "AuraFlow lounge campaign",
      altText: "Model in AuraFlow off-shoulder lounge set",
      collectionSlug: "auraflow",
    },
    {
      caption: "Studio light and gold accents",
      altText: "DAYAURA campaign lighting with gold detail",
    },
    {
      caption: "Strength in silhouette",
      altText: "Editorial silhouette of DAYAURA activewear",
      collectionSlug: "auraimpact",
    },
    {
      caption: "Flare in motion",
      altText: "AuraWave flared leggings in motion",
      collectionSlug: "aurawave",
    },
    {
      caption: "Cool-weather layering",
      altText: "DAYAURA outerwear layering look",
      collectionSlug: "outerwear",
    },
    {
      caption: "Community movement moment",
      altText: "Women training together in DAYAURA",
    },
    {
      caption: "Hidden message reveal",
      altText: "Detail shot of DAYAURA hidden motivational message",
    },
    {
      caption: "Accessories flat lay",
      altText: "DAYAURA gym bag and performance headband",
      collectionSlug: "accessories",
    },
    {
      caption: "Wear Your Aura campaign still",
      altText: "Cinematic DAYAURA campaign portrait",
    },
  ];

  for (let i = 0; i < galleryDefs.length; i++) {
    const item = galleryDefs[i];
    const existing = await GalleryItem.findOne({ caption: item.caption });
    if (existing) {
      console.log(`↷ Gallery item exists: ${item.caption}`);
      counts.skipped++;
      continue;
    }
    await GalleryItem.create({
      image: getPlaceholderImage(1000, 1250, `Gallery+${i + 1}`),
      caption: item.caption,
      altText: item.altText,
      collection: item.collectionSlug
        ? collectionMap.get(item.collectionSlug)
        : undefined,
      order: i + 1,
      isActive: true,
    });
    console.log(`✓ Gallery: ${item.caption}`);
    counts.gallery++;
  }

  console.log("\n════════════════════════════════════════");
  console.log("DAYAURA seed completed successfully");
  console.log("────────────────────────────────────────");
  console.log(`  Admin users:     ${counts.admin}`);
  console.log(`  Collections:     ${counts.collections}`);
  console.log(`  Categories:      ${counts.categories}`);
  console.log(`  Products:        ${counts.products}`);
  console.log(`  Pages:           ${counts.pages}`);
  console.log(`  Page sections:   ${counts.pageSections}`);
  console.log(`  FAQs:            ${counts.faqs}`);
  console.log(`  Site settings:   ${counts.siteSettings}`);
  console.log(`  Gallery items:   ${counts.gallery}`);
  console.log(`  Skipped (exist): ${counts.skipped}`);
  console.log("════════════════════════════════════════\n");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
