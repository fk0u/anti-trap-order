"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, DatabaseZap, HelpCircle, XCircle } from "lucide-react";
import { landingContent, type TrustCard } from "@/content/landing";
import { cn } from "@/lib/utils";

export function Trust() {
  const { trust } = landingContent;

  const iconMap = {
    shield: ShieldCheck,
    database: DatabaseZap,
    help: HelpCircle,
  };

  return (
    <section
      id="tentang"
      className="relative w-full bg-[#F7F8FA] text-[#0D1117] py-20 md:py-28 px-4 sm:px-6"
      aria-label="Section Prinsip dan Batasan"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-start mb-14 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.05] border border-black/10 text-xs font-mono font-semibold text-[#64748B] uppercase tracking-wider mb-3">
            <span>{trust.sectionNumber}</span>
            <span>·</span>
            <span className="text-[#0D1117]">{trust.tag}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0D1117] leading-[1.18]">
            {trust.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed">
            {trust.description}
          </p>
        </div>

        {/* 3 Core Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {trust.cards.map((card: TrustCard, index: number) => {
            const Icon = iconMap[card.iconType];
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-xl transition-all duration-300 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-[#94A3B8]">0{index + 1}</span>
                </div>

                <div>
                  <span className="text-xs font-mono text-emerald-700 font-semibold uppercase tracking-wider block mb-1">
                    {card.tagline}
                  </span>
                  <h3 className="text-lg font-bold text-[#0D1117]">
                    {card.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Radical Honesty Block: What ATO CANNOT do */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="p-6 sm:p-10 rounded-3xl bg-white border border-amber-300 text-slate-900 space-y-6 shadow-xl border-t-2 border-white"
        >
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-amber-600" />
              Transparansi Keterbatasan
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {trust.limitations.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {trust.limitations.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {trust.limitations.points.map((pt, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-slate-800 font-medium leading-relaxed flex items-start gap-3 shadow-xs"
              >
                <span className="text-amber-700 font-mono font-bold shrink-0">✕</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
