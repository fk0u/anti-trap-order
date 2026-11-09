/**
 * Klien API v1 Anti Trap Order (kontrak: docs/openapi.yaml, tipe: src/types/api-v1.ts).
 *
 * - Tidak ada fallback diam-diam ke engine lokal. Kegagalan dilempar sebagai
 *   `ApiError` dengan `kind`, dan UI yang memutuskan (S-07 Error, S-19, S-20).
 * - Teks user hanya dikirim lewat `analyzeText()`, dan selalu dimasking dulu
 *   di sini (K12). Jangan mencatat teks ke console/log.
 * - Request lain hanya berisi ID.
 */
import { maskText } from "@/lib/ml/contract";
import {
  ANALYZE_TEXT_MAX_LENGTH,
  type AnalyzeRequest,
  type AnalyzeResponse,
  type Answer,
  type Category,
  type CategoryId,
  type ErrorCode,
  type ErrorResponse,
  type Health,
  type ReflectRequest,
  type ReflectResponse,
  type ScenarioDetail,
  type ScenarioSummary,
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
  | "timeout" // lewat REQUEST_TIMEOUT_MS → S-07 Error
  | "rate_limited" // 429 → S-20
  | "server" // 5xx atau respons rusak → S-18 / mode terbatas
  | "validation" // 400 (dan 4xx lain) → bug di frontend atau input tidak valid
  | "not_found"; // 404

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

async function request<T>(method: "GET" | "POST", path: string, body: unknown, opts: RequestOptions = {}): Promise<T> {
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

    try {
      return (await res.json()) as T;
    } catch (err) {
      if (timedOut) throw new ApiError("timeout", `Tidak ada jawaban dalam ${opts.timeoutMs ?? REQUEST_TIMEOUT_MS} ms`);
      if (external?.aborted) throw err;
      throw new ApiError("server", "Respons server tidak valid", { status: res.status });
    }
  } finally {
    clearTimeout(timer);
    external?.removeEventListener("abort", forwardAbort);
  }
}

// ---------- Endpoint ----------

/** GET /api/v1/health */
export function getHealth(opts?: RequestOptions): Promise<Health> {
  return request<Health>("GET", "/api/v1/health", undefined, opts);
}

/** GET /api/v1/lite/categories — CategoryChip S-03. */
export function listCategories(opts?: RequestOptions): Promise<Category[]> {
  return request<Category[]>("GET", "/api/v1/lite/categories", undefined, opts);
}

/** GET /api/v1/lite/tactics — katalog TacticBadge + kartu "Yang mungkin belum kepikiran". */
export function listTactics(opts?: RequestOptions): Promise<Tactic[]> {
  return request<Tactic[]>("GET", "/api/v1/lite/tactics", undefined, opts);
}

/** GET /api/v1/lite/scenarios — ringkasan skenario ("Contoh fiktif", pilih skenario per kategori). */
export function listScenarios(category?: CategoryId, opts?: RequestOptions): Promise<ScenarioSummary[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return request<ScenarioSummary[]>("GET", `/api/v1/lite/scenarios${query}`, undefined, opts);
}

/** GET /api/v1/lite/scenarios/{id} — 3 pertanyaan Mode Pelaku (S-04–06). */
export function getScenario(id: string, opts?: RequestOptions): Promise<ScenarioDetail> {
  return request<ScenarioDetail>("GET", `/api/v1/lite/scenarios/${encodeURIComponent(id)}`, undefined, opts);
}

/**
 * POST /api/v1/lite/analyze — satu-satunya request berisi teks user (K12).
 *
 * Teks SELALU dimasking di sini (nomor HP, email, rekening, URL) sebelum
 * dikirim, jadi teks mentah tidak pernah keluar dari browser. Hitungan untuk
 * chip "N data disamarkan" ambil dari `maskText()` di UI, bukan dari respons.
 */
export function analyzeText(text: string, opts?: RequestOptions): Promise<AnalyzeResponse> {
  const { masked } = maskText(text);
  const trimmed = masked.trim();
  if (trimmed.length === 0 || trimmed.length > ANALYZE_TEXT_MAX_LENGTH) {
    return Promise.reject(
      new ApiError("validation", `Teks harus 1–${ANALYZE_TEXT_MAX_LENGTH} karakter`, { code: "VALIDATION_ERROR", field: "text" })
    );
  }
  const body: AnalyzeRequest = { text: trimmed };
  return request<AnalyzeResponse>("POST", "/api/v1/lite/analyze", body, opts);
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
  return request<ReflectResponse>("POST", "/api/v1/lite/reflect", body, opts);
}
