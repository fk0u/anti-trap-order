"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { landingContent } from "@/content/landing";
import { GridBackground } from "@/components/ui/GridBackground";
import { Aurora } from "@/components/ui/Aurora";
import { GradientText } from "@/components/ui/GradientText";
import { BorderBeam } from "@/components/ui/BorderBeam";

export function FinalCTA() {
  const { finalCta } = landingContent;

  const handleScrollToDemo = () => {
    const el = document.getElementById("reverse-reflex");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full py-16 md:py-24 px-2 sm:px-4">
      {/* Big Rounded Card (Bookend with Hero) */}
      <div className="relative max-w-6xl mx-auto rounded-[28px] md:rounded-[44px] overflow-hidden aero-glass bg-eco-grid border border-sky-300 p-8 sm:p-16 md:p-20 text-center shadow-xl border-t-2 border-white">
        <BorderBeam duration={18} borderWidth={1.5} colorFrom="#10B981" colorTo="#38BDF8" />

        {/* Ambient Grid & Aurora Background */}
        <GridBackground className="absolute inset-0">
          <Aurora />
        </GridBackground>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-300 text-xs font-mono font-bold text-sky-800 uppercase tracking-wider mb-6 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>{finalCta.tag}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-5">
            Sedang dapat pesan atau tawaran yang bikin kamu{" "}
            <GradientText variant="brand">ragu?</GradientText>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl mb-8">
            {finalCta.description}
          </p>

          <button
            type="button"
            onClick={handleScrollToDemo}
            className="group inline-flex items-center gap-2 px-9 py-4 rounded-full text-sm font-bold aero-btn-aqua text-white shadow-lg active:scale-95 transition-all"
          >
            <span>{finalCta.ctaLabel}</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
