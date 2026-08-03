"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-2">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-[11px] uppercase tracking-[0.2em] text-[#F5F0E6]/70"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-11 bg-transparent border border-white/15 px-4 text-sm text-[#F5F0E6] placeholder:text-white/35 transition-colors duration-300 focus:outline-none focus-visible:border-[#D4AF37] focus-visible:ring-2 focus-visible:ring-[#D4AF37]/40 disabled:opacity-50",
            error && "border-red-400/70 focus:border-red-400",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : hint ? (
          <p className="text-xs text-white/40">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
