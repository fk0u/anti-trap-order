/**
 * Mesin Lite lokal untuk "mode terbatas" (S-07 Error, S-19): menjawab hal yang
 * biasanya dijawab API v1 — kategori, skenario, analisis teks, refleksi —
 * sepenuhnya di browser. Data dan aturan sama dengan server Go:
 *   - `internal/data/v1/*.json`   (konten)
 *   - `internal/lite/reflect.go`  (logika refleksi, dibawa apa adanya)
 *   - `internal/ml/*`             (lihat ml.ts)
 * Tidak ada jaringan dan tidak ada penyimpanan; teks user tidak pernah keluar.
 * Dimuat lewat dynamic import dari LiteFlow supaya bundel awal tidak membengkak.
 */
import categoriesJson from "../../../internal/data/v1/categories.json";
import tacticsJson from "../../../internal/data/v1/tactics.json";
import scenariosJson from "../../../internal/data/v1/scenarios.json";
import { TACTIC_IDS } from "@/types/api-v1";
import type {
  ActionCard,
  AnalyzeResponse,
  Answer,
  Category,
  CategoryId,
  GapCard,
  ReflectRequest,
  ReflectResponse,
  ScenarioDetail,
  ScenarioSummary,
  Tactic,
  TacticRef,
} from "@/types/api-v1";
import { analyzeLocal } from "./ml";

const WHY_IT_WORKS =
  "Saat kamu memposisikan diri sebagai pelaku, pola yang tadinya samar jadi jelas — dan itu bisa kamu kenali lagi lain kali.";
const DISCLAIMER = "Ini alat bantu berpikir, bukan deteksi pasti.";

interface RawOption {
  id: string;
  label: string;
  tags: string[];
}
interface RawQuestion {
  id: string;
  step: 1 | 2 | 3;
  prompt: string;
  min_select: 1;
  max_select: 2;
  allow_other: boolean;
  other_max_length: 80;
  options: RawOption[];
}
interface RawFlaw {
  id: string;
  tactic: string;
  explanation: string;
  counter: string;
  severity: 1 | 2 | 3;
  tags: string[];
}
interface RawScenario {
  id: string;
  category: CategoryId;
  title: string;
  example_message: string;
  keywords: string[];
  is_fallback: boolean;
  questions: RawQuestion[];
  flaws: RawFlaw[];
  action_card: ActionCard;
}

const categories = categoriesJson as Category[];
const tactics = tacticsJson as Tactic[];
const scenarios = scenariosJson as unknown as RawScenario[];

const tacticById = new Map(tactics.map((t) => [t.id, t]));
const tacticRef = (id: string): TacticRef => {
  const t = tacticById.get(id as Tactic["id"]);
  if (!t) throw new Error("Taktik tidak dikenal");
  return { id: t.id, label: t.label, icon: t.icon };
};

const scenarioIndex = scenarios.map((s) => ({
  id: s.id,
  category: s.category,
  keywords: s.keywords,
  is_fallback: s.is_fallback,
}));

export function listCategoriesLocal(): Category[] {
  return categories;
}

export function listTacticsLocal(): Tactic[] {
  return tactics;
}

export function listScenariosLocal(category?: CategoryId): ScenarioSummary[] {
  return scenarios
    .filter((s) => !category || s.category === category)
    .map((s) => ({
      id: s.id,
      category: s.category,
      title: s.title,
      example_message: s.example_message,
      keywords: s.keywords,
      is_fallback: s.is_fallback,
    }));
}

/** Seperti GET /lite/scenarios/{id}: tag opsi dan celah tidak ikut keluar. */
export function getScenarioLocal(id: string): ScenarioDetail {
  const s = scenarios.find((x) => x.id === id);
  if (!s) throw new Error("Skenario tidak ditemukan");
  return {
    id: s.id,
    category: s.category,
    title: s.title,
    example_message: s.example_message,
    questions: s.questions.map((q) => ({
      id: q.id,
      step: q.step,
      prompt: q.prompt,
      min_select: q.min_select,
      max_select: q.max_select,
      allow_other: q.allow_other,
      other_max_length: q.other_max_length,
      options: q.options.map((o) => ({ id: o.id, label: o.label })),
    })) as ScenarioDetail["questions"],
  };
}

export function analyzeTextLocal(text: string): AnalyzeResponse {
  return analyzeLocal(text, scenarioIndex);
}

/** Port `lite.Reflect` (internal/lite/reflect.go), termasuk aturan kandidat "missed" minimal satu. */
export function reflectLocal(req: ReflectRequest): ReflectResponse {
  const sc = scenarios.find((s) => s.id === req.scenario_id);
  if (!sc) throw new Error("Skenario tidak ditemukan");
  if (req.answers.length !== 3) throw new Error("Jawab ketiga pertanyaan dulu ya.");

  const picked: RawOption[] = [];
  const seenQ = new Set<string>();
  for (const a of req.answers as Answer[]) {
    const q = sc.questions.find((x) => x.id === a.question_id);
    if (!q || seenQ.has(a.question_id)) throw new Error("Pertanyaan tidak dikenali atau terisi dua kali.");
    seenQ.add(a.question_id);
    if (a.option_ids.length > 2 || (a.option_ids.length === 0 && !a.other_filled)) {
      throw new Error("Pilih 1 atau 2 jawaban untuk tiap pertanyaan.");
    }
    const seenO = new Set<string>();
    for (const id of a.option_ids) {
      const o = q.options.find((x) => x.id === id);
      if (!o || seenO.has(id)) throw new Error("Pilihan tidak dikenali atau terpilih dua kali.");
      seenO.add(id);
      picked.push(o);
    }
  }

  const card = (f: RawFlaw, kind: GapCard["kind"], quote: string | null): GapCard => ({
    flaw_id: f.id,
    kind,
    tactic: tacticRef(f.tactic),
    user_quote: quote,
    explanation: f.explanation,
    counter: f.counter,
    severity: f.severity,
  });

  let found: GapCard[] = [];
  let missed: RawFlaw[] = [];
  const foundTactics = new Set<string>();
  for (const f of sc.flaws) {
    const hit = picked.find((o) => o.tags.some((t) => f.tags.includes(t)));
    if (!hit) {
      missed.push(f);
      continue;
    }
    found.push(card(f, "found", hit.label));
    foundTactics.add(f.tactic);
  }
  found = found.sort((a, b) => b.severity - a.severity); // stabil
  missed = missed.sort((a, b) => b.severity - a.severity);

  const cands: GapCard[] = missed.map((f) => card(f, "missed", null));
  if (cands.length === 0) {
    let best = "";
    let bestSev = -1;
    for (const id of TACTIC_IDS) {
      if (foundTactics.has(id)) continue;
      let sev = 1;
      for (const s of scenarios) for (const f of s.flaws) if (f.tactic === id && f.severity > sev) sev = f.severity;
      if (sev > bestSev) {
        best = id;
        bestSev = sev;
      }
    }
    if (best) {
      const t = tacticById.get(best as Tactic["id"])!;
      cands.push({
        flaw_id: `tactic_${best}`,
        kind: "missed",
        tactic: tacticRef(best),
        user_quote: null,
        explanation: t.explanation,
        counter: t.counter,
        severity: bestSev as GapCard["severity"],
      });
    }
  }

  const cat = categories.find((c) => c.id === sc.category);
  if (!cat) throw new Error("Kategori tidak dikenal");
  return {
    scenario_id: sc.id,
    category: cat,
    found_count: found.length,
    found,
    missed_candidates: cands,
    why_it_works: WHY_IT_WORKS,
    action_card: sc.action_card,
    disclaimer: DISCLAIMER,
  };
}
