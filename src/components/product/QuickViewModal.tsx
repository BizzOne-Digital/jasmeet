"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import {
  getVariantStock,
  getProductSizeOptions,
  isVariantPurchasable,
} from "@/lib/inventory";
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
  const baseSizes = useMemo(
    () => (product ? getProductSizeOptions(product) : []),
    [product]
  );
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

  useEffect(() => {
    if (!open || !product) return;
    const nextColor = initialColor || colors[0]?.name || "";
    setColor(nextColor);
    setSize("");
  }, [open, product?._id, initialColor, colors]);

  useEffect(() => {
    if (!open || !product || size) return;
    const preferred =
      sizesForColor.find((s) => s.stock > 0 || allowPreOrder)?.size ||
      sizesForColor[0]?.size ||
      "";
    if (preferred) setSize(preferred);
  }, [open, product, sizesForColor, allowPreOrder, size]);

  if (!product) return null;

  const activeSize =
    size || sizesForColor.find((s) => s.stock > 0 || allowPreOrder)?.size || "";
  const activeColor = color || colors[0]?.name || "Default";
  const activeColorObj = colors.find((c) => c.name === activeColor);
  const activeHex = activeColorObj?.hex;
  const colorImages = activeColorObj?.images?.filter(Boolean) || [];
  const image = colorImages[0] || product.images?.[0];
  const onSale =
    product.isOnSale ||
    (product.compareAtPrice != null && product.compareAtPrice > product.price);
  const purchase = product.isComingSoon
    ? { ok: false, stock: 0, isPreOrder: false }
    : isVariantPurchasable(product, activeColor, activeSize, 1);
  const preOrderLabel = product.preOrderLeadTime || "Pre-Order";
  const hasSizes = sizesForColor.length > 0;
  const modalTitle = hasSizes ? "Select size" : "Quick view";

  const addToCart = () => {
    if (hasSizes && !activeSize) return;
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

  const selectors = (
    <>
      {colors.length > 0 ? (
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-black/45">
            Color — {activeColor}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  setColor(c.name);
                  setSize("");
                }}
                className={`h-9 w-9 rounded-full border-2 ${
                  activeColor === c.name
                    ? "border-[#D4AF37]"
                    : "border-black/15"
                }`}
                style={{ backgroundColor: c.hex }}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>
      ) : null}

      {hasSizes ? (
        <div className={colors.length > 0 ? "mt-5" : ""}>
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-black/45">
            Size{" "}
            {!activeSize ? (
              <span className="text-red-600">— Please select</span>
            ) : null}
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
                  className={`min-h-11 min-w-11 border px-3 py-2 text-xs uppercase tracking-wider transition disabled:opacity-30 ${
                    activeSize === s.size
                      ? "border-[#D4AF37] text-[#8a6d00]"
                      : "border-black/20 text-black/85 hover:border-black/40"
                  }`}
                >
                  {s.size}
                </button>
              );
            })}
          </div>
          {purchase.isPreOrder ? (
            <p className="mt-2 text-xs text-amber-700">{preOrderLabel}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        <Button
          onClick={addToCart}
          fullWidth
          disabled={!purchase.ok || (hasSizes && !activeSize)}
        >
          {product.isComingSoon
            ? "Coming soon"
            : purchase.isPreOrder
              ? "Pre-order"
              : "Add to cart"}
        </Button>
        <Link href={`/products/${product.slug}`} onClick={onClose}>
          <Button
            fullWidth
            variant="outline"
            className="border-black/20 text-black/70 hover:border-[#D4AF37] hover:text-[#8a6d00]"
          >
            View full details
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      mobileSheet
      surface="beige"
    >
      <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-6">
        <div className="order-1 md:order-2">
          <h3 className="font-serif text-xl text-black/90 md:text-2xl">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-[#8a6d00]">
              {formatPrice(product.price, currency)}
            </p>
            {onSale && product.compareAtPrice ? (
              <span className="text-sm text-black/40 line-through">
                {formatPrice(product.compareAtPrice, currency)}
              </span>
            ) : null}
          </div>
          <div className="mt-5 md:mt-6">{selectors}</div>
        </div>

        <div className="relative order-2 aspect-[4/5] max-h-[28vh] overflow-hidden rounded-lg border border-black/10 bg-beige md:order-1 md:max-h-none md:aspect-[3/4]">
          <SafeImage
            src={image}
            alt={product.name}
            fill
            unoptimized
            className="bg-beige object-contain object-center p-2"
            sizes="(max-width: 768px) 100vw, 400px"
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
      </div>
    </Modal>
  );
}
