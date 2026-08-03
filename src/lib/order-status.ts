/** Canonical order / fulfillment statuses for DAYAURA launch. */
export const ORDER_STATUSES = [
  "order_received",
  "processing",
  "packed",
  "shipped",
  "out_for_local_delivery",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  order_received: "Order Received",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_local_delivery: "Out for Local Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const SHIPPING_METHODS = ["standard", "local"] as const;
export type ShippingMethod = (typeof SHIPPING_METHODS)[number];

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  standard: "Standard Shipping",
  local: "Local Delivery",
};

/** Statuses that trigger a customer email when changed. */
export const EMAIL_ON_STATUS: OrderStatus[] = [
  "order_received",
  "processing",
  "packed",
  "shipped",
  "out_for_local_delivery",
  "delivered",
  "cancelled",
  "refunded",
];
