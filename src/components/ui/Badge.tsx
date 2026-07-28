import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "sale" | "new" | "neutral" | "outline";
  className?: string;
}

const variants = {
  gold: "bg-[#D4AF37] text-black",
  sale: "bg-[#8B1E1E] text-[#F5F0E6]",
  new: "bg-[#F5F0E6] text-black",
  neutral: "bg-white/10 text-[#F5F0E6]",
  outline: "border border-[#D4AF37]/60 text-[#D4AF37] bg-transparent",
};

export function Badge({ children, variant = "gold", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
