import type { IProduct } from "@/models/Product";

export interface InventoryRow {
  colorName: string;
  size: string;
  stock: number;
}

type ProductLike = {
  sizes?: Array<{ size: string; stock: number }>;
  inventory?: InventoryRow[];
  allowPreOrder?: boolean;
  preOrderLeadTime?: string;
};

/** Parse cart size strings like "Bra M / Trouser L" into component sizes. */
export function parseCompoundSize(size: string): string[] {
  if (!size.includes("/")) return [size.trim()].filter(Boolean);
  return size
    .split("/")
    .map((part) => {
      const tokens = part.trim().split(/\s+/).filter(Boolean);
      return tokens[tokens.length - 1] || part.trim();
    })
    .filter(Boolean);
}

/** Resolve stock for a colour + size combination. */
export function getVariantStock(
  product: ProductLike,
  colorName: string,
  size: string
): number {
  const inventory = product.inventory?.filter(
    (row) => row.colorName && row.size
  );
  if (inventory?.length) {
    const match = inventory.find(
      (row) =>
        row.colorName.toLowerCase() === colorName.toLowerCase() &&
        row.size.toLowerCase() === size.toLowerCase()
    );
    if (match) return Math.max(0, match.stock || 0);
    return 0;
  }

  const sizeRow = product.sizes?.find(
    (s) => s.size.toLowerCase() === size.toLowerCase()
  );
  return Math.max(0, sizeRow?.stock || 0);
}

export function isVariantPurchasable(
  product: ProductLike,
  colorName: string,
  size: string,
  qty = 1
): { ok: boolean; stock: number; isPreOrder: boolean } {
  const parts = parseCompoundSize(size);
  if (parts.length > 1) {
    const checks = parts.map((part) =>
      isVariantPurchasable(product, colorName, part, qty)
    );
    const ok = checks.every((c) => c.ok);
    const isPreOrder = checks.some((c) => c.isPreOrder);
    const stock = Math.min(...checks.map((c) => c.stock));
    return { ok, stock, isPreOrder };
  }

  const stock = getVariantStock(product, colorName, size);
  if (stock >= qty) return { ok: true, stock, isPreOrder: false };
  if (product.allowPreOrder) return { ok: true, stock, isPreOrder: true };
  return { ok: false, stock, isPreOrder: false };
}

export function buildInventoryMatrix(
  colors: Array<{ name: string }>,
  sizes: Array<{ size: string; stock?: number }>,
  existing?: InventoryRow[]
): InventoryRow[] {
  const map = new Map(
    (existing || []).map((r) => [
      `${r.colorName.toLowerCase()}::${r.size.toLowerCase()}`,
      r.stock,
    ])
  );
  const rows: InventoryRow[] = [];
  for (const color of colors) {
    for (const size of sizes) {
      const key = `${color.name.toLowerCase()}::${size.size.toLowerCase()}`;
      rows.push({
        colorName: color.name,
        size: size.size,
        stock: map.has(key) ? (map.get(key) as number) : size.stock ?? 0,
      });
    }
  }
  return rows;
}

/** Decrement stock for in-stock portions; skip pre-order portions. */
export function decrementPurchasableInventory(
  product: IProduct,
  colorName: string,
  size: string,
  qty: number
): boolean {
  const parts = parseCompoundSize(size);
  if (parts.length > 1) {
    for (const part of parts) {
      const check = isVariantPurchasable(product, colorName, part, qty);
      if (!check.ok) return false;
      if (!check.isPreOrder) {
        if (!decrementInventory(product, colorName, part, qty)) return false;
      }
    }
    return true;
  }

  const check = isVariantPurchasable(product, colorName, size, qty);
  if (!check.ok) return false;
  if (check.isPreOrder) return true;
  return decrementInventory(product, colorName, size, qty);
}

/** Restore stock when an order is cancelled or refunded (non-pre-order lines only). */
export function restoreInventory(
  product: IProduct,
  colorName: string,
  size: string,
  qty: number
): void {
  const parts = parseCompoundSize(size);
  const sizesToRestore = parts.length > 1 ? parts : [size];

  for (const part of sizesToRestore) {
    const inventory = product.inventory;
    if (inventory?.length) {
      const row = inventory.find(
        (r) =>
          r.colorName.toLowerCase() === colorName.toLowerCase() &&
          r.size.toLowerCase() === part.toLowerCase()
      );
      if (row) {
        row.stock += qty;
        continue;
      }
    }

    const sizeRow = product.sizes?.find(
      (s) => s.size.toLowerCase() === part.toLowerCase()
    );
    if (sizeRow) sizeRow.stock += qty;
  }
}

/** Decrement stock for an ordered line (mutates lean/doc-friendly product object). */
export function decrementInventory(
  product: IProduct,
  colorName: string,
  size: string,
  qty: number
): boolean {
  const parts = parseCompoundSize(size);
  if (parts.length > 1) {
    return parts.every((part) =>
      decrementInventory(product, colorName, part, qty)
    );
  }

  const inventory = product.inventory;
  if (inventory?.length) {
    const row = inventory.find(
      (r) =>
        r.colorName.toLowerCase() === colorName.toLowerCase() &&
        r.size.toLowerCase() === size.toLowerCase()
    );
    if (!row || row.stock < qty) return false;
    row.stock -= qty;
    return true;
  }

  const sizeRow = product.sizes?.find(
    (s) => s.size.toLowerCase() === size.toLowerCase()
  );
  if (!sizeRow || sizeRow.stock < qty) return false;
  sizeRow.stock -= qty;
  return true;
}
