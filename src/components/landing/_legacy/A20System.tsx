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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-xs font-mono font-bold text-sky-800 uppercase tracking-wider mb-3 shadow-xs">
            <span>{a20System.sectionNumber}</span>
            <span>·</span>
            <span className="text-slate-900">{a20System.tag}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Dua Lapisan Pembentukan: Dari Refleks Menuju{" "}
            <GradientText variant="brand">Identitas Penjaga</GradientText>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
            {a20System.description}
          </p>
        </div>

        {/* Perspective Inversion Interactive Callout Diagram */}
        <div className="mb-20 p-6 sm:p-8 rounded-3xl aero-card relative overflow-hidden shadow-xl border-t-2 border-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-lg space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-bold flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                [ {a20System.inversionCallout.title} ]
              </span>
              <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                {a20System.inversionCallout.description}
              </p>
            </div>

            {/* Interactive SVG Diagram Node */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              {/* Node 1: User */}
              <div
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-300 text-center w-36 sm:w-40 shadow-sm",
                  !isInverting
                    ? "aero-pill bg-sky-100 border-sky-300 text-sky-950 font-bold shadow-md"
                    : "bg-white/80 border-sky-200 text-slate-500"
                )}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-200/60 text-sky-700 mx-auto mb-2 shadow-inner">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold block text-slate-900">Posisi Kamu</span>
                <span className="text-[10px] font-mono text-sky-700 font-bold">Calon Penjaga</span>
              </div>

              {/* Rotating Inversion Button / Arrow */}
              <button
                type="button"
                onClick={() => setIsInverting(!isInverting)}
                className="group relative flex flex-col items-center gap-1.5 p-2 rounded-2xl aero-pill text-slate-700 hover:text-slate-900 transition-all active:scale-95 shadow-xs"
                title="Klik untuk membalik sudut pandang"
              >
                <motion.div
                  animate={{ rotate: isInverting ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shadow-inner border border-amber-300"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.div>
                <span className="text-[9px] font-mono uppercase tracking-tight text-amber-900 font-bold">
                  Inversi
                </span>
              </button>

              {/* Node 2: Attacker */}
              <div
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-300 text-center w-36 sm:w-40 shadow-sm",
                  isInverting
                    ? "aero-pill bg-amber-100 border-amber-300 text-amber-950 font-bold shadow-md"
                    : "bg-white/80 border-sky-200 text-slate-500"
                )}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-200/60 text-amber-800 mx-auto mb-2 shadow-inner">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold block text-slate-900">Posisi Pelaku</span>
                <span className="text-[10px] font-mono text-amber-800 font-bold">Perekayasa Jebakan</span>
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
                    "w-full text-left p-6 sm:p-7 rounded-3xl transition-all duration-300 relative overflow-hidden shadow-sm",
                    isActive
                      ? "aero-card border-sky-300 shadow-xl border-t-2 border-white"
                      : "bg-white/70 border border-sky-200 hover:bg-white hover:border-sky-300"
                  )}
                >
                  {isActive && (
                    <BorderBeam duration={12} borderWidth={1.5} colorFrom="#10B981" colorTo="#38BDF8" />
                  )}

                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-sky-700">
                      {step.number} · {step.stage}
                    </span>
                    {step.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-sky-100 text-sky-800 border border-sky-200 font-bold">
                        {step.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 font-medium">
                    {step.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-sky-100">
                    {step.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
                  className="p-6 sm:p-8 rounded-3xl aero-card space-y-6 shadow-xl border-t-2 border-white"
                >
                  <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_8px_#0284c7]" />
                      <span className="text-xs font-mono font-bold text-slate-900 tracking-wider">
                        [ A20 LITE // INTERFACE GADGET ]
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-sky-700 font-bold">
                      Target Refleks: 90s
                    </span>
                  </div>

                  {/* Flow Steps Mini Visuals */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                        1
                      </span>
                      <div className="text-xs space-y-0.5">
                        <span className="font-bold text-slate-900 block">Input Situasi</span>
                        <p className="text-slate-600 font-medium">Tempel pesan WA mencurigakan atau pilih skenario fiktif.</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                        2
                      </span>
                      <div className="text-xs space-y-0.5">
                        <span className="font-bold text-slate-900 block">Tiga Pertanyaan Pelaku</span>
                        <p className="text-slate-600 font-medium">Dipaksa berpikir: apa umpanmu? Mengapa buru-buru? Celah apa yang kamu sembunyikan?</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-300 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                        3
                      </span>
                      <div className="text-xs space-y-0.5">
                        <span className="font-bold text-slate-900 block">Action Card & Template Copy</span>
                        <p className="text-slate-600 font-medium">Celah manipulasi yang kamu temukan sendiri + template pesan peringatan untuk disebarkan.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <a
                      href="#reverse-reflex"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold aero-pill text-slate-800 hover:border-sky-300 hover:bg-sky-50 shadow-xs transition-all"
                    >
                      <span>Demo Singkat di Bawah</span>
                    </a>
                    <Link
                      href="/lite"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold aero-btn-aqua text-white shadow-md"
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
                  className="p-6 sm:p-8 rounded-3xl aero-card space-y-6 shadow-xl relative overflow-hidden border-t-2 border-white"
                >
                  <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                      <span className="text-xs font-mono font-bold text-slate-900 tracking-wider">
                        [ A20 SOUL // THE GUARDIAN ARC ]
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      Interactive Narrative
                    </span>
                  </div>

                  {/* Mock Ward Profile */}
                  <div className="p-4 rounded-2xl bg-white border border-sky-200 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">Karakter yang Dijaga: Dian (19 thn)</span>
                      <span className="font-mono text-sky-700 text-[11px] font-bold">[ Adik Tingkat Kuliah ]</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-mono font-medium">
                      &ldquo;Kak, di grup Telegram ini aku baru dapet 30rb habis review maps. Sekarang disuruh deposit 200rb buat komisi 550rb. Aman gak ya?&rdquo;
                    </p>
                  </div>

                  {/* Mock Multi-Path Choices */}
                  <div className="space-y-2 text-xs">
                    <span className="font-mono text-[11px] text-sky-800 uppercase tracking-wider block font-bold">
                      Pilihan Respons Kamu:
                    </span>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-between font-medium">
                      <span>1. Langsung bentak dan suruh keluar grup</span>
                      <span className="text-[10px] font-mono text-rose-700 font-bold">Trust -15 / Aware +25</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-slate-900 flex items-center justify-between font-bold">
                      <span>2. Pancing: &ldquo;Kenapa mereka rela buang 30rb ke orang asing?&rdquo;</span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">Trust +15 / Aware +25</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <p className="text-[11px] text-slate-600 italic font-medium">
                      Setiap pilihan mempengaruhi Trust dan Awareness Dian menuju salah satu dari 3 ending berbeda.
                    </p>
                    <Link
                      href="/soul"
                      className="shrink-0 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold aero-btn-emerald text-white shadow-md"
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
