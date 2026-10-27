import React from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "brand" | "headline" | "muted" | "amber";
  className?: string;
}

export function GradientText({
  children,
  variant = "brand",
  className,
  ...props
}: GradientTextProps) {
  const variantStyles = {
    brand: "bg-gradient-to-r from-[#10B981] via-[#14B8A6] to-[#22D3EE] bg-clip-text text-transparent",
    headline: "bg-gradient-to-b from-white via-white/95 to-white/60 bg-clip-text text-transparent",
    muted: "bg-gradient-to-b from-white/80 to-white/40 bg-clip-text text-transparent",
    amber: "bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent",
  };

  return (
    <span
      className={cn("inline-block", variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
