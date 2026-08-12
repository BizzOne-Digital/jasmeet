"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { getVariantStock, isVariantPurchasable } from "@/lib/inventory";
import type { ProductCardProduct } from "@/components/product/ProductCard";

export interface QuickViewModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductCardProduct | null;
  currency?: string;
  initialColor?: string;
}

export function QuickViewModal({
  open,
  onClose,
  product,
  currency = "CAD",
  initialColor,
}: QuickViewModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const baseSizes = product?.sizes || [];
  const colors = product?.colors || [];
  const allowPreOrder = Boolean(product?.allowPreOrder);

  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  const sizesForColor = useMemo(() => {
    if (!product) return [];
    return baseSizes.map((s) => ({
      size: s.size,
      stock: getVariantStock(
        product,
        color || colors[0]?.name || "Default",
        s.size
      ),
    }));
  }, [product, baseSizes, color, colors]);

  const availableSizes = useMemo(
    () => sizesForColor.filter((s) => s.stock > 0 || allowPreOrder),
    [sizesForColor, allowPreOrder]
  );

  useEffect(() => {
    if (!open || !product) return;
    setColor(initialColor || colors[0]?.name || "");
    setSize(availableSizes[0]?.size || sizesForColor[0]?.size || "");
  }, [open, product?._id, initialColor]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) return null;

  const activeSize =
    size || availableSizes[0]?.size || sizesForColor[0]?.size || "";
  const activeColor = color || colors[0]?.name || "Default";
  const activeColorObj = colors.find((c) => c.name === activeColor);
  const activeHex = activeColorObj?.hex;
  const colorImages = activeColorObj?.images?.filter(Boolean) || [];
  const image = colorImages[0] || product.images?.[0];
  const isAccessories = product.collection?.slug === "accessories";
  const onSale =
    product.isOnSale ||
    (product.compareAtPrice != null && product.compareAtPrice > product.price);
  const purchase = product.isComingSoon
    ? { ok: false, stock: 0, isPreOrder: false }
    : isVariantPurchasable(product, activeColor, activeSize, 1);
  const preOrderLabel = product.preOrderLeadTime || "Pre-Order";

  const addToCart = () => {
    if (!purchase.ok) return;
    addItem({
      productId: String(product._id),
      name: product.name,
      slug: product.slug,
      image: image || "",
      price: product.price,
      quantity: 1,
      size: activeSize || "One Size",
      color: activeColor,
      colorHex: activeHex,
      isPreOrder: purchase.isPreOrder,
      preOrderLeadTime: purchase.isPreOrder ? preOrderLabel : undefined,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Quick view" size="lg">
      <div className="grid gap-6 md:grid-cols-2">
        <div
          className={
            isAccessories
              ? "relative aspect-[3/4] overflow-hidden bg-white"
              : "relative aspect-[3/4] overflow-hidden bg-[#141414]"
          }
        >
          <SafeImage
            src={image}
            alt={product.name}
            fill
            className={
              isAccessories
                ? "bg-transparent object-contain p-4"
                : "object-contain object-center p-2"
            }
            sizes="400px"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {onSale ? <Badge variant="sale">Sale</Badge> : null}
            {product.isNewArrival ? <Badge variant="new">New</Badge> : null}
            {product.isBestSeller ? (
              <Badge variant="bestseller">Best seller</Badge>
            ) : null}
            {product.isComingSoon ? (
              <Badge variant="soon">Coming soon</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="font-serif text-2xl text-[#F5F0E6]">{product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-[#D4AF37]">
              {formatPrice(product.price, currency)}
            </p>
            {onSale && product.compareAtPrice ? (
              <span className="text-sm text-white/40 line-through">
                {formatPrice(product.compareAtPrice, currency)}
              </span>
            ) : null}
          </div>

          {colors.length > 0 ? (
            <div className="mt-6">
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/50">
                Color — {activeColor}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    className={`h-7 w-7 rounded-full border-2 ${
                      activeColor === c.name
                        ? "border-[#D4AF37]"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.name}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {sizesForColor.length > 0 ? (
            <div className="mt-6">
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/50">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {sizesForColor.map((s) => {
                  const soldOut = s.stock <= 0 && !allowPreOrder;
                  return (
                    <button
                      key={s.size}
                      type="button"
                      disabled={soldOut}
                      onClick={() => setSize(s.size)}
                      className={`min-w-10 border px-3 py-2 text-xs uppercase tracking-wider transition disabled:opacity-30 ${
                        activeSize === s.size
                          ? "border-[#D4AF37] text-[#D4AF37]"
                          : "border-white/20 text-[#F5F0E6] hover:border-white/50"
                      }`}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
              {purchase.isPreOrder ? (
                <p className="mt-2 text-xs text-amber-400">{preOrderLabel}</p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Button onClick={addToCart} fullWidth disabled={!purchase.ok}>
              {product.isComingSoon
                ? "Coming soon"
                : purchase.isPreOrder
                  ? "Pre-order"
                  : "Quick add to cart"}
            </Button>
            <Link href={`/products/${product.slug}`} onClick={onClose}>
              <Button variant="ghost" fullWidth>
                View full details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
