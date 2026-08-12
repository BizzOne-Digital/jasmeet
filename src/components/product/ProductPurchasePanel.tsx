"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, cn, safeText } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import {
  isBraTrouserSetGuide,
  getDualSizeLabels,
  type SizeGuideData,
} from "@/lib/size-guide";
import { getVariantStock, isVariantPurchasable } from "@/lib/inventory";

interface ProductPurchaseProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  colors?: Array<{ name: string; hex: string; images?: string[] }>;
  sizes?: Array<{ size: string; stock: number }>;
  inventory?: Array<{ colorName: string; size: string; stock: number }>;
  shortDescription?: string;
  sizeGuide?: SizeGuideData | null;
  isOnSale?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isComingSoon?: boolean;
  allowPreOrder?: boolean;
  preOrderLeadTime?: string;
  collection?: { name?: string; slug?: string } | null;
  category?: { name?: string; slug?: string } | null;
}

function SizeButtons({
  sizes,
  selected,
  onSelect,
  allowPreOrder,
}: {
  sizes: Array<{ size: string; stock: number }>;
  selected: string;
  onSelect: (size: string) => void;
  allowPreOrder?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((s, index) => {
        const label = s.size || `size-${index}`;
        const soldOut = s.stock <= 0 && !allowPreOrder;
        return (
          <button
            key={`${label}-${index}`}
            type="button"
            disabled={soldOut}
            onClick={() => onSelect(label)}
            className={cn(
              "h-11 min-w-12 border px-3 text-xs tracking-wider transition-colors",
              selected === label ? "border-gold text-gold" : "border-white/15",
              soldOut && "opacity-30 line-through",
              s.stock <= 0 && allowPreOrder && selected !== label && "border-dashed"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function ProductPurchasePanel({
  product,
  selectedColor: controlledColor,
  onColorChange,
}: {
  product: ProductPurchaseProduct;
  selectedColor?: string;
  onColorChange?: (color: string) => void;
}) {
  const router = useRouter();
  const colors = product.colors?.length ? product.colors : [{ name: "Default", hex: "#000000" }];
  const baseSizes = product.sizes?.length ? product.sizes : [{ size: "One Size", stock: 0 }];
  const dualSize = isBraTrouserSetGuide(product.sizeGuide);
  const dualLabels = getDualSizeLabels(product.sizeGuide);
  const allowPreOrder = Boolean(product.allowPreOrder);
  const comingSoon = Boolean(product.isComingSoon);

  const [internalColor, setInternalColor] = useState(colors[0].name);
  const color = controlledColor ?? internalColor;
  const setColor = (next: string) => {
    onColorChange?.(next);
    if (controlledColor === undefined) setInternalColor(next);
  };

  const sizesForColor = useMemo(
    () =>
      baseSizes.map((s) => ({
        size: s.size,
        stock: getVariantStock(product, color, s.size),
      })),
    [baseSizes, product, color]
  );

  const [size, setSize] = useState(
    dualSize
      ? ""
      : sizesForColor.find((s) => s.stock > 0 || allowPreOrder)?.size ||
          sizesForColor[0]?.size ||
          ""
  );
  const [topSize, setTopSize] = useState("");
  const [bottomSize, setBottomSize] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const wished = useWishlistStore((s) => s.isInWishlist(product._id));

  const selectedSize = useMemo(
    () => sizesForColor.find((s) => s.size === size),
    [size, sizesForColor]
  );
  const purchaseCheck = isVariantPurchasable(product, color, size || "", qty);
  const anyPurchasable = sizesForColor.some(
    (s) => s.stock > 0 || allowPreOrder
  );
  const inStock = comingSoon
    ? false
    : dualSize
      ? anyPurchasable
      : purchaseCheck.ok;
  const isPreOrder =
    !comingSoon &&
    (dualSize
      ? Boolean(topSize && bottomSize) &&
        (isVariantPurchasable(product, color, topSize, qty).isPreOrder ||
          isVariantPurchasable(product, color, bottomSize, qty).isPreOrder)
      : purchaseCheck.isPreOrder);
  const selectedColor = colors.find((c) => c.name === color) || colors[0];
  const cartImage =
    selectedColor.images?.find(Boolean) ||
    product.images?.[0] ||
    "";

  const addToCart = (buyNow = false) => {
    if (comingSoon) {
      setError("This product is coming soon.");
      return;
    }
    if (dualSize) {
      if (!topSize && !bottomSize) {
        setError(`Please select ${dualLabels.top.toLowerCase()} and ${dualLabels.bottom.toLowerCase()} sizes.`);
        return;
      }
      if (!topSize) {
        setError(`Please also select a ${dualLabels.top.toLowerCase()} size.`);
        return;
      }
      if (!bottomSize) {
        setError(`Please also select a ${dualLabels.bottom.toLowerCase()} size.`);
        return;
      }
      const topOk = isVariantPurchasable(product, color, topSize, 1);
      const bottomOk = isVariantPurchasable(product, color, bottomSize, 1);
      if (!topOk.ok || !bottomOk.ok) {
        setError("One of the selected sizes is sold out.");
        return;
      }
      setError("");
      const linePreOrder = topOk.isPreOrder || bottomOk.isPreOrder;
      addItem({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: cartImage,
        price: product.price,
        quantity: qty,
        size: `${dualLabels.top} ${topSize} / ${dualLabels.bottom} ${bottomSize}`,
        color: selectedColor.name,
        colorHex: selectedColor.hex,
        isPreOrder: linePreOrder,
        preOrderLeadTime: linePreOrder
          ? product.preOrderLeadTime || "Pre-Order – Ships in 2–3 weeks"
          : undefined,
      });
    } else {
      if (!size) {
        setError("Please select a size.");
        return;
      }
      if (!purchaseCheck.ok) {
        setError("Selected size is sold out.");
        return;
      }
      setError("");
      addItem({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: cartImage,
        price: product.price,
        quantity: qty,
        size,
        color: selectedColor.name,
        colorHex: selectedColor.hex,
        isPreOrder: purchaseCheck.isPreOrder,
        preOrderLeadTime: purchaseCheck.isPreOrder
          ? product.preOrderLeadTime || "Pre-Order – Ships in 2–3 weeks"
          : undefined,
      });
    }

    if (buyNow) {
      router.push("/checkout");
    } else {
      openCart();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted">
          {product.collection?.slug ? (
            <Link href={`/collections/${product.collection.slug}`} className="hover:text-gold">
              {safeText(product.collection.name)} Collection
            </Link>
          ) : null}
          {(product.isOnSale ||
            (product.compareAtPrice != null &&
              product.compareAtPrice > product.price)) && (
            <Badge variant="sale">Sale</Badge>
          )}
          {product.isNewArrival ? <Badge variant="new">New</Badge> : null}
          {product.isBestSeller ? (
            <Badge variant="bestseller">Best seller</Badge>
          ) : null}
          {comingSoon ? <Badge variant="soon">Coming soon</Badge> : null}
        </div>
        <h1 className="mt-3 font-heading text-4xl tracking-wide md:text-5xl">
          {safeText(product.name)}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-lg">
          <span>{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <span className="text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
        {product.shortDescription ? (
          <p className="mt-4 text-sm leading-relaxed text-beige/70">
            {safeText(product.shortDescription)}
          </p>
        ) : null}
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-beige/60">
          Color — {color}
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => setColor(c.name)}
              className={cn(
                "h-11 w-11 rounded-full border-2",
                color === c.name ? "border-gold" : "border-white/20"
              )}
              style={{ backgroundColor: c.hex || "#000" }}
            />
          ))}
        </div>
      </div>

      {dualSize ? (
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-beige/60">
              {dualLabels.top} size
            </p>
            <SizeButtons
              sizes={sizesForColor}
              selected={topSize}
              allowPreOrder={allowPreOrder}
              onSelect={(s) => {
                setTopSize(s);
                setError("");
              }}
            />
          </div>
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-beige/60">
              {dualLabels.bottom} size
            </p>
            <SizeButtons
              sizes={sizesForColor}
              selected={bottomSize}
              allowPreOrder={allowPreOrder}
              onSelect={(s) => {
                setBottomSize(s);
                setError("");
              }}
            />
          </div>
          <p className="text-xs text-muted">
            Choose {dualLabels.top.toLowerCase()} and {dualLabels.bottom.toLowerCase()}{" "}
            sizes separately — they can be different.
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-beige/60">Size</p>
          <SizeButtons
            sizes={sizesForColor}
            selected={size}
            allowPreOrder={allowPreOrder}
            onSelect={setSize}
          />
          <p className="mt-2 text-xs text-muted">
            {isPreOrder
              ? product.preOrderLeadTime || "Pre-Order — ships when available"
              : inStock
                ? `${selectedSize?.stock ?? 0} in stock`
                : "Sold out"}
          </p>
        </div>
      )}

      {isPreOrder ? (
        <p className="rounded-sm border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-beige/80">
          <span className="font-medium text-gold">Pre-Order</span>
          {" — "}
          {product.preOrderLeadTime || "Ships in 2–3 weeks"}
        </p>
      ) : null}

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-beige/60">
          Quantity
        </p>
        <div className="inline-flex items-center border border-white/15">
          <button
            type="button"
            className="h-11 w-11"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-12 text-center text-sm">{qty}</span>
          <button
            type="button"
            className="h-11 w-11"
            onClick={() =>
              setQty((q) =>
                Math.min(isPreOrder ? 10 : Math.max(1, selectedSize?.stock ?? 1), q + 1)
              )
            }
          >
            +
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button fullWidth onClick={() => addToCart(false)} disabled={!inStock} size="lg">
          {comingSoon ? "Coming soon" : isPreOrder ? "Pre-order" : "Add to cart"}
        </Button>
        <Button fullWidth variant="outline" onClick={() => addToCart(true)} disabled={!inStock} size="lg">
          {comingSoon ? "Coming soon" : isPreOrder ? "Pre-order now" : "Buy now"}
        </Button>
        <Button
          variant="ghost"
          aria-label="Toggle wishlist"
          className="min-h-12 w-full sm:w-auto"
          onClick={() =>
            toggleWishlist({
              productId: product._id,
              name: product.name,
              slug: product.slug,
              image: product.images?.[0] || "",
              price: product.price,
            })
          }
        >
          <Heart className={cn("h-5 w-5", wished && "fill-gold text-gold")} />
        </Button>
      </div>
    </div>
  );
}
