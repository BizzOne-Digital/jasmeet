"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#D4AF37] text-black hover:bg-[#c4a030] border border-transparent shadow-[0_0_0_1px_rgba(212,175,55,0.2)]",
  secondary:
    "bg-[#F5F0E6] text-black hover:bg-[#ebe4d6] border border-transparent",
  ghost:
    "bg-transparent text-[#F5F0E6] hover:bg-white/5 border border-transparent",
  outline:
    "bg-transparent text-[#F5F0E6] border border-[#D4AF37]/50 hover:border-[#D4AF37] hover:text-[#D4AF37]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs tracking-[0.18em]",
  md: "h-11 px-6 text-xs tracking-[0.2em]",
  lg: "h-12 px-8 text-sm tracking-[0.22em]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth,
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 uppercase font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
