"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Shield,
  Star,
  CheckCircle2,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  X,
  AlertTriangle,
  Award,
  ChevronRight,
  Send,
  Copy,
  Check,
  Zap,
  Clock,
  Briefcase,
  UserX,
  Package,
  Truck,
  Smartphone,
  HeartCrack,
  Crown,
  Trophy,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import scenariosData from "@/data/scenarios.json";
import type { Scenario, PerspectiveOption, Flaw } from "@/types/api";
import { GuardianBadgeModal } from "@/components/guardian/GuardianBadgeModal";

const scenarios = scenariosData as Scenario[];

interface StageDefinition {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  scenarioId: string;
  tier: "Alpha" | "Beta" | "Omega";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const STAGES: StageDefinition[] = [
  {
    id: "stage_urgency",
    stageNumber: 1,
    title: "Tekanan Waktu & Urgensi Palsu",
    subtitle: "Modus ancaman rekening bank dibekukan",
    scenarioId: "phishing_bank_account_freeze",
    tier: "Alpha",
    icon: Clock,
    color: "#10B981", // emerald
  },
  {
    id: "stage_upfront_fee",
    stageNumber: 2,
    title: "Pungutan di Muka Berkedok Kerja",
    subtitle: "Modus lowongan admin WFH bayar seragam",
    scenarioId: "wfh_admin_fee",
    tier: "Alpha",
    icon: Briefcase,
    color: "#10B981",
  },
  {
    id: "stage_impersonation",
    stageNumber: 3,
    title: "Penyamaran Menjadi Orang Dekat",
    subtitle: "Modus kerabat ganti nomor minta transfer",
    scenarioId: "impersonate_new_number",
    tier: "Alpha",
    icon: UserX,
    color: "#10B981",
  },
  {
    id: "stage_apk_malware",
    stageNumber: 4,
    title: "Serangan Berkas .APK Jahat",
    subtitle: "Modus undangan pernikahan & surat tilang",
    scenarioId: "apk_wedding_invitation",
    tier: "Beta",
    icon: Package,
    color: "#8B5CF6", // purple
  },
  {
    id: "stage_cod_scam",
    stageNumber: 5,
    title: "Kurir Paket COD & Resi Fiktif",
    subtitle: "Modus tagihan paket di depan rumah",
    scenarioId: "marketplace_cod_scam",
    tier: "Beta",
    icon: Truck,
    color: "#8B5CF6",
  },
  {
    id: "stage_task_bait",
    stageNumber: 6,
    title: "Perangkap Komisi Review & Like",
    subtitle: "Modus misi berbayar grup Telegram",
    scenarioId: "task_scam_review_maps",
    tier: "Beta",
    icon: Smartphone,
    color: "#8B5CF6",
  },
  {
    id: "stage_romance_crypto",
    stageNumber: 7,
    title: "Asmara Semu & Trading Kripto",
    subtitle: "Modus kenalan dating app Pig Butchering",
    scenarioId: "romance_investment_pigbutchering",
    tier: "Beta",
    icon: HeartCrack,
    color: "#8B5CF6",
  },
  {
    id: "stage_guardian_debut",
    stageNumber: 8,
    title: "The Guardian Debut",
    subtitle: "Ujian Kelayakan Refleks Penjaga Digital",
    scenarioId: "generic_emergency",
    tier: "Omega",
    icon: Crown,
    color: "#F59E0B", // amber gold
  },
];

const PROGRESS_STORAGE_KEY = "ato_duolingo_drill_v1";

interface UserProgress {
  streak: number;
  lastDate: string;
  xp: number;
  completedStages: string[];
}

// Simple Web Audio API Synthesizer for tactile gamification chimes
function playChime(type: "success" | "click" | "fanfare") {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "click") {
      osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "success") {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "fanfare") {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.5, now + 0.3); // C6
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch {
    // ignore audio failure
  }
}

export default function DrillPage() {
  const [progress, setProgress] = useState<UserProgress>({
    streak: 3,
    lastDate: new Date().toISOString().slice(0, 10),
    xp: 75,
    completedStages: ["stage_urgency"],
  });

  // Modal / Exercise state
  const [activeStage, setActiveStage] = useState<StageDefinition | null>(null);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [exerciseStep, setExerciseStep] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCelebration, setIsCelebration] = useState<boolean>(false);
  const [copiedWarning, setCopiedWarning] = useState<boolean>(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState<boolean>(false);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserProgress;
        setProgress(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save progress
  const saveProgress = useCallback((newProg: UserProgress) => {
    setProgress(newProg);
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProg));
    } catch {
      // ignore
    }
  }, []);

  // Open Stage Exercise
  const handleOpenStage = (stage: StageDefinition) => {
    playChime("click");
    const sc = scenarios.find((s) => s.id === stage.scenarioId) || scenarios[0];
    setActiveStage(stage);
    setActiveScenario(sc);
    setExerciseStep(0);
    setSelectedOptionId(null);
    setIsAnswerChecked(false);
    setIsCelebration(false);
  };

  // Close Exercise
  const handleCloseExercise = () => {
    setActiveStage(null);
    setActiveScenario(null);
    setIsCelebration(false);
  };

  // Check Answer
  const handleCheckAnswer = () => {
    if (!selectedOptionId) return;
    playChime("success");
    setIsAnswerChecked(true);
  };

  // Next Question or Finish
  const handleNextQuestion = () => {
    if (!activeScenario || !activeStage) return;

    if (exerciseStep < activeScenario.perspective_questions.length - 1) {
      playChime("click");
      setExerciseStep((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerChecked(false);
    } else {
      // Completed all questions in stage!
      playChime("fanfare");
      setIsCelebration(true);

      const nextCompleted = progress.completedStages.includes(activeStage.id)
        ? progress.completedStages
        : [...progress.completedStages, activeStage.id];

      const newProg: UserProgress = {
        streak: progress.streak + 1,
        lastDate: new Date().toISOString().slice(0, 10),
        xp: progress.xp + 25,
        completedStages: nextCompleted,
      };
      saveProgress(newProg);
    }
  };

  const currentQuestion = activeScenario?.perspective_questions[exerciseStep];

  return (
    <div className="min-h-screen bg-[#030c19] bg-eco-grid text-[#F5F7FA] pb-24 md:pb-12 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Mobile-First Header with Aero Glass */}
      <header className="sticky top-0 z-40 border-b border-white/15 aero-glass px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-300" />
            <span className="font-bold text-white tracking-wider">[ ATO ]</span>
          </Link>

          {/* Gamification Stats: Streak, XP, Stamina, Badge (Aero Pills) */}
          <div className="flex items-center gap-2 font-mono text-xs font-bold">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full aero-pill text-amber-300 shadow-sm" title="Streak Hari">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{progress.streak}</span>
            </div>

            <div className="flex items-center gap-1 px-3 py-1 rounded-full aero-pill text-cyan-300 shadow-sm" title="XP Terkumpul">
              <Star className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
              <span>{progress.xp} XP</span>
            </div>

            <button
              type="button"
              onClick={() => setIsBadgeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full aero-pill text-emerald-300 hover:border-emerald-300/50 transition-all text-xs font-bold font-mono"
              title="Klaim Kartu Penjaga"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Badge</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Skill Tree Path */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Banner Section */}
        <div className="p-6 rounded-3xl aero-card relative overflow-hidden space-y-2 text-center shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full aero-pill text-[11px] font-mono font-bold uppercase text-cyan-300">
            <Sparkles className="w-3 h-3 text-cyan-300" />
            <span>[ DAILY REFLEX DRILL // A20 ]</span>
          </div>

          <h1 className="text-xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Peta Jalur Penjaga Digital
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            Selesaikan modul latihan mikro (&lt; 45 detik) setiap hari untuk membangun insting bawah sadar menangkis rekayasa sosial.
          </p>
        </div>

        {/* Duolingo-style Skill Tree Path */}
        <div className="relative py-4 flex flex-col items-center gap-7">
          {/* SVG Connecting Dashed Line */}
          <div className="absolute top-8 bottom-8 w-1 border-r-2 border-dashed border-cyan-400/20 -z-0" />

          {STAGES.map((stage, idx) => {
            const isCompleted = progress.completedStages.includes(stage.id);
            const isUnlocked =
              idx === 0 || progress.completedStages.includes(STAGES[idx - 1].id);

            // Stagger horizontal offset for winding snake path feel
            const offsetClasses = [
              "translate-x-0",
              "translate-x-8",
              "-translate-x-8",
              "translate-x-6",
              "-translate-x-6",
              "translate-x-8",
              "-translate-x-8",
              "translate-x-0",
            ];
            const currentOffset = offsetClasses[idx % offsetClasses.length];

            return (
              <div
                key={stage.id}
                className={cn(
                  "relative z-10 flex flex-col items-center transition-transform",
                  currentOffset
                )}
              >
                {/* 3D Tactile Node Button (Aero Aqua Jelly / Emerald) */}
                <button
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => handleOpenStage(stage)}
                  className={cn(
                    "w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-150 relative group",
                    isCompleted
                      ? "aero-btn-emerald shadow-[0_8px_0_#064E3B]"
                      : isUnlocked
                      ? "aero-btn-aqua shadow-[0_8px_0_#075985]"
                      : "bg-[#0a1628]/80 border-2 border-white/10 text-white/30 cursor-not-allowed opacity-60 backdrop-blur-md"
                  )}
                >
                  {(() => {
                    const StageIcon = stage.icon;
                    return <StageIcon className="w-7 h-7 drop-shadow-sm" />;
                  })()}

                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-300 text-black flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-black/60 text-white/50 border border-white/20 flex items-center justify-center">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </button>

                {/* Stage Label Tooltip / Card */}
                <div className="mt-2 text-center max-w-[150px]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 block">
                    Level {stage.stageNumber} &bull; {stage.tier}
                  </span>
                  <span className="text-xs font-bold text-white leading-tight block truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    {stage.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ================= BITE-SIZED EXERCISE MODAL ================= */}
      <AnimatePresence>
        {activeStage && activeScenario && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#07090D] flex flex-col overflow-y-auto"
          >
            {/* Exercise Top Navigation & Progress */}
            <header className="sticky top-0 z-10 bg-[#07090D]/95 backdrop-blur-md px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCloseExercise}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Progress Segment Bar */}
              <div className="flex-1 max-w-xs flex gap-1.5">
                {activeScenario.perspective_questions.map((_, qIdx) => (
                  <div
                    key={qIdx}
                    className={cn(
                      "h-2.5 rounded-full flex-1 transition-all",
                      qIdx <= exerciseStep
                        ? "bg-emerald-500 shadow-[0_0_8px_#10B981]"
                        : "bg-white/10"
                    )}
                  />
                ))}
              </div>

              <span className="text-xs font-mono font-bold text-text-muted">
                {exerciseStep + 1}/{activeScenario.perspective_questions.length}
              </span>
            </header>

            {/* Exercise Body */}
            {!isCelebration ? (
              <div className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  {/* Scenario Chat Snippet (The Bait) */}
                  <div className="p-4 rounded-2xl bg-[#0B0F17] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-text-muted border-b border-white/5 pb-2">
                      <span className="font-semibold text-white">
                        {activeScenario.victim_view[0]?.from || "Pesan Masuk"}
                      </span>
                      <span className="text-emerald-400">Kasus Nyata</span>
                    </div>
                    <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-mono">
                      &ldquo;{activeScenario.victim_view[0]?.text}&rdquo;
                    </p>
                  </div>

                  {/* Perspective Question */}
                  {currentQuestion && (
                    <div className="space-y-3">
                      <span className="text-xs font-mono uppercase font-bold text-amber-400 block tracking-wider">
                        Posisikan Dirimu Sebagai Pelaku:
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {currentQuestion.prompt}
                      </h2>

                      {/* Options */}
                      <div className="space-y-2.5 pt-1">
                        {currentQuestion.options.map((opt, oIdx) => {
                          const isSelected = selectedOptionId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              disabled={isAnswerChecked}
                              onClick={() => {
                                playChime("click");
                                setSelectedOptionId(opt.id);
                              }}
                              className={cn(
                                "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3",
                                isSelected
                                  ? "border-emerald-500 bg-emerald-500/[0.1] shadow-[0_4px_0_#059669]"
                                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] active:translate-y-0.5"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5",
                                  isSelected
                                    ? "bg-emerald-500 border-emerald-500 text-black"
                                    : "border-white/20 text-text-muted"
                                )}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="text-xs sm:text-sm font-medium text-text-primary leading-relaxed">
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer with Tactile Button */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  {isAnswerChecked && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1"
                    >
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Celah Berhasil Kamu Bongkar!</span>
                      </span>
                      <p className="text-[11px] text-text-muted leading-relaxed font-mono">
                        {activeScenario.flaws[0]?.explanation ||
                          "Taktik ini sengaja dimanfaatkan agar korban bertindak impulsif sebelum sempat berpikir kritis."}
                      </p>
                    </motion.div>
                  )}

                  {!isAnswerChecked ? (
                    <button
                      type="button"
                      disabled={!selectedOptionId}
                      onClick={handleCheckAnswer}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all",
                        selectedOptionId
                          ? "aero-btn-emerald"
                          : "bg-white/10 text-slate-400 cursor-not-allowed opacity-40"
                      )}
                    >
                      Periksa Celah
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider aero-btn-aqua transition-all"
                    >
                      Lanjutkan &rarr;
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* ================= STAGE CELEBRATION SCREEN ================= */
              <div className="flex-1 max-w-md w-full mx-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-400 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] text-slate-950"
                >
                  <Trophy className="w-12 h-12" />
                </motion.div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                    Modul Selesai &bull; +25 XP
                  </span>
                  <h2 className="text-2xl font-extrabold text-white">
                    Refleks Penjagamu Semakin Tajam!
                  </h2>
                  <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed font-mono">
                    Kamu berhasil mengidentifikasi celah taktik &ldquo;{activeStage.title}&rdquo; langsung dari sudut pandang pelakunya.
                  </p>
                </div>

                {/* Reward Card */}
                <div className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-2 gap-3 text-center font-mono">
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <span className="text-[10px] text-orange-400 uppercase font-bold block">
                      Streak Harian
                    </span>
                    <span className="text-lg font-bold text-white flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4 fill-orange-400" />
                      {progress.streak} Hari
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">
                      Total Poin XP
                    </span>
                    <span className="text-lg font-bold text-white flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400" />
                      {progress.xp} XP
                    </span>
                  </div>
                </div>

                <div className="w-full space-y-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsBadgeModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/15 transition-all shadow-md"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span>Klaim & Bagikan Kartu Penjaga (Badge)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseExercise}
                    className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider bg-emerald-500 text-black border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 shadow-lg transition-all"
                  >
                    Kembali ke Peta Jalur
                  </button>

                  <Link
                    href="/lite"
                    className="block w-full py-3 rounded-2xl font-semibold text-xs text-text-muted hover:text-white transition-colors"
                  >
                    Uji Situasi Asli di A20 Lite &rarr;
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <GuardianBadgeModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        streak={progress.streak}
        xp={progress.xp}
        rankTitle={
          progress.completedStages.length >= 8
            ? "Omega Guardian"
            : progress.completedStages.length >= 4
            ? "Beta Guardian"
            : "Alpha Guardian"
        }
        stageTitle={activeStage ? activeStage.title : "Ujian Refleks Digital A20"}
      />
    </div>
  );
}
