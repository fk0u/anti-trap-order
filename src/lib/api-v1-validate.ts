/**
 * Validasi bentuk respons API v1 (tanpa library). Respons yang bentuknya
 * salah menjadi error yang bisa ditangani UI (S-18), bukan crash saat render.
 *
 * Yang dicek hanya field yang dipakai UI, sesuai docs/openapi.yaml.
 * - Bentuk salah → `ResponseShapeError` → ApiError kind "invalid_response".
 * - ID kategori/taktik di luar CATEGORY_IDS/TACTIC_IDS → `UnknownIdError`
 *   → ApiError kind "not_found" (keputusan: diperlakukan seperti data tidak ditemukan).
 */
import {
  CATEGORY_IDS,
  TACTIC_IDS,
  type AnalyzeResponse,
  type Category,
  type CategoryId,
  type GapCard,
  type Health,
  type ReflectResponse,
  type ScenarioDetail,
  type ScenarioSummary,
  type Tactic,
  type TacticId,
  type TacticRef,
} from "@/types/api-v1";

export class ResponseShapeError extends Error {
  constructor(path: string, what: string) {
    super(`${path}: ${what}`);
    this.name = "ResponseShapeError";
  }
}

export class UnknownIdError extends Error {
  constructor(path: string, value: string) {
    super(`${path}: ID tidak dikenal "${value}"`);
    this.name = "UnknownIdError";
  }
}

type Obj = Record<string, unknown>;

function obj(v: unknown, path: string): Obj {
  if (typeof v !== "object" || v === null || Array.isArray(v)) throw new ResponseShapeError(path, "harus objek");
  return v as Obj;
}
function str(v: unknown, path: string): string {
  if (typeof v !== "string") throw new ResponseShapeError(path, "harus string");
  return v;
}
function num(v: unknown, path: string): number {
  if (typeof v !== "number" || !Number.isFinite(v)) throw new ResponseShapeError(path, "harus angka");
  return v;
}
function bool(v: unknown, path: string): boolean {
  if (typeof v !== "boolean") throw new ResponseShapeError(path, "harus boolean");
  return v;
}
function arr<T>(v: unknown, path: string, item: (x: unknown, p: string) => T): T[] {
  if (!Array.isArray(v)) throw new ResponseShapeError(path, "harus array");
  return v.map((x, i) => item(x, `${path}[${i}]`));
}
function oneOf<T extends string>(v: unknown, path: string, list: readonly T[]): T {
  const s = str(v, path);
  if (!(list as readonly string[]).includes(s)) throw new ResponseShapeError(path, `harus salah satu dari ${list.join("/")}`);
  return s as T;
}
function categoryId(v: unknown, path: string): CategoryId {
  const s = str(v, path);
  if (!(CATEGORY_IDS as readonly string[]).includes(s)) throw new UnknownIdError(path, s);
  return s as CategoryId;
}
function tacticId(v: unknown, path: string): TacticId {
  const s = str(v, path);
  if (!(TACTIC_IDS as readonly string[]).includes(s)) throw new UnknownIdError(path, s);
  return s as TacticId;
}

// ---------- Per endpoint ----------

export function parseHealth(v: unknown): Health {
  const o = obj(v, "health");
  oneOf(o.status, "health.status", ["ok"] as const);
  return v as Health;
}

function category(v: unknown, path: string): Category {
  const o = obj(v, path);
  categoryId(o.id, `${path}.id`);
  str(o.label, `${path}.label`);
  str(o.icon, `${path}.icon`);
  return v as Category;
}

export function parseCategories(v: unknown): Category[] {
  return arr(v, "categories", category);
}

export function parseTactics(v: unknown): Tactic[] {
  return arr(v, "tactics", (x, p) => {
    const o = obj(x, p);
    tacticId(o.id, `${p}.id`);
    str(o.label, `${p}.label`);
    str(o.icon, `${p}.icon`);
    str(o.explanation, `${p}.explanation`);
    str(o.counter, `${p}.counter`);
    return x as Tactic;
  });
}

export function parseScenarioSummaries(v: unknown): ScenarioSummary[] {
  return arr(v, "scenarios", (x, p) => {
    const o = obj(x, p);
    str(o.id, `${p}.id`);
    categoryId(o.category, `${p}.category`);
    str(o.example_message, `${p}.example_message`);
    bool(o.is_fallback, `${p}.is_fallback`);
    return x as ScenarioSummary;
  });
}

export function parseScenarioDetail(v: unknown): ScenarioDetail {
  const o = obj(v, "scenario");
  str(o.id, "scenario.id");
  categoryId(o.category, "scenario.category");
  str(o.example_message, "scenario.example_message");
  const qs = arr(o.questions, "scenario.questions", (x, p) => {
    const q = obj(x, p);
    str(q.id, `${p}.id`);
    oneOf(String(q.step), `${p}.step`, ["1", "2", "3"] as const);
    str(q.prompt, `${p}.prompt`);
    num(q.max_select, `${p}.max_select`);
    bool(q.allow_other, `${p}.allow_other`);
    num(q.other_max_length, `${p}.other_max_length`);
    const opts = arr(q.options, `${p}.options`, (y, pp) => {
      const op = obj(y, pp);
      str(op.id, `${pp}.id`);
      str(op.label, `${pp}.label`);
      return y;
    });
    if (opts.length === 0) throw new ResponseShapeError(`${p}.options`, "tidak boleh kosong");
    return x;
  });
  if (qs.length !== 3) throw new ResponseShapeError("scenario.questions", "harus 3 pertanyaan");
  return v as ScenarioDetail;
}

export function parseAnalyze(v: unknown): AnalyzeResponse {
  const o = obj(v, "analyze");
  bool(o.too_short, "analyze.too_short");
  str(o.scenario_id, "analyze.scenario_id");
  const c = obj(o.category, "analyze.category");
  categoryId(c.id, "analyze.category.id");
  arr(o.tactics, "analyze.tactics", (x, p) => {
    const t = obj(x, p);
    tacticId(t.id, `${p}.id`);
    num(t.score, `${p}.score`);
    return x;
  });
  return v as AnalyzeResponse;
}

function tacticRef(v: unknown, path: string): TacticRef {
  const o = obj(v, path);
  tacticId(o.id, `${path}.id`);
  str(o.label, `${path}.label`);
  str(o.icon, `${path}.icon`);
  return v as TacticRef;
}

function gapCard(v: unknown, path: string): GapCard {
  const o = obj(v, path);
  str(o.flaw_id, `${path}.flaw_id`);
  oneOf(o.kind, `${path}.kind`, ["found", "missed"] as const);
  tacticRef(o.tactic, `${path}.tactic`);
  if (o.user_quote !== null && o.user_quote !== undefined) str(o.user_quote, `${path}.user_quote`);
  str(o.explanation, `${path}.explanation`);
  str(o.counter, `${path}.counter`);
  return v as GapCard;
}

export function parseReflect(v: unknown): ReflectResponse {
  const o = obj(v, "reflect");
  str(o.scenario_id, "reflect.scenario_id");
  category(o.category, "reflect.category");
  num(o.found_count, "reflect.found_count");
  arr(o.found, "reflect.found", gapCard);
  arr(o.missed_candidates, "reflect.missed_candidates", gapCard);
  str(o.why_it_works, "reflect.why_it_works");
  const ac = obj(o.action_card, "reflect.action_card");
  str(ac.category_label, "reflect.action_card.category_label");
  arr(ac.checklist, "reflect.action_card.checklist", (x, p) => {
    const c = obj(x, p);
    str(c.id, `${p}.id`);
    str(c.text, `${p}.text`);
    return x;
  });
  const w = obj(ac.warnings, "reflect.action_card.warnings");
  str(w.santai, "reflect.action_card.warnings.santai");
  str(w.tegas, "reflect.action_card.warnings.tegas");
  arr(ac.report_channels, "reflect.action_card.report_channels", (x, p) => {
    const r = obj(x, p);
    str(r.name, `${p}.name`);
    oneOf(r.status, `${p}.status`, ["placeholder", "verified"] as const);
    str(r.note, `${p}.note`);
    if (r.url !== null && r.url !== undefined) str(r.url, `${p}.url`);
    return x;
  });
  return v as ReflectResponse;
}
