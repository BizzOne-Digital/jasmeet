"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";

export interface ProvidersProps {
  children: ReactNode;
}

/**
 * App-level client providers. Cart/wishlist use Zustand persist (no provider needed).
 * SessionProvider is omitted on the public storefront — admin auth uses server/session routes.
 */
export function Providers({ children }: ProvidersProps) {
  return <ToastProvider>{children}</ToastProvider>;
}
