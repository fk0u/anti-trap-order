import React from "react";
import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function GridBackground({ className, children }: GridBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Grid Pattern Layer with radial elliptical mask */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid-pattern"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 50% at 50% 30%, black 20%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 50% at 50% 30%, black 20%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      {/* Noise Overlay Layer */}
      <div
        className="pointer-events-none absolute inset-0 bg-noise opacity-[0.04] mix-blend-overlay"
        aria-hidden="true"
      />

      {/* Bottom Edge Fade for smooth section transitions */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface-base to-transparent"
        aria-hidden="true"
      />

      {children}
    </div>
  );
}
