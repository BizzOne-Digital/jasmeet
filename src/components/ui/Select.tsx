"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, options, placeholder, id, ...props },
    ref
  ) => {
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
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-11 appearance-none bg-transparent border border-white/15 px-4 pr-10 text-sm text-[#F5F0E6] transition-colors duration-300 focus:outline-none focus:border-[#D4AF37]/70 disabled:opacity-50",
              error && "border-red-400/70 focus:border-red-400",
              className
            )}
            {...props}
          >
            {placeholder ? (
              <option value="" className="bg-black text-[#F5F0E6]">
                {placeholder}
              </option>
            ) : null}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-black text-[#F5F0E6]"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
        </div>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </div>
    );
  }
);

Select.displayName = "Select";
