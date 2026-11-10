/**
 * Model cadangan di browser (mode terbatas): port TypeScript dari `internal/ml`
 * (Go). Memakai `internal/ml/model.json` yang sama, jadi hasilnya harus sama
 * dengan server; dijaga oleh `scripts/verify-offline.ts` (fixture
 * `testdata/fixtures/ml-*.json`).
 *
 * Murni: tanpa jaringan, tanpa penyimpanan. Teks tidak pernah keluar dari browser.
 */
import modelJson from "../../../internal/ml/model.json";
import { maskText } from "@/lib/ml/contract";
import type { AnalyzeResponse, DetectedTactic, TacticId } from "@/types/api-v1";
import { TACTIC_IDS } from "@/types/api-v1";
import { SLANG } from "./slang";

const DISCLAIMER = "Ini alat bantu berpikir, bukan deteksi pasti.";
const GENERIC_SCENARIO = "generic_emergency";
const MIN_WORDS = 5;

interface Classifier {
  threshold?: number;
  priors: Record<string, number>;
  likelihoods: Record<string, Record<string, number>>;
  totals: Record<string, number>;
}

interface Model {
  version: string;
  category: Classifier;
  tactics: Record<string, Classifier>;
  unknown: Record<string, Record<string, number>>;
}

const model = modelJson as unknown as Model;

export interface ScenarioIndex {
  id: string;
  category: string;
  keywords: string[];
  is_fallback: boolean;
}

// ---------- Tokenisasi (sama dengan internal/ml/tokenize.go) ----------

const SPECIAL = new Set(["<nomor>", "<url>", "<rekening>", "<email>", "<uang>", "<angka>", "<seru>"]);
const MONEY_RE =
  /rp\.?\s?\d[\d.,]*(\s?(rb|ribu|k|jt|juta|jutaan|m|miliar))?\b|\b\d[\d.,]*\s?(rb|ribu|k|jt|juta|jutaan|miliar)\b/g;

/** Huruf yang sama 3x atau lebih berturut-turut menjadi satu. */
function collapseRepeats(s: string): string {
  const rs = Array.from(s);
  let out = "";
  for (let i = 0; i < rs.length; ) {
    let j = i;
    while (j < rs.length && rs[j] === rs[i]) j++;
    out += /\p{L}/u.test(rs[i]) && j - i >= 3 ? rs[i] : rs.slice(i, j).join("");
    i = j;
  }
  return out;
}

export function normalize(text: string): string[] {
  let s = text.toLowerCase();
  s = s.replace(MONEY_RE, " <uang> ");
  s = s.replace(/\d+/g, " <angka> ");
  s = s.replace(/!{2,}/g, " <seru> ");
  s = collapseRepeats(s);
  s = s.replace(/[^\p{L}<>\s]/gu, " ");
  const out: string[] = [];
  for (const raw of s.split(/\s+/).filter(Boolean)) {
    if (SPECIAL.has(raw)) {
      out.push(raw);
      continue;
    }
    let w = raw.replace(/[<>]/g, "");
    if (w === "") continue;
    if (Object.hasOwn(SLANG, w)) w = SLANG[w];
    out.push(w);
  }
  return out;
}

export function tokenize(text: string): string[] {
  const w = normalize(text);
  const out = [...w];
  for (let i = 0; i + 1 < w.length; i++) out.push(`${w[i]}_${w[i + 1]}`);
  return out;
}

// ---------- Naive Bayes (sama dengan internal/ml/naivebayes.go) ----------

const round4 = (x: number) => Math.round(x * 1e4) / 1e4;

const vocabCache = new WeakMap<Classifier, Set<string>>();
function vocab(c: Classifier): Set<string> {
  let v = vocabCache.get(c);
  if (!v) {
    v = new Set();
    for (const m of Object.values(c.likelihoods)) for (const t of Object.keys(m)) v.add(t);
    vocabCache.set(c, v);
  }
  return v;
}

const classesOf = (c: Classifier) => Object.keys(c.priors).sort();

function predict(c: Classifier, unk: Record<string, number>, tokens: string[]): Record<string, number> {
  const cls = classesOf(c);
  const v = vocab(c);
  const scores: Record<string, number> = {};
  for (const k of cls) scores[k] = c.priors[k];
  for (const t of tokens) {
    if (!v.has(t)) continue;
    for (const k of cls) scores[k] += Object.hasOwn(c.likelihoods[k], t) ? c.likelihoods[k][t] : unk[k];
  }
  let mx = -Infinity;
  for (const k of cls) mx = Math.max(mx, scores[k]);
  const probs: Record<string, number> = {};
  let sum = 0;
  for (const k of cls) {
    probs[k] = Math.exp(scores[k] - mx);
    sum += probs[k];
  }
  for (const k of cls) probs[k] /= sum;
  return probs;
}

function topTokens(c: Classifier, unk: Record<string, number>, tokens: string[], k: number): string[] {
  const ll = (cls: string, t: string) => (Object.hasOwn(c.likelihoods[cls] ?? {}, t) ? c.likelihoods[cls][t] : unk[cls]);
  const v = vocab(c);
  const seen = new Set<string>();
  const cand: { t: string; r: number }[] = [];
  for (const t of tokens) {
    if (seen.has(t) || !v.has(t)) continue;
    seen.add(t);
    const r = ll("yes", t) - ll("no", t);
    if (r > 0) cand.push({ t, r });
  }
  cand.sort((a, b) => (a.r !== b.r ? b.r - a.r : a.t < b.t ? -1 : a.t > b.t ? 1 : 0));
  return cand.slice(0, k).map((x) => x.t);
}

function predictCategory(tokens: string[]): { id: string; confidence: number } {
  const probs = predict(model.category, model.unknown["category"], tokens);
  let best = "";
  let bp = -1;
  for (const k of classesOf(model.category)) {
    if (probs[k] > bp) {
      best = k;
      bp = probs[k];
    }
  }
  return bp < 0.5 ? { id: "lainnya", confidence: bp } : { id: best, confidence: bp };
}

function predictTactics(tokens: string[]): DetectedTactic[] {
  const out: DetectedTactic[] = [];
  for (const id of TACTIC_IDS) {
    const c = model.tactics[id];
    if (!c) continue;
    const unk = model.unknown[id];
    const p = predict(c, unk, tokens);
    if (p["yes"] >= (c.threshold ?? 0)) {
      out.push({ id: id as TacticId, score: round4(p["yes"]), top_tokens: topTokens(c, unk, tokens, 3) });
    }
  }
  return out.sort((a, b) => b.score - a.score); // stabil: seri tetap urutan TACTIC_IDS
}

// ---------- Skenario dan Analyze (sama dengan internal/ml/analyze.go) ----------

function containsSeq(words: string[], kw: string[]): boolean {
  for (let i = 0; i + kw.length <= words.length; i++) {
    let j = 0;
    while (j < kw.length && words[i + j] === kw[j]) j++;
    if (j === kw.length) return true;
  }
  return false;
}

function pickScenario(masked: string, cat: string, scenarios: ScenarioIndex[]): string {
  const words = normalize(masked);
  let best = "";
  let bestScore = 0;
  let fallback = "";
  for (const s of scenarios) {
    if (s.category !== cat) continue;
    if (s.is_fallback && fallback === "") fallback = s.id;
    const seen = new Set<string>();
    let score = 0;
    for (const k of s.keywords) {
      const kw = normalize(k);
      const key = kw.join(" ");
      if (kw.length === 0 || seen.has(key)) continue;
      seen.add(key);
      if (containsSeq(words, kw)) score++;
    }
    if (score > bestScore) {
      best = s.id;
      bestScore = score;
    }
  }
  return best || fallback || GENERIC_SCENARIO;
}

export function analyzeLocal(text: string, scenarios: ScenarioIndex[]): AnalyzeResponse {
  const { masked, maskedCount } = maskText(text);
  const base = { masked, masked_count: maskedCount, model_version: model.version, disclaimer: DISCLAIMER };
  if (masked.split(/\s+/).filter(Boolean).length < MIN_WORDS) {
    return { ...base, too_short: true, category: { id: "lainnya", confidence: 0 }, scenario_id: GENERIC_SCENARIO, tactics: [] };
  }
  const toks = tokenize(masked);
  const cat = predictCategory(toks);
  return {
    ...base,
    too_short: false,
    category: { id: cat.id as AnalyzeResponse["category"]["id"], confidence: round4(cat.confidence) },
    scenario_id: pickScenario(masked, cat.id, scenarios),
    tactics: predictTactics(toks),
  };
}
