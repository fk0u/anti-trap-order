import React from "react";
import { cn } from "@/lib/utils";

interface AuroraProps {
  className?: string;
}

export function Aurora({ className }: AuroraProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        className
      )}
      aria-hidden="true"
    >
      {/* Blob 1: Brand Teal - top center/left */}
      <div
        className="absolute -top-[15%] left-[10%] h-[380px] w-[500px] rounded-full bg-[#10B981] opacity-30 blur-[120px] will-change-transform motion-safe:animate-aurora-1"
      />

      {/* Blob 2: Brand Cyan - top right */}
      <div
        className="absolute top-[5%] right-[5%] h-[420px] w-[540px] rounded-full bg-[#22D3EE] opacity-25 blur-[130px] will-change-transform motion-safe:animate-aurora-2"
      />

      {/* Blob 3: Subtle Alert Amber - bottom corner accent */}
      <div
        className="absolute top-[45%] left-[40%] h-[300px] w-[360px] rounded-full bg-[#F59E0B] opacity-[0.14] blur-[140px] will-change-transform"
      />
    </div>
  );
}
