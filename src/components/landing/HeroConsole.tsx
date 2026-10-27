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
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl md:rounded-3xl border border-white/10 bg-surface-card/95 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden text-left">
      {/* Signature Animated Border Beam */}
      <BorderBeam duration={16} borderWidth={1.5} colorFrom="#10B981" colorTo="#22D3EE" />

      {/* Top Window Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-text-muted flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-brand-teal" />
            reverse-reflex::interactive-preview
          </span>
        </div>

        {/* Mode Toggle Indicator (Victim vs Scammer) */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center p-0.5 rounded-full bg-black/40 border border-white/10 text-[11px] font-mono">
            <motion.div
              className={cn(
                "absolute inset-y-0.5 rounded-full transition-colors",
                isAttackerMode
                  ? "right-0.5 w-[50%] bg-[#F59E0B]/20 border border-[#F59E0B]/50"
                  : "left-0.5 w-[50%] bg-brand-teal/20 border border-brand-teal/50"
              )}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <span
              className={cn(
                "relative z-10 px-2.5 py-0.5 transition-colors",
                !isAttackerMode ? "text-text-primary font-medium" : "text-text-muted"
              )}
            >
              {heroConsole.victimModeLabel}
            </span>
            <span
              className={cn(
                "relative z-10 px-2.5 py-0.5 transition-colors",
                isAttackerMode ? "text-[#F59E0B] font-medium" : "text-text-muted"
              )}
            >
              {heroConsole.attackerModeLabel}
            </span>
          </div>

          {/* Pause / Resume Button for a11y */}
          <button
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
            aria-label={state.isPaused ? "Lanjutkan animasi simulasi" : "Jeda animasi simulasi"}
            title={state.isPaused ? "Play" : "Pause"}
          >
            {state.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Console Body */}
      <div className="p-4 sm:p-6 space-y-5">
        {/* Step Indicator status */}
        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            <span>KASUS NYATA: TAWARAN KERJA INSTAN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Fase 0{state.step + 1}/05</span>
          </div>
        </div>

        {/* Fictional Chat Message Container */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="font-semibold text-text-primary">{heroConsole.chatSender}</span>
            <span>·</span>
            <span className="font-mono text-[11px]">{heroConsole.chatTime}</span>
          </div>

          <div className="relative max-w-xl">
            {state.step === 0 ? (
              // Step 0: Typing Indicator
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-[#161B22] border border-white/10 text-text-muted text-xs font-mono">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-bounce" />
                </span>
                <span>{heroConsole.typingText}</span>
              </div>
            ) : (
              // Step 1 to 4: Incoming Fictional WhatsApp-like Message
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-2xl rounded-tl-sm text-sm sm:text-base leading-relaxed transition-all duration-300",
                  "bg-[#161B22] border",
                  isAttackerMode ? "border-[#F59E0B]/30 shadow-[0_0_24px_rgba(245,158,11,0.06)]" : "border-white/10"
                )}
              >
                {!showHighlights ? (
                  <p className="text-text-primary">{heroConsole.chatMessage}</p>
                ) : (
                  // Step 3+: Perspective Inversion Highlights
                  <p className="text-text-primary">
                    Halo kak, ada lowongan admin online, gaji{" "}
                    <span className="relative inline-block px-1 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-semibold border border-[#F59E0B]/40">
                      Rp500rb/hari
                      <span className="absolute -top-5 left-0 px-1 py-0.2 rounded bg-[#F59E0B] text-black font-mono text-[9px] font-bold tracking-tight uppercase whitespace-nowrap shadow-sm">
                        umpan imbalan
                      </span>
                    </span>
                    , cukup bayar{" "}
                    <span className="relative inline-block px-1 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-semibold border border-[#F59E0B]/40">
                      Rp150rb buat seragam
                      <span className="absolute -bottom-5 left-0 px-1 py-0.2 rounded bg-[#F59E0B] text-black font-mono text-[9px] font-bold tracking-tight uppercase whitespace-nowrap shadow-sm">
                        pungutan di depan
                      </span>
                    </span>{" "}
                    🙏
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
              className="p-3.5 rounded-xl bg-[#F59E0B]/[0.08] border border-[#F59E0B]/25 flex items-start gap-3"
            >
              <div className="p-1 rounded bg-[#F59E0B]/20 text-[#F59E0B] shrink-0 mt-0.5">
                <Eye className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <span className="font-mono uppercase tracking-wider text-[#F59E0B] font-semibold text-[10px]">
                  Sudut Pandang Pelaku Dibalik
                </span>
                <p className="text-text-primary/90 font-medium">
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
              className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-brand-teal/40 space-y-4 shadow-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-teal/20 text-brand-teal font-mono text-[11px] font-semibold">
                    <Shield className="w-3 h-3" />
                    {heroConsole.actionCard.badge}
                  </span>
                  <span className="text-xs font-semibold text-text-primary">
                    {heroConsole.actionCard.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-text-muted">
                  Refleks Penjaga Aktif
                </span>
              </div>

              {/* Grid: Vulnerabilities & Safe Steps */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                  <span className="font-mono text-[10px] text-alert-amber uppercase tracking-wider font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Celah Taktik
                  </span>
                  <ul className="space-y-1 text-text-muted">
                    {heroConsole.actionCard.vulnerabilities.map((v, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-text-primary/80">
                        <span className="text-alert-amber font-mono">›</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                  <span className="font-mono text-[10px] text-brand-teal uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Langkah Pengamanan
                  </span>
                  <ul className="space-y-1 text-text-muted">
                    {heroConsole.actionCard.safeSteps.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-text-primary/80">
                        <span className="text-brand-teal font-mono">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Warning Template ready to copy */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="text-[11px] text-text-muted line-clamp-1 italic">
                  &ldquo;{heroConsole.actionCard.warningCopyText}&rdquo;
                </p>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-brand-teal text-surface-base hover:bg-brand-teal/90 active:scale-[0.98] transition-all"
                >
                  {state.copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-surface-base" />
                      <span>{heroConsole.actionCard.copiedButtonLabel}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
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
