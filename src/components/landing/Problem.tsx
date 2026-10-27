"use client";

import React from "react";
import { motion } from "framer-motion";
import { HelpCircle, AlertCircle, ArrowRight } from "lucide-react";
import { landingContent, type ProblemCard } from "@/content/landing";
import { cn } from "@/lib/utils";

export function Problem() {
  const { problem } = landingContent;

  return (
    <section
      id="masalah"
      className="relative w-full bg-[#F7F8FA] text-[#0D1117] py-20 md:py-28 px-4 sm:px-6 transition-colors"
      aria-label="Section Masalah"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-start mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.05] border border-black/10 text-xs font-mono font-semibold text-[#64748B] uppercase tracking-wider mb-3">
            <span>{problem.sectionNumber}</span>
            <span>·</span>
            <span className="text-[#0D1117]">{problem.tag}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0D1117] max-w-3xl leading-[1.18]">
            {problem.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#64748B] max-w-2xl leading-relaxed">
            {problem.description}
          </p>
        </div>

        {/* Bento Grid 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {problem.cards.map((card: ProblemCard, index: number) => {
            const isLarge = card.size === "large";
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
                  "relative rounded-3xl bg-white border border-[#E2E8F0] p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group",
                  isLarge ? "md:col-span-2" : "md:col-span-1"
                )}
              >
                {/* Top: Category Tag + Title */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-slate-100 text-[#475569] border border-slate-200">
                      {card.category}
                    </span>
                    <span className="text-xs font-mono text-[#94A3B8]">0{index + 1}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#0D1117] mb-5 group-hover:text-emerald-700 transition-colors">
                    {card.title}
                  </h3>

                  {/* Fictional Chat Bubble */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 mb-6">
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono">
                      <span className="font-semibold text-[#334155]">{card.chatBubble.sender}</span>
                      <span>Baru saja</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#1E293B] leading-relaxed">
                      {card.chatBubble.message}
                    </p>
                  </div>
                </div>

                {/* The Moment: "Ada yang aneh tapi apa?" */}
                <div className="pt-4 border-t border-[#F1F5F9] space-y-3">
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80">
                    <div className="relative mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white">
                      <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div className="text-xs space-y-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                        Momen Keraguan
                      </span>
                      <p className="text-[#78350F] font-semibold leading-snug">
                        {card.theDoubtQuestion}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {card.explanation}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Closing Line Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 sm:mt-24 p-8 sm:p-12 rounded-3xl bg-[#0D1117] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl"
        >
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#10B981] font-semibold block mb-2">
              Kunci Paradigma ATO
            </span>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
              &ldquo;{problem.closingHeadline}&rdquo;
            </p>
          </div>

          <a
            href="#cara-kerja"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold bg-white text-[#0D1117] hover:bg-slate-100 transition-all active:scale-[0.98]"
          >
            <span>Pelajari Sistem A20</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
