import React from "react";
import { landingContent, type MarqueeChip } from "@/content/landing";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  className?: string;
}

export function Marquee({ className }: MarqueeProps) {
  const { marqueeChips } = landingContent;
  // Duplicate list to achieve seamless infinite loop
  const duplicatedChips = [...marqueeChips, ...marqueeChips, ...marqueeChips];

  const categoryColorMap: Record<MarqueeChip["category"], string> = {
    lowongan: "text-brand-cyan border-brand-cyan/30 bg-brand-cyan/5",
    urgensi: "text-alert-amber border-alert-amber/30 bg-alert-amber/5",
    impersonasi: "text-purple-400 border-purple-400/30 bg-purple-400/5",
    phishing: "text-rose-400 border-rose-400/30 bg-rose-400/5",
    finansial: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden py-4 select-none",
        className
      )}
      aria-label="Contoh skenario tipuan digital yang sering beredar"
    >
      {/* Edge gradient fade masks for clean marquee entry and exit */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-surface-base to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-surface-base to-transparent z-10" />

      {/* Marquee Track */}
      <div className="flex w-max items-center gap-3 animate-marquee hover:[animation-play-state:paused]">
        {duplicatedChips.map((chip: MarqueeChip, index: number) => (
          <div
            key={`${chip.id}-${index}`}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md",
              "text-xs text-text-primary/90 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.08]"
            )}
          >
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border",
                categoryColorMap[chip.category]
              )}
            >
              {chip.category}
            </span>
            <span className="font-medium text-[13px]">{chip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
