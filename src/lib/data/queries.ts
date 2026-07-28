import { connectDB } from "@/lib/mongodb";
import Collection from "@/models/Collection";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Page from "@/models/Page";
import PageSection from "@/models/PageSection";
import GalleryItem from "@/models/GalleryItem";
import FAQ from "@/models/FAQ";
import type { ProductFilters } from "@/types";

export async function getCollections(activeOnly = true) {
  await connectDB();
  const filter = activeOnly ? { isActive: true } : {};
  return Collection.find(filter).sort({ order: 1 }).lean();
}

export async function getCollectionBySlug(slug: string) {
  await connectDB();
  return Collection.findOne({ slug, isActive: true }).lean();
}

export async function getCategories(activeOnly = true) {
  await connectDB();
  const filter = activeOnly ? { isActive: true } : {};
  return Category.find(filter).sort({ order: 1 }).lean();
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();
  return Category.findOne({ slug, isActive: true }).lean();
}

export async function getProducts(filters: ProductFilters = {}) {
  await connectDB();
  const {
    search,
    collection,
    category,
    sizes,
    minPrice,
    maxPrice,
    inStock,
    featured,
    newArrival,
    onSale,
    status = "published",
    sort = "newest",
    page = 1,
    limit = 12,
  } = filters;

  const query: Record<string, unknown> = {};
  if (status !== "all") {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { shortDescription: { $regex: search, $options: "i" } },
    ];
  }

  if (collection) {
    const col = await Collection.findOne({ slug: collection }).lean();
    if (col) query.collection = col._id;
  }

  if (category) {
    const cat = await Category.findOne({ slug: category }).lean();
    if (cat) query.category = cat._id;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) (query.price as Record<string, number>).$gte = minPrice;
    if (maxPrice !== undefined) (query.price as Record<string, number>).$lte = maxPrice;
  }

  if (featured) query.isFeatured = true;
  if (newArrival) query.isNewArrival = true;
  if (onSale) query.isOnSale = true;

  if (inStock) {
    query["sizes.stock"] = { $gt: 0 };
  }

  if (sizes?.length) {
    query["sizes.size"] = { $in: sizes };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    name: { name: 1 },
  };

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("collection", "name slug")
      .populate("category", "name slug")
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getProductBySlug(slug: string) {
  await connectDB();
  return Product.findOne({ slug, status: "published" })
    .populate("collection", "name slug")
    .populate("category", "name slug")
    .lean();
}

export async function getFeaturedProducts(limit = 8) {
  await connectDB();
  return Product.find({ status: "published", isFeatured: true })
    .populate("collection", "name slug")
    .populate("category", "name slug")
    .sort({ order: 1, createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getNewArrivals(limit = 8) {
  await connectDB();
  return Product.find({ status: "published", isNewArrival: true })
    .populate("collection", "name slug")
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getRelatedProducts(
  productId: string,
  collectionId: string,
  limit = 4
) {
  await connectDB();
  return Product.find({
    _id: { $ne: productId },
    collection: collectionId,
    status: "published",
  })
    .populate("collection", "name slug")
    .populate("category", "name slug")
    .limit(limit)
    .lean();
}

export async function getPageBySlug(slug: string) {
  await connectDB();
  return Page.findOne({ slug, status: "published" }).lean();
}

export async function getPageSections(pageSlug: string, includeHidden = false) {
  await connectDB();
  const page = await Page.findOne({ slug: pageSlug }).lean();
  if (!page) return [];

  const filter: Record<string, unknown> = {
    page: page._id,
    status: "published",
  };
  if (!includeHidden) filter.isVisible = true;

  return PageSection.find(filter).sort({ order: 1 }).lean();
}

export async function getGalleryItems(collectionSlug?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { isActive: true };
  if (collectionSlug) {
    const col = await Collection.findOne({ slug: collectionSlug }).lean();
    if (col) filter.collection = col._id;
  }
  return GalleryItem.find(filter)
    .populate("collection", "name slug")
    .sort({ order: 1 })
    .lean();
}

export async function getFAQs() {
  await connectDB();
  return FAQ.find({ isActive: true }).sort({ category: 1, order: 1 }).lean();
}

export async function getFAQsByCategory() {
  const faqs = await getFAQs();
  const grouped: Record<string, typeof faqs> = {};
  faqs.forEach((faq) => {
    if (!grouped[faq.category]) grouped[faq.category] = [];
    grouped[faq.category].push(faq);
  });
  return grouped;
}

export async function searchProducts(query: string, limit = 12) {
  return getProducts({ search: query, limit, page: 1 });
}
