import React from "react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
}

export function BorderBeam({
  className,
  duration = 14,
  borderWidth = 1.5,
  colorFrom = "#10B981",
  colorTo = "#22D3EE",
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className
      )}
      style={{
        padding: `${borderWidth}px`,
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMask:
          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
      }}
    >
      <div
        className="absolute inset-[-150%] motion-reduce:hidden"
        style={{
          animation: `spin ${duration}s linear infinite`,
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 280deg, ${colorFrom} 330deg, ${colorTo} 360deg)`,
        }}
      />
    </div>
  );
}
