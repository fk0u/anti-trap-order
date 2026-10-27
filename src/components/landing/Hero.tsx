"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { landingContent } from "@/content/landing";
import { GridBackground } from "@/components/ui/GridBackground";
import { Aurora } from "@/components/ui/Aurora";
import { CursorSpotlight } from "@/components/ui/CursorSpotlight";
import { GradientText } from "@/components/ui/GradientText";
import { HeroConsole } from "@/components/landing/HeroConsole";
import { Marquee } from "@/components/landing/Marquee";
import { cn } from "@/lib/utils";

export function Hero() {
  const { hero } = landingContent;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full pt-20 md:pt-24 pb-8">
      {/* Outer Rounded Shell with Inset from Viewport Margins */}
      <div className="relative mx-2 md:mx-4 rounded-[28px] md:rounded-[44px] overflow-hidden bg-surface-base border border-white/[0.08] min-h-[calc(100svh-1rem)] flex flex-col justify-between shadow-2xl">
        {/* Layer 1: Grid Background with Elliptical Radial Mask */}
        <GridBackground className="absolute inset-0">
          {/* Layer 2: Ambient Aurora Blobs */}
          <Aurora />

          {/* Layer 3: Noise Overlay is included inside GridBackground */}

          {/* Layer 4: Desktop Mouse Cursor Spotlight */}
          <CursorSpotlight />
        </GridBackground>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-16 md:pt-20 text-center flex flex-col items-center">
          {/* Announcement Pill with Pulsing Dot */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex"
          >
            <a
              href={hero.announcement.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full",
                "border border-white/10 bg-white/[0.04] backdrop-blur-xl",
                "text-xs text-text-primary/90 transition-all duration-200",
                "hover:border-brand-teal/40 hover:bg-white/[0.08]"
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal shadow-[0_0_8px_#10B981]" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-brand-teal font-semibold">
                {hero.announcement.tag}
              </span>
              <span className="text-white/20">|</span>
              <span className="text-text-muted group-hover:text-text-primary transition-colors">
                {hero.announcement.text}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </motion.div>

          {/* Headline Reveal with Line Mask + TranslateY */}
          <div className="overflow-hidden mb-4">
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.12]"
            >
              <span className="block text-text-primary font-semibold">
                {hero.headline.line1}
              </span>
              <span className="block mt-1">
                <span className="text-text-primary font-semibold">
                  {hero.headline.line2Part1}
                </span>
                <GradientText variant="brand" className="font-bold">
                  {hero.headline.line2Highlight}
                </GradientText>
              </span>
            </motion.h1>
          </div>

          {/* Subheadline (Max 2 crisp sentences) */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl text-base sm:text-lg text-text-muted leading-relaxed mb-8"
          >
            {hero.subheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
          >
            {/* Primary CTA */}
            <a
              href={hero.primaryCta.href}
              className={cn(
                "group relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-semibold",
                "bg-text-primary text-surface-base shadow-xl shadow-white/10",
                "hover:brightness-105 active:scale-[0.98] transition-all duration-200"
              )}
            >
              <span>{hero.primaryCta.label}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            {/* Secondary CTA */}
            <button
              type="button"
              onClick={() => scrollToSection(hero.secondaryCta.targetId)}
              className={cn(
                "inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-medium",
                "text-text-muted hover:text-text-primary hover:bg-white/[0.05] border border-transparent hover:border-white/10",
                "transition-all duration-200"
              )}
            >
              <span>{hero.secondaryCta.label}</span>
              <ArrowDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </motion.div>

          {/* Microcopy Mono */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[11px] text-text-muted/70"
          >
            {hero.microcopy.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="opacity-40">·</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </motion.div>

          {/* HeroConsole Preview: Positioned at bottom center, cut off slightly on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full mt-12 sm:mt-16 -mb-6 md:-mb-14 relative z-20"
          >
            <HeroConsole />
          </motion.div>
        </div>
      </div>

      {/* Marquee Chip Scenarios Right Below the Shell */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-6">
        <Marquee />
      </div>
    </section>
  );
}
