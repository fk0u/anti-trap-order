"use client";

import React from "react";
import { motion } from "framer-motion";
import { HelpCircle, ArrowRight } from "lucide-react";
import { landingContent, type ProblemCard } from "@/content/landing";
import { cn } from "@/lib/utils";

// Pastel pill color presets inspired by Schedule.ust reference
const PASTEL_TAG_STYLES: Record<string, string> = {
  default: "bg-cyan-400/20 text-cyan-200 border-cyan-300/40",
  "LOWONGAN KERJA": "bg-emerald-400/20 text-emerald-200 border-emerald-300/40",
  "KASUS REKENING": "bg-sky-400/20 text-sky-200 border-sky-300/40",
  "KELUARGA & KERABAT": "bg-amber-400/20 text-amber-200 border-amber-300/40",
  "BERKAS DIGITAL": "bg-purple-400/20 text-purple-200 border-purple-300/40",
};

export function Problem() {
  const { problem } = landingContent;

  return (
    <section
      id="masalah"
      className="relative w-full py-24 md:py-32 px-4 sm:px-6 transition-colors overflow-hidden"
      aria-label="Section Masalah"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-start mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full aero-pill text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-3">
            <span>{problem.sectionNumber}</span>
            <span>·</span>
            <span className="text-white">[ {problem.tag} ]</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.18] drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            {problem.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {problem.description}
          </p>
        </div>

        {/* Bento Grid 4 Cards with Frutiger Aero Translucent Glass */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {problem.cards.map((card: ProblemCard, index: number) => {
            const isLarge = card.size === "large";
            const tagClass = PASTEL_TAG_STYLES[card.category] || PASTEL_TAG_STYLES.default;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "relative rounded-3xl aero-card p-6 sm:p-8 flex flex-col justify-between group",
                  isLarge ? "md:col-span-2" : "md:col-span-1"
                )}
              >
                {/* Top: Category Tag + Title */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border shadow-sm",
                        tagClass
                      )}
                    >
                      {card.category}
                    </span>
                    <span className="text-xs font-mono text-cyan-300/70 font-semibold">[ 0{index + 1} ]</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-5 group-hover:text-cyan-200 transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                    {card.title}
                  </h3>

                  {/* Fictional Chat Bubble */}
                  <div className="p-4 rounded-2xl bg-black/30 border border-white/15 backdrop-blur-md space-y-2 mb-6 shadow-inner">
                    <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                      <span className="font-semibold text-white">{card.chatBubble.sender}</span>
                      <span className="text-cyan-300/80">Baru saja</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
                      {card.chatBubble.message}
                    </p>
                  </div>
                </div>

                {/* The Moment: "Ada yang aneh tapi apa?" */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 backdrop-blur-md shadow-sm">
                    <div className="relative mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-black shadow-[0_0_8px_#F59E0B]">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs space-y-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                        Momen Keraguan
                      </span>
                      <p className="text-amber-100 font-semibold leading-snug">
                        {card.theDoubtQuestion}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {card.explanation}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Closing Line Headline in Frutiger Aero Glass Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 sm:mt-24 p-8 sm:p-12 rounded-3xl aero-glass border-cyan-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden"
        >
          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-bold block mb-2">
              [ KUNCI PARADIGMA ATO // A20 ]
            </span>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              &ldquo;{problem.closingHeadline}&rdquo;
            </p>
          </div>

          <a
            href="#cara-kerja"
            className="shrink-0 relative z-10 inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold aero-btn-aqua"
          >
            <span>Pelajari Sistem A20</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
