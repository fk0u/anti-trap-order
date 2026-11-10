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
    lowongan: "text-sky-800 border-sky-300 bg-sky-100 font-bold",
    urgensi: "text-amber-800 border-amber-300 bg-amber-100 font-bold",
    impersonasi: "text-purple-800 border-purple-300 bg-purple-100 font-bold",
    phishing: "text-rose-800 border-rose-300 bg-rose-100 font-bold",
    finansial: "text-emerald-800 border-emerald-300 bg-emerald-100 font-bold",
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
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#f4faff] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#f4faff] to-transparent z-10" />

      {/* Marquee Track */}
      <div className="flex w-max items-center gap-3 animate-marquee hover:[animation-play-state:paused]">
        {duplicatedChips.map((chip: MarqueeChip, index: number) => (
          <div
            key={`${chip.id}-${index}`}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-sky-200 bg-white/95 shadow-xs",
              "text-xs text-slate-800 font-medium transition-all duration-200 hover:border-sky-400 hover:bg-white"
            )}
          >
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border",
                categoryColorMap[chip.category]
              )}
            >
              {chip.category}
            </span>
            <span className="font-semibold text-[13px] text-slate-800">{chip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
