"use client";

import React, { useEffect, useReducer, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  Pause,
  Play,
  AlertTriangle,
  Shield,
  Eye,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { landingContent } from "@/content/landing";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3 | 4;

interface State {
  step: Step;
  isPaused: boolean;
  copied: boolean;
}

type Action =
  | { type: "NEXT_STEP" }
  | { type: "SET_STEP"; payload: Step }
  | { type: "TOGGLE_PAUSE" }
  | { type: "SET_COPIED"; payload: boolean };

function consoleReducer(state: State, action: Action): State {
  switch (action.type) {
    case "NEXT_STEP":
      return {
        ...state,
        step: ((state.step + 1) % 5) as Step,
      };
    case "SET_STEP":
      return {
        ...state,
        step: action.payload,
      };
    case "TOGGLE_PAUSE":
      return {
        ...state,
        isPaused: !state.isPaused,
      };
    case "SET_COPIED":
      return {
        ...state,
        copied: action.payload,
      };
    default:
      return state;
  }
}

export function HeroConsole() {
  const { heroConsole } = landingContent;
  const [state, dispatch] = useReducer(consoleReducer, {
    step: 4, // default render frame akhir untuk SSR / no-JS / reduced-motion
    isPaused: false,
    copied: false,
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // If user prefers reduced motion, stay on the final frame (step 4)
    if (mediaQuery.matches) {
      dispatch({ type: "SET_STEP", payload: 4 });
      return;
    }

    // Start from step 0 when running in browser with motion enabled
    dispatch({ type: "SET_STEP", payload: 0 });
  }, []);

  // Step timing configuration (ms)
  const stepDurations: Record<Step, number> = {
    0: 1600, // Typing indicator
    1: 2400, // Chat delivered, mode sasaran
    2: 2400, // Switch to mode pelaku
    3: 2600, // Highlight red-flags
    4: 3800, // Action card view before loop
  };

  useEffect(() => {
    if (state.isPaused || prefersReducedMotion) return;

    const timer = setTimeout(() => {
      dispatch({ type: "NEXT_STEP" });
    }, stepDurations[state.step]);

    return () => clearTimeout(timer);
  }, [state.step, state.isPaused, prefersReducedMotion]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(heroConsole.actionCard.warningCopyText);
    dispatch({ type: "SET_COPIED", payload: true });
    setTimeout(() => {
      dispatch({ type: "SET_COPIED", payload: false });
    }, 2200);
  };

  const isAttackerMode = state.step >= 2;
  const showHighlights = state.step >= 3;
  const showActionCard = state.step >= 4;

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl md:rounded-3xl aero-card shadow-2xl overflow-hidden text-left">
      {/* Signature Animated Border Beam */}
      <BorderBeam duration={16} borderWidth={1.5} colorFrom="#10B981" colorTo="#38BDF8" />

      {/* Top Window Bar: Frutiger Aero Gadget Top */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sky-200/80 bg-white/60">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-gradient-to-b from-rose-400 to-rose-500 border border-white/60 shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-gradient-to-b from-amber-300 to-amber-400 border border-white/60 shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 border border-white/60 shadow-sm" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-sky-800 font-bold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-sky-600" />
            [ REVERSE-REFLEX // AERO GADGET ]
          </span>
        </div>

        {/* Mode Toggle Indicator (Victim vs Scammer) */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center p-0.5 rounded-full bg-sky-100/80 border border-sky-300 text-[11px] font-mono shadow-inner">
            <motion.div
              className={cn(
                "absolute inset-y-0.5 rounded-full transition-colors",
                isAttackerMode
                  ? "right-0.5 w-[50%] bg-amber-200/90 border border-amber-400 shadow-sm"
                  : "left-0.5 w-[50%] bg-white border border-sky-300 shadow-sm"
              )}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <span
              className={cn(
                "relative z-10 px-2.5 py-0.5 transition-colors font-bold",
                !isAttackerMode ? "text-sky-950" : "text-slate-500"
              )}
            >
              {heroConsole.victimModeLabel}
            </span>
            <span
              className={cn(
                "relative z-10 px-2.5 py-0.5 transition-colors font-bold",
                isAttackerMode ? "text-amber-900" : "text-slate-500"
              )}
            >
              {heroConsole.attackerModeLabel}
            </span>
          </div>

          {/* Pause / Resume Button for a11y */}
          <button
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-sky-200 bg-white/80 hover:bg-sky-50 text-slate-700 shadow-xs transition-colors"
            aria-label={state.isPaused ? "Lanjutkan animasi simulasi" : "Jeda animasi simulasi"}
            title={state.isPaused ? "Play" : "Pause"}
          >
            {state.isPaused ? <Play className="w-3.5 h-3.5 text-sky-700" /> : <Pause className="w-3.5 h-3.5 text-sky-700" />}
          </button>
        </div>
      </div>

      {/* Main Console Body */}
      <div className="p-4 sm:p-6 space-y-5 bg-white/70">
        {/* Step Indicator status */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 border-b border-sky-100 pb-2.5 font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>KASUS NYATA: TAWARAN KERJA INSTAN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Fase 0{state.step + 1}/05</span>
          </div>
        </div>

        {/* Fictional Chat Message Container */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <span className="font-bold text-slate-800">{heroConsole.chatSender}</span>
            <span>·</span>
            <span className="font-mono text-[11px]">{heroConsole.chatTime}</span>
          </div>

          <div className="relative max-w-xl">
            {state.step === 0 ? (
              // Step 0: Typing Indicator
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-sky-200 text-slate-600 text-xs font-mono shadow-xs">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" />
                </span>
                <span>{heroConsole.typingText}</span>
              </div>
            ) : (
              // Step 1 to 4: Incoming Fictional Message
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-2xl rounded-tl-sm text-sm sm:text-base leading-relaxed transition-all duration-300",
                  "bg-white border text-slate-800 shadow-md",
                  isAttackerMode ? "border-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.18)]" : "border-sky-200"
                )}
              >
                {!showHighlights ? (
                  <p className="text-slate-800 font-medium">{heroConsole.chatMessage}</p>
                ) : (
                  // Step 3+: Perspective Inversion Highlights
                  <p className="text-slate-800 font-medium">
                    Halo kak, ada lowongan admin online, gaji{" "}
                    <span className="relative inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 font-bold border border-amber-300">
                      Rp500rb/hari
                      <span className="absolute -top-5 left-0 px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 font-mono text-[9px] font-extrabold tracking-tight uppercase whitespace-nowrap shadow-xs">
                        umpan imbalan
                      </span>
                    </span>
                    , cukup bayar{" "}
                    <span className="relative inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 font-bold border border-amber-300">
                      Rp150rb buat seragam
                      <span className="absolute -bottom-5 left-0 px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 font-mono text-[9px] font-extrabold tracking-tight uppercase whitespace-nowrap shadow-xs">
                        pungutan di depan
                      </span>
                    </span>
                    .
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Perspective Inversion Callout Banner (Appears at Step 2+) */}
        <AnimatePresence>
          {isAttackerMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 flex items-start gap-3 shadow-xs"
            >
              <div className="p-1 rounded bg-amber-200 text-amber-800 shrink-0 mt-0.5">
                <Eye className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <span className="font-mono uppercase tracking-wider text-amber-900 font-bold text-[10px]">
                  Sudut Pandang Pelaku Dibalik
                </span>
                <p className="text-slate-800 font-medium">
                  {heroConsole.attackerInsight}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Card (Appears at Step 4) */}
        <AnimatePresence>
          {showActionCard && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.3 }}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-300 space-y-4 shadow-xl border-t-2 border-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold border border-emerald-300">
                    <Shield className="w-3 h-3 text-emerald-700" />
                    {heroConsole.actionCard.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {heroConsole.actionCard.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  Refleks Penjaga Aktif
                </span>
              </div>

              {/* Grid: Vulnerabilities & Safe Steps */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                  <span className="font-mono text-[10px] text-amber-800 uppercase tracking-wider font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Celah Taktik
                  </span>
                  <ul className="space-y-1">
                    {heroConsole.actionCard.vulnerabilities.map((v, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-slate-700 font-medium">
                        <span className="text-amber-600 font-mono font-bold">›</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 space-y-1.5">
                  <span className="font-mono text-[10px] text-sky-800 uppercase tracking-wider font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3 text-sky-600" /> Langkah Pengamanan
                  </span>
                  <ul className="space-y-1">
                    {heroConsole.actionCard.safeSteps.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-slate-700 font-medium">
                        <span className="text-sky-600 font-mono font-bold">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Warning Template ready to copy */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="text-[11px] text-slate-600 line-clamp-1 italic font-medium">
                  &ldquo;{heroConsole.actionCard.warningCopyText}&rdquo;
                </p>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold aero-btn-emerald text-white shadow-md"
                >
                  {state.copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>{heroConsole.actionCard.copiedButtonLabel}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white" />
                      <span>{heroConsole.actionCard.copyButtonLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
