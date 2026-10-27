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
      className="relative w-full bg-surface-card/40 py-24 md:py-32 px-4 sm:px-6"
      aria-label="Section Demo Reverse Reflex"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-xs font-mono font-semibold text-brand-teal uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary">
            Uji Situasi dengan <GradientText variant="brand">Reverse Reflex</GradientText>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-text-muted leading-relaxed">
            Pilih skenario atau ketik pesan mencurigakanmu. Masuk ke sudut pandang pelaku untuk membongkar celahnya.
          </p>
        </div>

        {/* Main Interactive Container Card with BorderBeam */}
        <div className="relative rounded-3xl border border-white/10 bg-surface-card p-6 sm:p-10 shadow-2xl overflow-hidden text-left">
          <BorderBeam duration={16} borderWidth={1.5} colorFrom="#10B981" colorTo="#22D3EE" />

          {/* Progress Bar & Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-teal animate-pulse" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                {currentStep === 1 && "Langkah 1: Tentukan Situasi"}
                {currentStep === 2 && "Langkah 2: Posisikan Diri Jadi Pelaku"}
                {currentStep === 3 && "Langkah 3: Action Card & Celah Terkuak"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs text-text-muted">
              <span className="text-brand-teal font-bold">0{currentStep}</span>
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
                  <label className="block text-xs font-mono uppercase text-text-muted tracking-wider mb-3">
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
                            "px-3.5 py-2 rounded-xl text-xs font-medium border transition-all text-left",
                            isSelected
                              ? "bg-brand-teal/20 border-brand-teal text-brand-teal font-semibold shadow-sm"
                              : "bg-white/[0.03] border-white/10 text-text-muted hover:border-white/20 hover:text-text-primary"
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
                  <label htmlFor="custom-situation" className="block text-xs font-mono uppercase text-text-muted tracking-wider mb-2">
                    Atau ketik sendiri situasi yang kamu alami:
                  </label>
                  <textarea
                    id="custom-situation"
                    rows={3}
                    value={customText}
                    onChange={(e) => handleCustomTextMatch(e.target.value)}
                    placeholder="Contoh: dapat chat WA ngaku admin bank nawarin perubahan tarif dan minta klik link..."
                    className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-xs sm:text-sm text-text-primary placeholder:text-text-muted/50 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  />
                </div>

                {/* Preview of the Target's Incoming Message */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider block">
                    Cuplikan Pesan Situasi Ini:
                  </span>
                  <div className="space-y-1.5 text-xs sm:text-sm text-text-primary/90">
                    {activeScenario.victim_view.map((msg, i) => (
                      <p key={i}>
                        <span className="font-semibold text-brand-teal">{msg.from}: </span>
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
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-brand-teal text-surface-base hover:bg-brand-teal/90 active:scale-95 transition-all"
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
                <div className="p-4 rounded-2xl bg-alert-amber/[0.08] border border-alert-amber/30 flex items-start gap-3">
                  <Eye className="w-5 h-5 text-alert-amber shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <span className="font-mono text-alert-amber font-semibold uppercase tracking-wider block">
                      Instruksi Inversi:
                    </span>
                    <p className="text-text-primary/90">
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
                        <span className="text-xs sm:text-sm font-semibold text-text-primary flex items-start gap-2">
                          <span className="font-mono text-brand-teal">Q{qIndex + 1}.</span>
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
                                  "w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3",
                                  isChosen
                                    ? "bg-alert-amber/15 border-alert-amber/60 text-text-primary font-medium shadow-sm"
                                    : "bg-white/[0.02] border-white/10 text-text-muted hover:border-white/20 hover:text-text-primary"
                                )}
                              >
                                <span>{opt.label}</span>
                                <Kbd size="sm" className="shrink-0">
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
                <div className="pt-4 flex items-center justify-between border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-mono text-text-muted hover:text-text-primary"
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
                      "inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold transition-all",
                      Object.keys(answers).length >=
                        activeScenario.perspective_questions.length
                        ? "bg-brand-teal text-surface-base hover:bg-brand-teal/90 active:scale-95"
                        : "bg-white/10 text-text-muted cursor-not-allowed opacity-50"
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
                <div className="p-4 rounded-2xl bg-brand-teal/[0.08] border border-brand-teal/30 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-brand-teal" />
                    <span className="text-xs sm:text-sm font-bold text-text-primary">
                      Refleks Aktif: {flawsToRender.length} Celah Manipulasi Berhasil Kamu Bongkar
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-brand-teal">
                      Kategori: {activeScenario.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {isEngineOffline ? "Local Engine" : "Go API Live"}
                    </span>
                  </div>
                </div>

                {/* Ranked Flaws */}
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase text-alert-amber font-semibold tracking-wider block">
                    Celah Taktik yang Kamu Temukan Sendiri:
                  </span>
                  <div className="grid grid-cols-1 gap-3">
                    {flawsToRender.map((flaw, i) => (
                      <div
                        key={flaw.id}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-text-primary flex items-center gap-2">
                            <span className="text-alert-amber font-mono font-bold">#{i + 1}</span>
                            <span>{flaw.title}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-alert-amber/20 text-alert-amber border border-alert-amber/30">
                            Tingkat Bahaya: {flaw.severity}/3
                          </span>
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed">
                          {flaw.explanation}
                        </p>
                        <div className="pt-1 flex flex-wrap gap-1.5">
                          {flaw.evidence_phrases.map((phrase, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-2 py-0.5 rounded bg-black/50 border border-alert-amber/30 font-mono text-[11px] text-alert-amber"
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
                <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <span className="text-xs font-mono uppercase text-brand-teal font-semibold tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                    Langkah Aman yang Harus Kamu Ambil:
                  </span>
                  <ul className="space-y-2 text-xs text-text-primary/90">
                    {activeScenario.safe_steps.map((step, idx) => (
                      <li key={step.id} className="flex items-start gap-2">
                        <span className="text-brand-teal font-mono">0{idx + 1}.</span>
                        <span>{step.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ready to Copy Warning Template */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0D1117] border border-brand-teal/40 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono uppercase text-text-muted font-semibold tracking-wider">
                      Kalimat Peringatan Siap Copy:
                    </span>

                    {/* Tone Switcher */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/50 border border-white/10 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setWarningTone("casual")}
                        className={cn(
                          "px-2 py-0.5 rounded transition-colors",
                          warningTone === "casual"
                            ? "bg-white/10 text-brand-teal font-bold"
                            : "text-text-muted"
                        )}
                      >
                        Santai (Grup Teman)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWarningTone("firm")}
                        className={cn(
                          "px-2 py-0.5 rounded transition-colors",
                          warningTone === "firm"
                            ? "bg-white/10 text-brand-teal font-bold"
                            : "text-text-muted"
                        )}
                      >
                        Tegas (Grup Keluarga)
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-text-primary/95 leading-relaxed italic bg-black/30 p-3 rounded-xl border border-white/5">
                    &ldquo;{activeWarningTemplate}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-text-muted">
                      Salin dan kirim langsung sebelum orang lain terjebak.
                    </span>

                    <button
                      type="button"
                      onClick={handleCopyWarning}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-teal text-surface-base hover:bg-brand-teal/90 active:scale-95 transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Pesan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mandatory Disclaimer */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-mono text-text-muted text-center">
                  ⚠️ Ini alat bantu berpikir mandiri (decision support), bukan deteksi kepastian 100%. Selalu konfirmasi ke kanal resmi institusi terkait.
                </div>

                {/* Reset & Navigation Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Uji Skenario Lain</span>
                  </button>

                  <Link
                    href="/lite"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all shadow-sm"
                  >
                    <span>Buka Mode Taktis Lengkap di /lite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
