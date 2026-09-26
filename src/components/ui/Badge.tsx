import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "sale" | "new" | "bestseller" | "soon" | "preorder" | "neutral" | "outline";
  className?: string;
}

const variants = {
  gold: "rounded-full bg-[#D4AF37] text-black",
  sale: "rounded-full bg-[#8B1E1E] text-[#F5F0E6]",
  new: "rounded-full bg-white text-black",
  bestseller: "rounded-full bg-[#D4AF37]/90 text-black",
  soon: "rounded-full bg-white text-black",
  preorder: "rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#D4AF37]",
  neutral: "rounded-full bg-white/10 text-[#F5F0E6]",
  outline: "rounded-full border border-[#D4AF37]/60 text-[#D4AF37] bg-transparent",
};

export function Badge({ children, variant = "gold", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-[10px] uppercase tracking-[0.14em] font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
