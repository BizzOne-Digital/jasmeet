"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { ProductCardProduct } from "@/components/product/ProductCard";

export interface QuickViewModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductCardProduct | null;
  currency?: string;
}

export function QuickViewModal({
  open,
  onClose,
  product,
  currency = "CAD",
}: QuickViewModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const sizes = product?.sizes || [];
  const colors = product?.colors || [];
  const availableSizes = useMemo(
    () => sizes.filter((s) => s.stock > 0),
    [sizes]
  );

  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  const activeSize = size || availableSizes[0]?.size || sizes[0]?.size || "";
  const activeColor = color || colors[0]?.name || "Default";
  const activeHex = colors.find((c) => c.name === activeColor)?.hex;

  if (!product) return null;

  const image = product.images?.[0];

  const addToBag = () => {
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
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Quick view" size="lg">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#141414]">
          <SafeImage
            src={image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="400px"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="font-serif text-2xl text-[#F5F0E6]">{product.name}</h3>
          <p className="mt-2 text-[#D4AF37]">
            {formatPrice(product.price, currency)}
          </p>

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

          {sizes.length > 0 ? (
            <div className="mt-6">
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/50">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    disabled={s.stock <= 0}
                    onClick={() => setSize(s.size)}
                    className={`min-w-10 border px-3 py-2 text-xs uppercase tracking-wider transition disabled:opacity-30 ${
                      activeSize === s.size
                        ? "border-[#D4AF37] text-[#D4AF37]"
                        : "border-white/20 text-[#F5F0E6] hover:border-white/50"
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Button onClick={addToBag} fullWidth>
              Add to bag
            </Button>
            <Link href={`/products/${product.slug}`} onClick={onClose}>
              <Button variant="ghost" fullWidth>
                View details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
