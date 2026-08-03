import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductCardProduct } from "@/components/product/ProductCard";

export function RelatedProducts({
  products,
  title = "Related products",
}: {
  products: ProductCardProduct[];
  title?: string;
}) {
  if (!products.length) return null;

  return (
    <section className="mt-20">
      <h2 className="mb-8 font-heading text-3xl tracking-wide">{title}</h2>
      <ProductGrid products={products} columns="4" />
    </section>
  );
}
