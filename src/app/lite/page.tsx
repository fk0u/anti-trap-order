"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  Send,
  Eye,
  KeyRound,
  FileQuestion,
  Sparkles,
  ExternalLink,
  WifiOff,
  Server,
  ArrowRight,
} from "lucide-react";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/utils";
import { getScenarios, getScenario, reflect } from "@/lib/api";
import {
  Scenario,
  ScenarioSummary,
  ReflectRequest,
  ReflectResponse,
  ReflectUserAnswer,
} from "@/types/api";

export default function LitePage() {
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("job_scam_wfh");
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [isCustomInput, setIsCustomInput] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>("");

  // Flow State
  // "input" -> "question" -> "result"
  const [step, setStep] = useState<"input" | "question" | "result">("input");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<ReflectUserAnswer[]>([]);
  const [isReflecting, setIsReflecting] = useState<boolean>(false);
  const [result, setResult] = useState<ReflectResponse | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Result interaction state
  const [selectedTone, setSelectedTone] = useState<"casual" | "firm">("casual");
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [copiedWarning, setCopiedWarning] = useState<boolean>(false);

  // Load scenarios on mount
  useEffect(() => {
    getScenarios().then((list) => {
      setScenarios(list);
    });
  }, []);

  // Load active scenario details when selectedScenarioId changes
  useEffect(() => {
    if (!isCustomInput && selectedScenarioId) {
      getScenario(selectedScenarioId).then((sc) => {
        setActiveScenario(sc);
      });
    }
  }, [selectedScenarioId, isCustomInput]);

  // Reset to input
  const handleReset = useCallback(() => {
    setStep("input");
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setCheckedSteps({});
    setCopiedWarning(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in textarea
      if (
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT"
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleReset();
        return;
      }

      if (step === "question" && activeScenario) {
        const question = activeScenario.perspective_questions[currentQuestionIndex];
        if (!question) return;

        if (e.key === "1" && question.options[0]) {
          handleSelectOption(question.id, question.options[0].id);
        } else if (e.key === "2" && question.options[1]) {
          handleSelectOption(question.id, question.options[1].id);
        } else if (e.key === "3" && question.options[2]) {
          handleSelectOption(question.id, question.options[2].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, activeScenario, currentQuestionIndex, handleReset]);

  // Start perspective questions
  const handleStartQuestions = async () => {
    if (isCustomInput) {
      if (!customText.trim()) return;
      // Fetch generic questions or run reflect to find matching scenario
      const sc = await getScenario("generic");
      setActiveScenario(sc);
    }
    setStep("question");
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  // Option select handler
  const handleSelectOption = async (questionId: string, optionId: string) => {
    const updatedAnswers = [
      ...answers.filter((a) => a.question_id !== questionId),
      { question_id: questionId, selected_option_id: optionId },
    ];
    setAnswers(updatedAnswers);

    if (activeScenario && currentQuestionIndex < activeScenario.perspective_questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finished all questions: execute reflect engine
      setIsReflecting(true);
      setStep("result");

      const req: ReflectRequest = {
        scenario_id: isCustomInput ? undefined : selectedScenarioId,
        free_text: isCustomInput ? customText : undefined,
        answers: updatedAnswers,
      };

      try {
        const res = await reflect(req);
        setResult(res.response);
        setIsOffline(res.isOffline);
      } catch (err) {
        console.error("Reflect failed:", err);
      } finally {
        setIsReflecting(false);
      }
    }
  };

  const handleCopyWarning = () => {
    if (!result) return;
    const textToCopy =
      selectedTone === "casual"
        ? result.warning_templates.casual
        : result.warning_templates.firm;
    navigator.clipboard.writeText(textToCopy);
    setCopiedWarning(true);
    setTimeout(() => setCopiedWarning(false), 2200);
  };

  // Highlight helper: splits text safely by evidence phrases without dangerouslySetInnerHTML
  const renderHighlightedEvidence = (text: string, evidencePhrases: string[]) => {
    if (!evidencePhrases || evidencePhrases.length === 0) return <span>{text}</span>;

    // Build regex pattern for all evidence phrases
    const escaped = evidencePhrases
      .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .filter((p) => p.length > 0);
    if (escaped.length === 0) return <span>{text}</span>;

    const regex = new RegExp(`(${escaped.join("|")})`, "gi");
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) => {
          const isMatch = evidencePhrases.some(
            (p) => p.toLowerCase() === part.toLowerCase()
          );
          if (isMatch) {
            return (
              <mark
                key={i}
                className="bg-amber-400/20 text-amber-300 font-semibold px-1 rounded border-b border-amber-400/40"
              >
                {part}
              </mark>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const currentQuestion = activeScenario?.perspective_questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#07090D] text-[#F5F7FA] selection:bg-[#10B981]/20 selection:text-[#22D3EE]">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090D]/85 backdrop-blur-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-text-muted hover:text-text-primary hover:border-white/20 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>

            <span className="text-white/20 hidden sm:inline">|</span>

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">A20 Lite</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                The Reflex
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {step !== "input" && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs text-text-muted hover:text-white transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
                <Kbd className="hidden md:inline text-[9px]">Esc</Kbd>
              </button>
            )}

            <Link
              href="/soul"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-medium text-purple-300 hover:bg-purple-500/20 transition-all"
            >
              <span className="hidden sm:inline">Beralih ke</span>
              <span>A20 Soul</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Intro Banner */}
        <div className="mb-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>Mode Taktis & Cepat &bull; Selesai &lt; 90 Detik</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Reverse Reflex — Cek Celah dari Kepala Pelaku
          </h1>

          <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
            Bukan sekadar detektor kata kunci. Kamu akan diposisikan sebagai pelaku tipuan untuk membuka pola manipulasi psikologis secara mandiri.
          </p>
        </div>

        {/* ================= STEP 1: INPUT SITUASI ================= */}
        {step === "input" && (
          <div className="space-y-6">
            {/* Mode Switcher: Preset vs Custom */}
            <div className="p-1 rounded-2xl bg-white/[0.04] border border-white/10 flex gap-1 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setIsCustomInput(false)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
                  !isCustomInput
                    ? "bg-white text-surface-base shadow-sm"
                    : "text-text-muted hover:text-white"
                )}
              >
                Pilih Skenario Nyata
              </button>
              <button
                type="button"
                onClick={() => setIsCustomInput(true)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
                  isCustomInput
                    ? "bg-white text-surface-base shadow-sm"
                    : "text-text-muted hover:text-white"
                )}
              >
                Ketik Pesan Sendiri
              </button>
            </div>

            {!isCustomInput ? (
              <div className="space-y-6">
                {/* Scenario Selector Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {scenarios
                    .filter((s) => s.id !== "generic")
                    .map((sc) => {
                      const isSelected = selectedScenarioId === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => setSelectedScenarioId(sc.id)}
                          className={cn(
                            "p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 min-h-[90px]",
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/[0.08] shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                          )}
                        >
                          <span className="text-xs font-semibold text-white line-clamp-2">
                            {sc.title}
                          </span>
                          <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                            <span className="capitalize">{sc.category.replace("_", " ")}</span>
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded",
                                isSelected
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-white/5 text-text-muted"
                              )}
                            >
                              Tingkat {sc.difficulty}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>

                {/* Victim View Mockup */}
                {activeScenario && (
                  <div className="relative rounded-3xl border border-white/10 bg-[#0B0F17] p-5 sm:p-7 space-y-4">
                    <BorderBeam size={220} duration={12} colorFrom="#10B981" colorTo="#22D3EE" />

                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-mono font-medium text-text-muted">
                          Pesan yang Diterima Korban:
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-text-muted">
                        {activeScenario.victim_view[0]?.from}
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-xs sm:text-sm">
                      {activeScenario.victim_view.map((msg, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-text-primary leading-relaxed"
                        >
                          {msg.text}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleStartQuestions}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-surface-base font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-all active:scale-95 shadow-md"
                      >
                        <Eye className="w-4 h-4 text-emerald-600" />
                        <span>Mulai Analisis Perspektif Pelaku</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Custom Input Box */
              <div className="relative rounded-3xl border border-white/10 bg-[#0B0F17] p-5 sm:p-7 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-mono text-text-muted">
                    Salin teks pesan atau jelaskan situasi janggal yang kamu hadapi:
                  </span>
                  <span className="text-[11px] font-mono text-text-muted">
                    {customText.length}/1000
                  </span>
                </div>

                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value.slice(0, 1000))}
                  placeholder="Contoh: 'Halo kak, saya dari HRD PT Global Digital. Mau nawarin kerjaan like & subscribe YouTube gaji 200rb per hari. Tapi harus transfer deposit 50rb dulu untuk aktivasi akun member...'"
                  rows={6}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono resize-none"
                />

                <div className="p-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 text-[11px] text-amber-300/80 leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Invarian Privasi: Jangan masukkan data sensitif pribadi (seperti nomor KTP, PIN ATM, atau password).
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={!customText.trim()}
                    onClick={handleStartQuestions}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-surface-base font-semibold text-xs sm:text-sm hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
                  >
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span>Mulai Analisis Perspektif Pelaku</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 2: PERSPECTIVE QUESTIONS ================= */}
        {step === "question" && currentQuestion && (
          <div className="relative rounded-3xl border border-white/10 bg-[#0B0F17] p-6 sm:p-8 space-y-6">
            <BorderBeam size={260} duration={10} colorFrom="#10B981" colorTo="#22D3EE" />

            {/* Progress Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                  Inversi Perspektif #{currentQuestionIndex + 1}
                </span>
              </div>
              <span className="text-xs font-mono text-text-muted">
                Langkah {currentQuestionIndex + 1} dari{" "}
                {activeScenario?.perspective_questions.length || 3}
              </span>
            </div>

            {/* Question Prompt */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-amber-400 font-semibold tracking-wider block">
                Pikirkan dari Sudut Pandang Pelaku:
              </span>
              <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {currentQuestion.prompt}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt, idx) => {
                const shortcutNum = (idx + 1).toString();
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                    className="w-full p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all flex items-center justify-between gap-4 text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full border border-white/20 bg-white/[0.05] flex items-center justify-center text-xs font-mono text-text-muted group-hover:border-emerald-400 group-hover:text-emerald-400 shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-text-primary group-hover:text-white leading-relaxed">
                        {opt.label}
                      </span>
                    </div>

                    <Kbd className="hidden sm:inline text-xs font-mono opacity-60 group-hover:opacity-100">
                      {shortcutNum}
                    </Kbd>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] font-mono text-text-muted text-center pt-2">
              Pilih opsi di atas atau tekan tombol <Kbd className="text-[10px]">1</Kbd> /{" "}
              <Kbd className="text-[10px]">2</Kbd> / <Kbd className="text-[10px]">3</Kbd> di keyboard.
            </div>
          </div>
        )}

        {/* ================= STEP 3: RESULT ACTION CARD ================= */}
        {step === "result" && (
          <div aria-live="polite" className="space-y-8">
            {isReflecting ? (
              <div className="p-12 rounded-3xl border border-white/10 bg-[#0B0F17] text-center space-y-4">
                <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="text-base font-semibold text-white font-mono">
                  Menyusun Celah & Action Card Taktis...
                </h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Engine sedang menghitung ranking flaw deterministik berdasarkan taktik manipulasi yang kamu temukan.
                </p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-emerald-400 uppercase">
                      Action Card Terbit
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOffline ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px]">
                        <WifiOff className="w-3 h-3" />
                        <span>Mode Offline (Local Fallback)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px]">
                        <Server className="w-3 h-3" />
                        <span>Live Go Engine (100% Deterministic)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Perspective Summary Banner */}
                <div className="p-5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Hasil Inversi Perspektif:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-mono">
                    {result.perspective_summary}
                  </p>
                </div>

                {/* Detected Flaws */}
                <div className="space-y-4">
                  <h3 className="text-sm font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>3 Celah Manipulasi yang Terbongkar:</span>
                  </h3>

                  <div className="grid gap-4">
                    {result.user_detected_flaws.map((flaw, idx) => (
                      <div
                        key={flaw.id}
                        className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-[#0B0F17] space-y-3 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-mono font-bold">
                              #{idx + 1}
                            </span>
                            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                              {flaw.title}
                            </h4>
                          </div>

                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border",
                              flaw.severity === 3
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                : flaw.severity === 2
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            )}
                          >
                            Tingkat Bahaya {flaw.severity === 3 ? "Kritis" : flaw.severity === 2 ? "Sedang" : "Ringan"}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                          {flaw.explanation}
                        </p>

                        {/* Evidence Highlight if present */}
                        {flaw.evidence_phrases && flaw.evidence_phrases.length > 0 && (
                          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                            <span className="text-[10px] font-mono text-text-muted uppercase font-bold block">
                              Frasa Indikator Manipulasi:
                            </span>
                            <div className="text-xs font-mono text-white">
                              {renderHighlightedEvidence(
                                flaw.evidence_phrases.join(" • "),
                                flaw.evidence_phrases
                              )}
                            </div>
                          </div>
                        )}

                        <div className="text-[11px] font-mono text-emerald-400/90 pt-1">
                          &rarr; {flaw.user_perspective_reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safe Steps Checklist */}
                <div className="p-6 sm:p-7 rounded-3xl border border-white/10 bg-[#0B0F17] space-y-4">
                  <h3 className="text-sm font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Langkah Aman yang Harus Kamu Ambil Sekarang:</span>
                  </h3>

                  <div className="space-y-2.5">
                    {result.safe_steps.map((stepText, idx) => {
                      const isChecked = !!checkedSteps[idx];
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setCheckedSteps((prev) => ({
                              ...prev,
                              [idx]: !prev[idx],
                            }))
                          }
                          className={cn(
                            "w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3",
                            isChecked
                              ? "bg-emerald-500/[0.08] border-emerald-500/40 text-emerald-200"
                              : "bg-white/[0.02] border-white/10 text-text-primary hover:bg-white/[0.05]"
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                              isChecked
                                ? "bg-emerald-500 border-emerald-500 text-black"
                                : "border-white/30 bg-white/5"
                            )}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span
                            className={cn(
                              "text-xs sm:text-sm leading-relaxed",
                              isChecked && "line-through opacity-70"
                            )}
                          >
                            {stepText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Warning Copy Box */}
                <div className="p-6 sm:p-7 rounded-3xl border border-white/10 bg-[#0B0F17] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                      <Send className="w-4 h-4 text-brand-teal" />
                      <span>Kalimat Peringatan Siap Kirim:</span>
                    </h3>

                    {/* Tone Switcher */}
                    <div className="p-1 rounded-xl bg-white/[0.05] border border-white/10 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedTone("casual")}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all",
                          selectedTone === "casual"
                            ? "bg-white text-surface-base"
                            : "text-text-muted hover:text-white"
                        )}
                      >
                        Santai (Keluarga)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTone("firm")}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all",
                          selectedTone === "firm"
                            ? "bg-white text-surface-base"
                            : "text-text-muted hover:text-white"
                        )}
                      >
                        Tegas (Formal)
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 font-mono text-xs sm:text-sm text-text-primary leading-relaxed relative">
                    {selectedTone === "casual"
                      ? result.warning_templates.casual
                      : result.warning_templates.firm}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <span className="text-[11px] font-mono text-text-muted">
                      Kirim kalimat ini ke target atau grup WhatsApp keluarga.
                    </span>

                    <button
                      type="button"
                      onClick={handleCopyWarning}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all active:scale-95 shadow-md"
                    >
                      {copiedWarning ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Kalimat Peringatan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Hard Invariant Confidence Note */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] font-mono text-text-muted text-center space-y-1">
                  <p className="text-amber-300/80 font-semibold">{result.confidence_note}</p>
                  <p>
                    Anti Trap Order tidak memberikan persentase skor akurasi karena manipulasi sosial bersifat dinamis.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-white hover:bg-white/[0.08] transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Coba Situasi Lain</span>
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link
                      href="/docs"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-text-muted hover:text-white transition-all"
                    >
                      <span>Lihat Spesifikasi & Docs</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href="/soul"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md active:scale-95"
                    >
                      <span>Lanjut ke A20 Soul</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
