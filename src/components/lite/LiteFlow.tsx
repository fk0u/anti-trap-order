"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_RETRY_AFTER_S,
  SLOW_HINT_MS,
  analyzeText,
  getScenario,
  isAbortError,
  isApiError,
  listCategories,
  listScenarios,
  listTactics,
  reflect,
} from "@/lib/api-v1";
import { liteCopy } from "@/content/lite";
import { MIN_WORDS, maskText } from "@/lib/ml/contract";
import { pickMissed } from "@/lib/lite/pick-missed";
import type { Answer, Category, CategoryId, DetectedTactic, ReflectRequest, ReflectResponse, ScenarioDetail } from "@/types/api-v1";
import { ActionCardScreen } from "@/components/lite/ActionCardScreen";
import { ApiDownSheet } from "@/components/lite/ApiDownSheet";
import { LoadingScreen, type LoadingState, type SimulateKind } from "@/components/lite/LoadingScreen";
import { EMPTY_DRAFT, QuestionScreen, type AnswerDraft } from "@/components/lite/QuestionScreen";
import { RateLimitScreen } from "@/components/lite/RateLimitScreen";
import { ResultScreen } from "@/components/lite/ResultScreen";
import { SituationScreen } from "@/components/lite/SituationScreen";

type Step = "situation" | "q1" | "q2" | "q3" | "loading" | "result" | "action";
const STEPS: readonly Step[] = ["situation", "q1", "q2", "q3", "loading", "result", "action"];
const QUESTION_STEPS = ["q1", "q2", "q3"] as const;

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/**
 * Alur A20 Lite (S-03 → S-09) dalam satu route `/lite`.
 *
 * - Setiap langkah dicatat di riwayat browser (pushState) supaya tombol Back
 *   kembali ke langkah sebelumnya. State tidak disimpan: refresh → S-03.
 * - Error API: 429 → S-20; jaringan/timeout/server → S-19 (sheet) atau
 *   S-07 Error saat menunggu hasil.
 * - Privasi: teks S-03 hanya lewat analyzeText() (dimasking dulu); isi
 *   "Lainnya" tidak pernah dikirim (cukup other_filled).
 */
export function LiteFlow() {
  const [step, setStep] = useState<Step>("situation");

  // S-03
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [text, setText] = useState("");
  const [tooShortFromServer, setTooShortFromServer] = useState(false);
  const [busy, setBusy] = useState(false);

  // S-04–S-06
  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [detected, setDetected] = useState<DetectedTactic[]>([]);
  const [drafts, setDrafts] = useState<Record<string, AnswerDraft>>({});

  // S-07–S-09
  const [loadState, setLoadState] = useState<LoadingState>("waiting");
  const [result, setResult] = useState<ReflectResponse | null>(null);
  const [tacticTips, setTacticTips] = useState<string[]>([]);

  // Overlay error
  const [sheetRetry, setSheetRetry] = useState<(() => void) | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  const reflectAbort = useRef<AbortController | null>(null);

  // ---------- Riwayat browser ----------

  const go = useCallback((next: Step, mode: "push" | "replace" = "push") => {
    const state = { ...(window.history.state ?? {}), liteStep: next };
    if (mode === "push") window.history.pushState(state, "");
    else window.history.replaceState(state, "");
    setStep(next);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.history.replaceState({ ...(window.history.state ?? {}), liteStep: "situation" }, "");
    const onPop = (e: PopStateEvent) => {
      const s = (e.state as { liteStep?: Step } | null)?.liteStep;
      // Entri S-07 dari riwayat (Back lalu Forward): request-nya sudah batal → kembali ke Q3.
      const target: Step = s && STEPS.includes(s) ? (s === "loading" ? "q3" : s) : "situation";
      setStep(target);
      setSheetRetry(null);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ---------- Error ----------

  const handleError = useCallback((err: unknown, retry: () => void) => {
    if (isAbortError(err)) return;
    if (isApiError(err) && err.kind === "rate_limited") {
      setRateLimitSeconds(err.retryAfter ?? DEFAULT_RETRY_AFTER_S);
      return;
    }
    setSheetRetry(() => retry);
  }, []);

  // ---------- S-03 ----------

  const loadCategories = useCallback(() => {
    const ctrl = new AbortController();
    listCategories({ signal: ctrl.signal })
      .then(setCategories)
      .catch((err) => handleError(err, loadCategories));
    return () => ctrl.abort();
  }, [handleError]);

  useEffect(() => loadCategories(), [loadCategories]);

  // Tips S-07: `explanation` taktik dari API. Tidak kritis — kalau gagal, S-07
  // cukup menampilkan teks Figma, tanpa sheet error.
  useEffect(() => {
    const ctrl = new AbortController();
    listTactics({ signal: ctrl.signal })
      .then((list) => setTacticTips(list.map((t) => t.explanation).filter((s) => typeof s === "string" && s.trim() !== "")))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const loadingTips = useMemo(
    () => [...new Set([liteCopy.loading.body, ...tacticTips])],
    [tacticTips]
  );

  const maskedCount = useMemo(() => maskText(text).maskedCount, [text]);
  const enoughText = wordCount(text) >= MIN_WORDS;
  const canContinue = categoryId !== null || enoughText;
  // 06 S-03 Empty: pesan tampil selama belum ada kategori dan teks belum cukup.
  const showTooShort = (categoryId === null && !enoughText) || tooShortFromServer;

  const onExample = useCallback(async () => {
    try {
      const list = await listScenarios();
      const pool = list.filter((s) => s.example_message && s.example_message !== text);
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick) {
        setText(pick.example_message);
        setTooShortFromServer(false);
      }
    } catch (err) {
      handleError(err, onExample);
    }
  }, [text, handleError]);

  const onSituationNext = useCallback(async () => {
    setBusy(true);
    setSheetRetry(null);
    try {
      let scenarioId: string;
      let tactics: DetectedTactic[] = [];
      if (enoughText) {
        // Teks lebih spesifik daripada chip, jadi didahulukan.
        const an = await analyzeText(text);
        if (an.too_short) {
          setTooShortFromServer(true);
          return;
        }
        scenarioId = an.scenario_id;
        tactics = an.tactics;
      } else if (categoryId) {
        const list = await listScenarios(categoryId);
        const pick = list.find((s) => s.is_fallback) ?? list[0];
        if (!pick) throw new Error("Kategori tanpa skenario");
        scenarioId = pick.id;
      } else {
        return;
      }
      const detail = await getScenario(scenarioId);
      setScenario(detail);
      setDetected(tactics);
      setDrafts({});
      setResult(null);
      go("q1");
    } catch (err) {
      handleError(err, onSituationNext);
    } finally {
      setBusy(false);
    }
  }, [enoughText, text, categoryId, go, handleError]);

  // ---------- S-07: reflect ----------

  const runReflect = useCallback(async () => {
    if (!scenario) return;
    reflectAbort.current?.abort();
    const ctrl = new AbortController();
    reflectAbort.current = ctrl;
    setLoadState("waiting");
    setSheetRetry(null);
    const slowTimer = setTimeout(() => setLoadState((s) => (s === "waiting" ? "slow" : s)), SLOW_HINT_MS);

    const answers = scenario.questions.map((q): Answer => {
      const d = drafts[q.id] ?? EMPTY_DRAFT;
      const otherFilled = d.otherOpen && d.otherText.trim().length > 0;
      return { question_id: q.id, option_ids: d.optionIds, ...(otherFilled ? { other_filled: true } : {}) };
    }) as ReflectRequest["answers"];

    try {
      const res = await reflect({ scenario_id: scenario.id, answers }, { signal: ctrl.signal });
      setResult(res);
      go("result", "replace"); // S-07 tidak masuk riwayat: Back dari S-08 kembali ke Q3.
    } catch (err) {
      if (isAbortError(err)) return;
      if (isApiError(err) && err.kind === "rate_limited") {
        setRateLimitSeconds(err.retryAfter ?? DEFAULT_RETRY_AFTER_S);
        return;
      }
      setLoadState("error");
    } finally {
      clearTimeout(slowTimer);
    }
  }, [scenario, drafts, go]);

  // Batalkan reflect saat meninggalkan S-07 (mis. tombol Back).
  useEffect(() => {
    if (step !== "loading") reflectAbort.current?.abort();
  }, [step]);

  const onSimulate = useCallback((kind: SimulateKind) => {
    reflectAbort.current?.abort();
    if (kind === "apiDown") setSheetRetry(() => runReflect);
    else if (kind === "tooFast") setRateLimitSeconds(DEFAULT_RETRY_AFTER_S);
    else setLoadState("error");
  }, [runReflect]);

  const missed = useMemo(() => (result ? pickMissed(result.missed_candidates, detected) : []), [result, detected]);

  const restart = useCallback(() => {
    setCategoryId(null);
    setText("");
    setTooShortFromServer(false);
    setScenario(null);
    setDetected([]);
    setDrafts({});
    setResult(null);
    go("situation");
  }, [go]);

  // ---------- Render ----------

  // Langkah dari riwayat yang datanya sudah tidak ada → kembali ke S-03.
  const qIndex = QUESTION_STEPS.indexOf(step as (typeof QUESTION_STEPS)[number]);
  let view: Step = step;
  if ((qIndex >= 0 || step === "loading") && !scenario) view = "situation";
  if ((step === "result" || step === "action") && !result) view = scenario ? "q3" : "situation";

  let screen: React.ReactNode;
  if (view === "situation") {
    screen = (
      <SituationScreen
        categories={categories}
        categoryId={categoryId}
        onSelectCategory={(id) => setCategoryId((cur) => (cur === id ? null : id))}
        text={text}
        onTextChange={(t) => {
          setText(t);
          setTooShortFromServer(false);
        }}
        maskedCount={maskedCount}
        showTooShort={showTooShort}
        canContinue={canContinue}
        busy={busy}
        onExample={onExample}
        onNext={onSituationNext}
      />
    );
  } else if (qIndex >= 0 && scenario) {
    const question = scenario.questions[qIndex];
    screen = (
      <QuestionScreen
        key={question.id}
        question={question}
        message={scenario.example_message}
        draft={drafts[question.id] ?? EMPTY_DRAFT}
        onDraftChange={(d) => setDrafts((all) => ({ ...all, [question.id]: d }))}
        onBack={() => window.history.back()}
        onNext={() => {
          if (qIndex < 2) {
            go(QUESTION_STEPS[qIndex + 1]);
          } else {
            setResult(null); // jangan tampilkan hasil lama saat mengirim ulang
            go("loading");
            void runReflect();
          }
        }}
      />
    );
  } else if (view === "loading") {
    screen = (
      <LoadingScreen state={loadState} tips={loadingTips} onRetry={() => void runReflect()} onSimulate={onSimulate} />
    );
  } else if (view === "result" && result) {
    screen = <ResultScreen result={result} missed={missed} onNext={() => go("action")} />;
  } else if (view === "action" && result) {
    screen = <ActionCardScreen card={result.action_card} onBack={() => window.history.back()} onRestart={restart} />;
  }

  return (
    <>
      {screen}
      <ApiDownSheet
        open={sheetRetry !== null}
        onClose={() => setSheetRetry(null)}
        onRetry={() => {
          const retry = sheetRetry;
          setSheetRetry(null);
          retry?.();
        }}
      />
      {rateLimitSeconds !== null && (
        <RateLimitScreen
          key={rateLimitSeconds}
          seconds={rateLimitSeconds}
          onClose={() => {
            setRateLimitSeconds(null);
            // 429 saat menunggu hasil: kembali ke Q3 supaya bisa kirim ulang.
            if (step === "loading") window.history.back();
          }}
        />
      )}
    </>
  );
}
