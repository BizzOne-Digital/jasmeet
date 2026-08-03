import type { ShippingMethod } from "@/lib/order-status";

export function normalizePostalCode(code: string): string {
  return code.replace(/\s+/g, "").toUpperCase();
}

/** Match full codes or prefixes (e.g. M5V matches M5V2T6). */
export function isLocalDeliveryEligible(
  postalCode: string,
  eligible: string[]
): boolean {
  if (!eligible?.length) return false;
  const normalized = normalizePostalCode(postalCode);
  if (!normalized) return false;

  return eligible.some((entry) => {
    const prefix = normalizePostalCode(entry);
    if (!prefix) return false;
    return normalized === prefix || normalized.startsWith(prefix);
  });
}

export function calculateShipping(options: {
  subtotal: number;
  method: ShippingMethod;
  shippingThreshold: number;
  standardShippingRate: number;
  localDeliveryFee: number;
  localDeliveryEnabled: boolean;
  localDeliveryPostalCodes: string[];
  postalCode: string;
}): { shipping: number; method: ShippingMethod; error?: string } {
  const {
    subtotal,
    method,
    shippingThreshold,
    standardShippingRate,
    localDeliveryFee,
    localDeliveryEnabled,
    localDeliveryPostalCodes,
    postalCode,
  } = options;

  if (method === "local") {
    if (!localDeliveryEnabled) {
      return {
        shipping: 0,
        method: "standard",
        error: "Local delivery is not available.",
      };
    }
    if (!isLocalDeliveryEligible(postalCode, localDeliveryPostalCodes)) {
      return {
        shipping: 0,
        method: "standard",
        error: "This postal code is not eligible for local delivery.",
      };
    }
    return { shipping: Math.max(0, localDeliveryFee), method: "local" };
  }

  const rate = Math.max(0, standardShippingRate);
  const threshold = Math.max(0, shippingThreshold);
  return {
    shipping: subtotal >= threshold ? 0 : rate,
    method: "standard",
  };
}
