/**
 * Klien API v1 Anti Trap Order (kontrak: docs/openapi.yaml, tipe: src/types/api-v1.ts).
 *
 * - Tidak ada fallback diam-diam ke engine lokal. Kegagalan dilempar sebagai
 *   `ApiError` dengan `kind`; `errorScreen()` memetakannya ke layar
 *   (S-07 Error / S-19, S-18, S-20).
 * - Setiap respons divalidasi bentuknya (api-v1-validate.ts): data salah
 *   menjadi error S-18, bukan crash saat render.
 * - Teks user hanya dikirim lewat `analyzeText()`, dan selalu dimasking dulu
 *   di sini (K12). Jangan mencatat teks ke console/log.
 * - Request lain hanya berisi ID (Soul: juga meter angka; nama panggilan
 *   tidak pernah dikirim).
 */
import { maskText } from "@/lib/ml/contract";
import {
  ResponseShapeError,
  UnknownIdError,
  parseAnalyze,
  parseCategories,
  parseCharacterOptions,
  parseHealth,
  parseReflect,
  parseScenarioDetail,
  parseScenarioSummaries,
  parseSoulStart,
  parseSoulStep,
  parseTactics,
} from "@/lib/api-v1-validate";
import {
  ANALYZE_TEXT_MAX_LENGTH,
  type AnalyzeRequest,
  type AnalyzeResponse,
  type Answer,
  type Category,
  type CategoryId,
  type CharacterOptions,
  type ErrorCode,
  type ErrorResponse,
  type Health,
  type ReflectRequest,
  type ReflectResponse,
  type ScenarioDetail,
  type ScenarioSummary,
  type SoulStartRequest,
  type SoulStartResponse,
  type SoulStepRequest,
  type SoulStepResponse,
  type Tactic,
} from "@/types/api-v1";

// ---------- Konstanta waktu (BELUM FINAL — menunggu keputusan lead soal K9) ----------

/** Setelah sekian ms tanpa jawaban, S-07 menampilkan chip "Agak lama?". */
export const SLOW_HINT_MS = 3_000;
/** Batas total satu request. Lewat dari ini → `ApiError` kind "timeout" (S-07 Error / S-19). */
export const REQUEST_TIMEOUT_MS = 10_000;
/** Hitung mundur S-20 jika server tidak mengirim `retry_after` / `Retry-After`. */
export const DEFAULT_RETRY_AFTER_S = 20;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ---------- Error ----------

export type ApiErrorKind =
  | "network" // server tidak terjangkau / CORS / offline → S-19 atau S-07 Error
  | "timeout" // lewat REQUEST_TIMEOUT_MS → S-19 atau S-07 Error
  | "rate_limited" // 429 → S-20
  | "server" // 5xx → S-18
  | "validation" // 400 (dan 4xx lain) → S-18
  | "not_found" // 404 dari API, atau ID kategori/taktik tak dikenal → S-18
  | "invalid_response"; // JSON rusak / bentuk data salah → S-18

/** Layar untuk sebuah error: "offline" = S-07 Error/S-19, "server" = S-18, "rate" = S-20, "ignore" = dibatalkan pemanggil. */
export type ErrorScreen = "offline" | "server" | "rate" | "ignore";

export function errorScreen(err: unknown): ErrorScreen {
  if (isAbortError(err)) return "ignore";
  if (!isApiError(err)) return "server";
  if (err.kind === "network" || err.kind === "timeout") return "offline";
  if (err.kind === "rate_limited") return "rate";
  return "server";
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** Status HTTP; null untuk network/timeout. */
  readonly status: number | null;
  readonly code: ErrorCode | null;
  /** Field yang salah (VALIDATION_ERROR). */
  readonly field?: string;
  /** Detik sebelum boleh mencoba lagi (RATE_LIMITED). */
  readonly retryAfter?: number;

  constructor(
    kind: ApiErrorKind,
    message: string,
    init: { status?: number | null; code?: ErrorCode | null; field?: string; retryAfter?: number } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = init.status ?? null;
    this.code = init.code ?? null;
    this.field = init.field;
    this.retryAfter = init.retryAfter;
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

/** true jika request dibatalkan oleh pemanggil lewat `signal` (mis. user pindah layar) — abaikan saja. */
export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 429) return "rate_limited";
  if (status === 404) return "not_found";
  if (status >= 500) return "server";
  return "validation";
}

function parseRetryAfter(body: ErrorResponse | null, header: string | null): number {
  const fromBody = body?.error?.retry_after;
  if (typeof fromBody === "number" && fromBody > 0) return fromBody;
  const fromHeader = header ? Number.parseInt(header, 10) : Number.NaN;
  return Number.isFinite(fromHeader) && fromHeader > 0 ? fromHeader : DEFAULT_RETRY_AFTER_S;
}

// ---------- Inti request ----------

export type RequestOptions = {
  /** Batalkan request dari luar (mis. saat komponen unmount). */
  signal?: AbortSignal;
  /** Menimpa REQUEST_TIMEOUT_MS untuk satu panggilan. */
  timeoutMs?: number;
};

async function request<T>(
  method: "GET" | "POST",
  path: string,
  body: unknown,
  parse: (data: unknown) => T,
  opts: RequestOptions = {}
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, opts.timeoutMs ?? REQUEST_TIMEOUT_MS);

  const external = opts.signal;
  const forwardAbort = () => controller.abort();
  if (external?.aborted) controller.abort();
  else external?.addEventListener("abort", forwardAbort, { once: true });

  try {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: body === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store",
        credentials: "omit",
      });
    } catch (err) {
      if (timedOut) throw new ApiError("timeout", `Tidak ada jawaban dalam ${opts.timeoutMs ?? REQUEST_TIMEOUT_MS} ms`);
      if (external?.aborted) throw err; // dibatalkan pemanggil
      throw new ApiError("network", "Server tidak dapat dihubungi");
    }

    if (!res.ok) {
      let errBody: ErrorResponse | null = null;
      try {
        errBody = (await res.json()) as ErrorResponse;
      } catch {
        // body bukan JSON — pakai status saja
      }
      const kind = kindFromStatus(res.status);
      throw new ApiError(kind, errBody?.error?.message ?? `HTTP ${res.status}`, {
        status: res.status,
        code: errBody?.error?.code ?? null,
        field: errBody?.error?.field,
        retryAfter: kind === "rate_limited" ? parseRetryAfter(errBody, res.headers.get("Retry-After")) : undefined,
      });
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch (err) {
      if (timedOut) throw new ApiError("timeout", `Tidak ada jawaban dalam ${opts.timeoutMs ?? REQUEST_TIMEOUT_MS} ms`);
      if (external?.aborted) throw err;
      throw new ApiError("invalid_response", "Respons server bukan JSON yang valid", { status: res.status });
    }
    try {
      return parse(data);
    } catch (err) {
      if (err instanceof UnknownIdError) throw new ApiError("not_found", err.message, { status: res.status });
      if (err instanceof ResponseShapeError) throw new ApiError("invalid_response", err.message, { status: res.status });
      throw err;
    }
  } finally {
    clearTimeout(timer);
    external?.removeEventListener("abort", forwardAbort);
  }
}

// ---------- Endpoint ----------

/** GET /api/v1/health */
export function getHealth(opts?: RequestOptions): Promise<Health> {
  return request("GET", "/api/v1/health", undefined, parseHealth, opts);
}

/** GET /api/v1/lite/categories — CategoryChip S-03. */
export function listCategories(opts?: RequestOptions): Promise<Category[]> {
  return request("GET", "/api/v1/lite/categories", undefined, parseCategories, opts);
}

/** GET /api/v1/lite/tactics — katalog TacticBadge + kartu "Yang mungkin belum kepikiran". */
export function listTactics(opts?: RequestOptions): Promise<Tactic[]> {
  return request("GET", "/api/v1/lite/tactics", undefined, parseTactics, opts);
}

/** GET /api/v1/lite/scenarios — ringkasan skenario ("Contoh fiktif", pilih skenario per kategori). */
export function listScenarios(category?: CategoryId, opts?: RequestOptions): Promise<ScenarioSummary[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return request("GET", `/api/v1/lite/scenarios${query}`, undefined, parseScenarioSummaries, opts);
}

/** GET /api/v1/lite/scenarios/{id} — 3 pertanyaan Mode Pelaku (S-04–06). */
export function getScenario(id: string, opts?: RequestOptions): Promise<ScenarioDetail> {
  return request("GET", `/api/v1/lite/scenarios/${encodeURIComponent(id)}`, undefined, parseScenarioDetail, opts);
}

/**
 * POST /api/v1/lite/analyze — satu-satunya request berisi teks user (K12).
 *
 * Teks SELALU dimasking di sini (nomor HP, email, rekening, URL) sebelum
 * dikirim, jadi teks mentah tidak pernah keluar dari browser. Hitungan untuk
 * chip "N data disamarkan" ambil dari `maskText()` di UI, bukan dari respons.
 *
 * Token masking bisa sedikit lebih panjang dari aslinya (mis. 8 digit →
 * `<REKENING>`), jadi hasil masking dipotong ke batas 2000 karakter agar
 * tidak berujung 400 dari server.
 */
export function analyzeText(text: string, opts?: RequestOptions): Promise<AnalyzeResponse> {
  const { masked } = maskText(text);
  const trimmed = masked.trim().slice(0, ANALYZE_TEXT_MAX_LENGTH).trim();
  if (trimmed.length === 0) {
    return Promise.reject(new ApiError("validation", "Teks kosong", { code: "VALIDATION_ERROR", field: "text" }));
  }
  const body: AnalyzeRequest = { text: trimmed };
  return request("POST", "/api/v1/lite/analyze", body, parseAnalyze, opts);
}

/**
 * POST /api/v1/lite/reflect — hasil celah (S-08) + Action Card (S-09).
 *
 * Body dibangun ulang field per field supaya tidak ada data lain yang ikut
 * terkirim (mis. isi "Lainnya"); server juga menolak field tak dikenal.
 */
export function reflect(req: ReflectRequest, opts?: RequestOptions): Promise<ReflectResponse> {
  const answers = req.answers.map(
    (a): Answer => ({
      question_id: a.question_id,
      option_ids: [...a.option_ids],
      ...(a.other_filled ? { other_filled: true } : {}),
    })
  ) as ReflectRequest["answers"];
  const body: ReflectRequest = { scenario_id: req.scenario_id, answers };
  return request("POST", "/api/v1/lite/reflect", body, parseReflect, opts);
}

// ---------- Soul (S-10 – S-14) ----------
//
// Nama panggilan karakter TIDAK PERNAH dikirim: hanya arc_id, mission_id,
// choice_id, dan meters. Narasi diisi di frontend dengan fillStory().

/** GET /api/v1/soul/characters — template karakter + relasi (S-10). */
export function listCharacters(opts?: RequestOptions): Promise<CharacterOptions> {
  return request("GET", "/api/v1/soul/characters", undefined, parseCharacterOptions, opts);
}

/** POST /api/v1/soul/start — meter awal + Misi 1 (S-11). */
export function startSoul(arcId: string, opts?: RequestOptions): Promise<SoulStartResponse> {
  const body: SoulStartRequest = { arc_id: arcId };
  return request("POST", "/api/v1/soul/start", body, parseSoulStart, opts);
}

/**
 * POST /api/v1/soul/step — konsekuensi (S-13) + misi berikutnya, atau
 * ringkasan (S-14) jika `next_mission` null. Server stateless: kirim ulang
 * meter terakhir. Body dibangun ulang field per field.
 */
export function stepSoul(req: SoulStepRequest, opts?: RequestOptions): Promise<SoulStepResponse> {
  const body: SoulStepRequest = {
    arc_id: req.arc_id,
    mission_id: req.mission_id,
    choice_id: req.choice_id,
    meters: { kepercayaan: req.meters.kepercayaan, kewaspadaan: req.meters.kewaspadaan, keamanan: req.meters.keamanan },
  };
  return request("POST", "/api/v1/soul/step", body, parseSoulStep, opts);
}
