"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  Eye,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import scenariosData from "@/data/scenarios.json";
import type { Scenario, PerspectiveOption, Flaw, WarningTone, ReflectResponse } from "@/types/api";
import { reflect } from "@/lib/api";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { GradientText } from "@/components/ui/GradientText";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/utils";

const scenarios: Scenario[] = scenariosData as Scenario[];

export function ReverseReflexDemo() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0].id);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [customText, setCustomText] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, PerspectiveOption>>({});
  const [warningTone, setWarningTone] = useState<WarningTone>("casual");
  const [copied, setCopied] = useState<boolean>(false);
  const [engineResult, setEngineResult] = useState<ReflectResponse | null>(null);
  const [isEngineOffline, setIsEngineOffline] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Active scenario
  const activeScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  // Resolve matching scenario if user types custom text
  const handleCustomTextMatch = (text: string) => {
    setCustomText(text);
    if (!text.trim()) return;

    const lower = text.toLowerCase();
    let bestMatch = scenarios[5]; // fallback generic
    let highestScore = 0;

    for (const s of scenarios.slice(0, 5)) {
      let score = 0;
      for (const kw of s.keywords) {
        if (lower.includes(kw.toLowerCase())) score += 2;
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = s;
      }
    }

    if (highestScore > 0) {
      setSelectedScenarioId(bestMatch.id);
    } else {
      setSelectedScenarioId("generic_emergency");
    }
  };

  const executeReflect = async (updatedAnswers: Record<string, PerspectiveOption>) => {
    setIsProcessing(true);
    setCurrentStep(3);

    const answersList = Object.entries(updatedAnswers).map(([qid, opt]) => ({
      question_id: qid,
      selected_option_id: opt.id,
    }));

    try {
      const res = await reflect({
        scenario_id: customText.trim() ? undefined : activeScenario.id,
        free_text: customText.trim() || undefined,
        answers: answersList,
      });
      setEngineResult(res.response);
      setIsEngineOffline(res.isOffline);
    } catch (e) {
      console.error("Reflect failed:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Keyboard shortcut listener for option selection (1, 2, 3) and Enter
  useEffect(() => {
    if (currentStep !== 2) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Find current unanswered question
      const currentQuestions = activeScenario.perspective_questions;
      const answeredCount = Object.keys(answers).length;
      if (answeredCount >= currentQuestions.length) {
        if (e.key === "Enter") {
          executeReflect(answers);
        }
        return;
      }

      const activeQ = currentQuestions[answeredCount];
      const optIndex = parseInt(e.key, 10) - 1;

      if (optIndex >= 0 && optIndex < activeQ.options.length) {
        e.preventDefault();
        const selectedOpt = activeQ.options[optIndex];
        const nextAnswers = { ...answers, [activeQ.id]: selectedOpt };
        setAnswers(nextAnswers);

        // If this was the last question, auto advance
        if (answeredCount + 1 >= currentQuestions.length) {
          setTimeout(() => executeReflect(nextAnswers), 300);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, activeScenario, answers]);

  // Dynamic ranking of flaws based on accumulated tags or engine result
  const selectedTags = Object.values(answers).flatMap((opt) => opt.tags);

  const flawsToRender = engineResult
    ? engineResult.user_detected_flaws.map((f) => ({
        id: f.id,
        tag: "",
        title: f.title,
        explanation: f.explanation,
        evidence_phrases: f.evidence_phrases,
        severity: f.severity,
      }))
    : [...activeScenario.flaws]
        .map((flaw) => {
          let score = flaw.severity * 2;
          if (selectedTags.includes(flaw.tag)) score += 10;
          return { flaw, score };
        })
        .sort((a, b) => b.score - a.score)
        .map((item) => item.flaw)
        .slice(0, 3);

  // Active warning template based on selected tone
  const activeWarningTemplate = engineResult
    ? warningTone === "casual"
      ? engineResult.warning_templates.casual
      : engineResult.warning_templates.firm
    : activeScenario.warning_templates.find((w) => w.tone === warningTone)?.text ||
      activeScenario.warning_templates[0].text;

  const handleCopyWarning = () => {
    navigator.clipboard?.writeText(activeWarningTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setAnswers({});
    setEngineResult(null);
    setCurrentStep(1);
    setCustomText("");
  };

  return (
    <section
      id="reverse-reflex"
      className="relative w-full py-24 md:py-32 px-4 sm:px-6"
      aria-label="Section Demo Reverse Reflex"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full aero-pill text-xs font-mono font-bold text-sky-800 uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>[ INTERACTIVE SIMULATOR // A20 ]</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Uji Situasi dengan <GradientText variant="brand">Reverse Reflex</GradientText>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            Pilih skenario atau ketik pesan mencurigakanmu. Masuk ke sudut pandang pelaku untuk membongkar celahnya.
          </p>
        </div>

        {/* Main Interactive Container Card with BorderBeam & Aero Card */}
        <div className="relative rounded-3xl aero-card p-6 sm:p-10 shadow-xl overflow-hidden text-left border-t-2 border-white">
          <BorderBeam duration={16} borderWidth={1.5} colorFrom="#10B981" colorTo="#38BDF8" />

          {/* Progress Bar & Header */}
          <div className="flex items-center justify-between border-b border-sky-100 pb-5 mb-8">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_8px_#0284c7] animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                {currentStep === 1 && "[ FASE 1: TENTUKAN SITUASI ]"}
                {currentStep === 2 && "[ FASE 2: INVERSI SUDUT PANDANG ]"}
                {currentStep === 3 && "[ FASE 3: ACTION CARD TERBUKA ]"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 font-bold">
              <span className="text-sky-700 font-bold">0{currentStep}</span>
              <span>/</span>
              <span>03</span>
            </div>
          </div>

          {/* Step 1: Scenario Chooser & Input */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-mono uppercase text-sky-800 font-bold tracking-wider mb-3">
                    Pilih skenario fiktif realistis:
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {scenarios.map((s) => {
                      const isSelected = selectedScenarioId === s.id && !customText;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedScenarioId(s.id);
                            setCustomText("");
                          }}
                          className={cn(
                            "px-4 py-2 rounded-full text-xs transition-all text-left font-bold shadow-xs",
                            isSelected
                              ? "aero-pill bg-sky-100 border-sky-300 text-sky-950 shadow-md"
                              : "bg-white/80 border border-sky-200 text-slate-700 hover:bg-sky-50 hover:text-slate-900"
                          )}
                        >
                          {s.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Or Custom Text Input */}
                <div>
                  <label htmlFor="custom-situation" className="block text-xs font-mono uppercase text-slate-600 font-bold tracking-wider mb-2">
                    Atau ketik sendiri situasi yang kamu alami:
                  </label>
                  <textarea
                    id="custom-situation"
                    rows={3}
                    value={customText}
                    onChange={(e) => handleCustomTextMatch(e.target.value)}
                    placeholder="Contoh: dapat chat WA ngaku admin bank nawarin perubahan tarif dan minta klik link..."
                    className="w-full rounded-2xl border border-sky-200 bg-white p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 shadow-inner"
                  />
                </div>

                {/* Preview of the Target's Incoming Message */}
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
                  <span className="text-[11px] font-mono text-slate-600 uppercase tracking-wider block font-bold">
                    Cuplikan Pesan Situasi Ini:
                  </span>
                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-800 font-medium">
                    {activeScenario.victim_view.map((msg, i) => (
                      <p key={i}>
                        <span className="font-bold text-sky-700">{msg.from}: </span>
                        <span>{msg.text}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Continue Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-bold aero-btn-aqua text-white shadow-md"
                  >
                    <span>Mulai Balik Perspektif</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Perspective Inversion Questions */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 flex items-start gap-3 shadow-xs">
                  <Eye className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <span className="font-mono text-amber-900 font-bold uppercase tracking-wider block">
                      Instruksi Inversi:
                    </span>
                    <p className="text-slate-700 font-medium">
                      Jawablah bukan sebagai korban yang takut, tetapi sebagai orang yang merancang pesan tersebut. Tekan tombol angka <Kbd size="sm">1</Kbd>, <Kbd size="sm">2</Kbd>, atau <Kbd size="sm">3</Kbd> untuk memilih cepat.
                    </p>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {activeScenario.perspective_questions.map((q, qIndex) => {
                    const currentAnswer = answers[q.id];
                    return (
                      <div key={q.id} className="space-y-3">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-start gap-2">
                          <span className="font-mono text-sky-700">Q{qIndex + 1}.</span>
                          <span>{q.prompt}</span>
                        </span>

                        <div className="grid grid-cols-1 gap-2.5">
                          {q.options.map((opt, optIndex) => {
                            const isChosen = currentAnswer?.id === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() =>
                                  setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                                }
                                className={cn(
                                  "w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 shadow-xs",
                                  isChosen
                                    ? "bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-sm"
                                    : "bg-white border-sky-200 text-slate-700 hover:border-sky-300 hover:text-slate-900 hover:bg-sky-50/50"
                                )}
                              >
                                <span>{opt.label}</span>
                                <Kbd size="sm" className="shrink-0 bg-white border-sky-200 text-slate-700 font-bold">
                                  {optIndex + 1}
                                </Kbd>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Navigation */}
                <div className="pt-4 flex items-center justify-between border-t border-sky-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-mono font-bold text-slate-600 hover:text-slate-900"
                  >
                    ← Ganti Skenario
                  </button>

                  <button
                    type="button"
                    onClick={() => executeReflect(answers)}
                    disabled={
                      Object.keys(answers).length <
                      activeScenario.perspective_questions.length
                    }
                    className={cn(
                      "inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-bold transition-all text-white",
                      Object.keys(answers).length >=
                        activeScenario.perspective_questions.length
                        ? "aero-btn-aqua shadow-md"
                        : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-60"
                    )}
                  >
                    <span>Buka Action Card</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Action Card & Results */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
                aria-live="polite"
              >
                {/* Result Top Badge */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      Refleks Aktif: {flawsToRender.length} Celah Manipulasi Berhasil Kamu Bongkar
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-800 font-bold">
                      Kategori: {activeScenario.category}
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      {isEngineOffline ? "Local Engine" : "Go API Live"}
                    </span>
                  </div>
                </div>

                {/* Ranked Flaws */}
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase text-amber-800 font-bold tracking-wider block">
                    Celah Taktik yang Kamu Temukan Sendiri:
                  </span>
                  <div className="grid grid-cols-1 gap-3">
                    {flawsToRender.map((flaw, i) => (
                      <div
                        key={flaw.id}
                        className="p-4 rounded-2xl bg-white border border-sky-200 space-y-1.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span className="text-amber-600 font-mono font-bold">#{i + 1}</span>
                            <span>{flaw.title}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                            Tingkat Bahaya: {flaw.severity}/3
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {flaw.explanation}
                        </p>
                        <div className="pt-1 flex flex-wrap gap-1.5">
                          {flaw.evidence_phrases.map((phrase, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 font-mono text-[11px] text-amber-950 font-bold"
                            >
                              &ldquo;{phrase}&rdquo;
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safe Steps Checklist */}
                <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-3">
                  <span className="text-xs font-mono uppercase text-sky-800 font-bold tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    Langkah Aman yang Harus Kamu Ambil:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-800 font-medium">
                    {activeScenario.safe_steps.map((step, idx) => (
                      <li key={step.id} className="flex items-start gap-2">
                        <span className="text-sky-600 font-mono font-bold">0{idx + 1}.</span>
                        <span>{step.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ready to Copy Warning Template */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-300 space-y-3 shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono uppercase text-slate-700 font-bold tracking-wider">
                      Kalimat Peringatan Siap Copy:
                    </span>

                    {/* Tone Switcher */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-sky-50 border border-sky-200 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setWarningTone("casual")}
                        className={cn(
                          "px-2.5 py-0.5 rounded transition-colors font-bold",
                          warningTone === "casual"
                            ? "bg-white text-sky-800 shadow-xs border border-sky-300"
                            : "text-slate-500"
                        )}
                      >
                        Santai (Grup Teman)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWarningTone("firm")}
                        className={cn(
                          "px-2.5 py-0.5 rounded transition-colors font-bold",
                          warningTone === "firm"
                            ? "bg-white text-sky-800 shadow-xs border border-sky-300"
                            : "text-slate-500"
                        )}
                      >
                        Tegas (Grup Keluarga)
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic bg-sky-50/60 p-3 rounded-xl border border-sky-100 font-medium">
                    &ldquo;{activeWarningTemplate}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-slate-500 font-medium">
                      Salin dan kirim langsung sebelum orang lain terjebak.
                    </span>

                    <button
                      type="button"
                      onClick={handleCopyWarning}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold aero-btn-emerald text-white shadow-md"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white" />
                          <span>Salin Pesan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mandatory Disclaimer */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 text-[11px] font-mono text-amber-950 flex items-center justify-center gap-2 text-center font-medium shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Ini alat bantu berpikir mandiri (decision support), bukan deteksi kepastian 100%. Selalu konfirmasi ke kanal resmi institusi terkait.</span>
                </div>

                {/* Reset & Navigation Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
                    <span>Uji Skenario Lain</span>
                  </button>

                  <Link
                    href="/lite"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold aero-pill text-slate-800 hover:border-sky-300 hover:bg-sky-50 transition-all shadow-xs"
                  >
                    <span>Buka Mode Taktis Lengkap di /lite</span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
