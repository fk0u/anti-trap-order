"use client";

import React from "react";
import { motion } from "framer-motion";
import { HelpCircle, ArrowRight } from "lucide-react";
import { landingContent, type ProblemCard } from "@/content/landing";
import { cn } from "@/lib/utils";

// Pastel pill color presets inspired by Schedule.ust & Phoning NewJeans
const PASTEL_TAG_STYLES: Record<string, string> = {
  default: "bg-sky-100 text-sky-800 border-sky-300 font-bold",
  "LOWONGAN KERJA": "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
  "KASUS REKENING": "bg-sky-100 text-sky-800 border-sky-300 font-bold",
  "KELUARGA & KERABAT": "bg-amber-100 text-amber-800 border-amber-300 font-bold",
  "BERKAS DIGITAL": "bg-purple-100 text-purple-800 border-purple-300 font-bold",
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full aero-pill text-xs font-mono font-bold text-sky-800 uppercase tracking-wider mb-3 shadow-xs">
            <span>{problem.sectionNumber}</span>
            <span>·</span>
            <span className="text-slate-800">[ {problem.tag} ]</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl leading-[1.18]">
            {problem.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-medium">
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
                  "relative rounded-3xl aero-card p-6 sm:p-8 flex flex-col justify-between group shadow-lg border-t-2 border-white",
                  isLarge ? "md:col-span-2" : "md:col-span-1"
                )}
              >
                {/* Top: Category Tag + Title */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border shadow-xs",
                        tagClass
                      )}
                    >
                      {card.category}
                    </span>
                    <span className="text-xs font-mono text-sky-700 font-bold">[ 0{index + 1} ]</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-5 group-hover:text-sky-700 transition-colors">
                    {card.title}
                  </h3>

                  {/* Fictional Chat Bubble */}
                  <div className="p-4 rounded-2xl bg-white border border-sky-200 space-y-2 mb-6 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono font-bold">
                      <span className="text-slate-800">{card.chatBubble.sender}</span>
                      <span className="text-sky-600">Baru saja</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-mono font-medium">
                      {card.chatBubble.message}
                    </p>
                  </div>
                </div>

                {/* The Moment: "Ada yang aneh tapi apa?" */}
                <div className="pt-4 border-t border-sky-100 space-y-3">
                  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-xs">
                    <div className="relative mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-slate-900 shadow-xs">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs space-y-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                        Momen Keraguan
                      </span>
                      <p className="text-amber-950 font-bold leading-snug">
                        {card.theDoubtQuestion}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
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
          className="mt-16 sm:mt-24 p-8 sm:p-12 rounded-3xl aero-glass border-sky-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden border-t-2 border-white"
        >
          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-800 font-extrabold block mb-2">
              [ KUNCI PARADIGMA ATO // A20 ]
            </span>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              &ldquo;{problem.closingHeadline}&rdquo;
            </p>
          </div>

          <a
            href="#cara-kerja"
            className="shrink-0 relative z-10 inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold aero-btn-aqua text-white shadow-md"
          >
            <span>Pelajari Sistem A20</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
