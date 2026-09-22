import type { CartItem } from "@/types";

/** Small badge + lead time for pre-order lines in cart/checkout. */
export function CartPreOrderBadge({
  item,
  className,
}: {
  item: Pick<CartItem, "isPreOrder" | "preOrderLeadTime">;
  className?: string;
}) {
  if (!item.isPreOrder) return null;

  return (
    <p
      className={
        className ||
        "mt-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gold"
      }
    >
      {item.preOrderLeadTime || "Pre-Order – Ships in 2–3 weeks"}
    </p>
  );
}

export function cartHasPreOrderItems(items: CartItem[]): boolean {
  return items.some((i) => i.isPreOrder);
}
