"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Zap,
  HeartHandshake,
  Shield,
  Eye,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { landingContent, type A20Step } from "@/content/landing";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { GradientText } from "@/components/ui/GradientText";
import { cn } from "@/lib/utils";

export function A20System() {
  const { a20System } = landingContent;
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isInverting, setIsInverting] = useState<boolean>(false);

  const activeStep = a20System.steps[activeStepIndex];

  return (
    <section
      id="cara-kerja"
      className="relative w-full bg-surface-base py-24 md:py-32 px-4 sm:px-6 overflow-hidden"
      aria-label="Section Sistem A20"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-start mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono font-semibold text-brand-teal uppercase tracking-wider mb-3">
            <span>{a20System.sectionNumber}</span>
            <span>·</span>
            <span className="text-text-primary">{a20System.tag}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-[1.15]">
            Dua Lapisan Pembentukan: Dari Refleks Menuju{" "}
            <GradientText variant="brand">Identitas Penjaga</GradientText>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-text-muted leading-relaxed">
            {a20System.description}
          </p>
        </div>

        {/* Perspective Inversion Interactive Callout Diagram */}
        <div className="mb-20 p-6 sm:p-8 rounded-3xl border border-white/10 bg-surface-card/60 backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-lg space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-alert-amber font-semibold flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                {a20System.inversionCallout.title}
              </span>
              <p className="text-sm sm:text-base text-text-primary/90 font-medium">
                {a20System.inversionCallout.description}
              </p>
            </div>

            {/* Interactive SVG Diagram Node */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              {/* Node 1: User */}
              <div
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-300 text-center w-36 sm:w-40",
                  !isInverting
                    ? "bg-brand-teal/10 border-brand-teal/40 text-text-primary"
                    : "bg-white/[0.03] border-white/10 text-text-muted"
                )}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal mx-auto mb-2">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold block">Posisi Kamu</span>
                <span className="text-[10px] font-mono text-brand-teal">Calon Penjaga</span>
              </div>

              {/* Rotating Inversion Button / Arrow */}
              <button
                type="button"
                onClick={() => setIsInverting(!isInverting)}
                className="group relative flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-text-primary transition-all active:scale-95"
                title="Klik untuk membalik sudut pandang"
              >
                <motion.div
                  animate={{ rotate: isInverting ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-8 h-8 rounded-full bg-alert-amber/20 text-alert-amber flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.div>
                <span className="text-[9px] font-mono uppercase tracking-tight text-alert-amber">
                  Inversi
                </span>
              </button>

              {/* Node 2: Attacker */}
              <div
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-300 text-center w-36 sm:w-40",
                  isInverting
                    ? "bg-alert-amber/10 border-alert-amber/50 text-text-primary"
                    : "bg-white/[0.03] border-white/10 text-text-muted"
                )}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-alert-amber/20 text-alert-amber mx-auto mb-2">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold block">Posisi Pelaku</span>
                <span className="text-[10px] font-mono text-alert-amber">Perekayasa Jebakan</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Step Navigation on Left + Interactive Mock on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Step Selectors */}
          <div className="lg:col-span-5 space-y-4">
            {a20System.steps.map((step: A20Step, index: number) => {
              const isActive = activeStepIndex === index;
              return (
                <button
                  key={step.codeName}
                  type="button"
                  onClick={() => setActiveStepIndex(index)}
                  className={cn(
                    "w-full text-left p-6 sm:p-7 rounded-3xl border transition-all duration-300 relative overflow-hidden",
                    isActive
                      ? "bg-surface-card border-brand-teal/40 shadow-xl shadow-black/40"
                      : "bg-surface-card/40 border-white/[0.06] hover:bg-surface-card/70 hover:border-white/15"
                  )}
                >
                  {isActive && (
                    <BorderBeam duration={12} borderWidth={1} colorFrom="#10B981" colorTo="#22D3EE" />
                  )}

                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-brand-teal">
                      {step.number} · {step.stage}
                    </span>
                    {step.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-white/70 border border-white/15">
                        {step.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4">
                    {step.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    {step.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-text-primary/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Visual Mock Panel corresponding to Step */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {activeStepIndex === 0 ? (
                // Step 01: Lite Visual Mock (Input -> Inversion -> Action Card)
                <motion.div
                  key="lite-mock"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-surface-card space-y-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-teal" />
                      <span className="text-xs font-mono font-semibold text-text-primary">
                        A20 LITE INTERFACE PREVIEW
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-brand-teal">
                      Target Waktu: 90s
                    </span>
                  </div>

                  {/* Flow Steps Mini Visuals */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand-teal/20 text-brand-teal font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <div className="text-xs space-y-0.5">
                        <span className="font-semibold text-text-primary block">Input Situasi</span>
                        <p className="text-text-muted">Tempel pesan WA mencurigakan atau pilih skenario fiktif.</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-alert-amber/[0.06] border border-alert-amber/30 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-alert-amber/20 text-alert-amber font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <div className="text-xs space-y-0.5">
                        <span className="font-semibold text-text-primary block">Tiga Pertanyaan Pelaku</span>
                        <p className="text-text-muted">Dipaksa berpikir: apa umpanmu? Mengapa buru-buru? Celah apa yang kamu sembunyikan?</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-brand-teal/[0.06] border border-brand-teal/30 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand-teal/20 text-brand-teal font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <div className="text-xs space-y-0.5">
                        <span className="font-semibold text-text-primary block">Action Card & Template Copy</span>
                        <p className="text-text-muted">Celah manipulasi yang kamu temukan sendiri + template pesan peringatan untuk disebarkan.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <a
                      href="#reverse-reflex"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-all"
                    >
                      <span>Demo Singkat di Bawah</span>
                    </a>
                    <Link
                      href="/lite"
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-brand-teal text-surface-base hover:bg-brand-teal/90 transition-all font-bold shadow-md"
                    >
                      <span>Buka Halaman A20 Lite</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                // Step 02: Soul Visual Mock (Ward Selection & Mission Decision)
                <motion.div
                  key="soul-mock"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-surface-card space-y-6 shadow-2xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      <span className="text-xs font-mono font-semibold text-text-primary">
                        A20 SOUL · THE GUARDIAN ARC
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-400/20 text-purple-300 border border-purple-400/30">
                      Live Interactive Route
                    </span>
                  </div>

                  {/* Mock Ward Profile */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-primary">Karakter yang Dijaga: Dian (19 thn)</span>
                      <span className="font-mono text-purple-300 text-[11px]">Adik Tingkat Kuliah</span>
                    </div>
                    <p className="text-xs text-text-muted">
                      &ldquo;Kak, di grup Telegram ini aku baru dapet 30rb habis review maps. Sekarang disuruh deposit 200rb buat komisi 550rb. Aman gak ya?&rdquo;
                    </p>
                  </div>

                  {/* Mock Multi-Path Choices */}
                  <div className="space-y-2 text-xs">
                    <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider block">
                      Pilihan Respons Kamu:
                    </span>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-text-primary/90 flex items-center justify-between">
                      <span>1. Langsung bentak dan suruh keluar grup</span>
                      <span className="text-[10px] font-mono text-rose-400">Trust -15 / Aware +25</span>
                    </div>
                    <div className="p-3 rounded-xl bg-brand-teal/10 border border-brand-teal/30 text-text-primary flex items-center justify-between">
                      <span>2. Pancing: &ldquo;Kenapa mereka rela buang 30rb ke orang asing?&rdquo;</span>
                      <span className="text-[10px] font-mono text-brand-teal">Trust +15 / Aware +25</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-text-muted italic">
                      Setiap pilihan mempengaruhi Trust dan Awareness Dian menuju salah satu dari 3 ending berbeda.
                    </p>
                    <Link
                      href="/soul"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md active:scale-95"
                    >
                      <span>Mulai Mainkan Cerita</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
