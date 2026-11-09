/**
 * Tipe kontrak API v1 Anti Trap Order.
 * Sumber kebenaran: docs/openapi.yaml — jika berbeda, ikuti openapi.yaml lalu perbarui file ini.
 *
 * Prinsip privasi: tidak ada teks tulisan user di request mana pun, KECUALI
 * `AnalyzeRequest` (teks S-03 yang sudah dimasking di browser, K12).
 */

// ---------- Umum ----------

export interface Health {
  status: "ok";
  version: string;
  content_version: string;
  time: string; // ISO 8601
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string; // siap tampil
    field?: string;
    retry_after?: number; // detik, untuk S-20
  };
}

// ---------- Lite ----------

export type CategoryId =
  | "tawaran_kerja"
  | "giveaway"
  | "akun_menyamar"
  | "pinjaman_investasi"
  | "lainnya";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string; // nama ikon Lucide
}

export type TacticId =
  | "urgency"
  | "upfront_fee"
  | "impersonation"
  | "isolation"
  | "too_good"
  | "credential_request"
  | "link_or_apk"
  | "authority";

export interface TacticRef {
  id: TacticId;
  label: string; // teks TacticBadge
  icon: string;
}

export interface Tactic extends TacticRef {
  explanation: string;
  counter: string; // blok PENANGKAL
}

export interface ScenarioSummary {
  id: string;
  category: CategoryId;
  title: string;
  example_message: string;
  keywords: string[];
  is_fallback: boolean;
}

export interface Option {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  step: 1 | 2 | 3;
  prompt: string;
  min_select: 1;
  max_select: 2;
  allow_other: boolean;
  other_max_length: 80;
  options: Option[]; // selalu 5
}

export interface ScenarioDetail {
  id: string;
  category: CategoryId;
  title: string;
  example_message: string;
  questions: [Question, Question, Question];
}

export interface Answer {
  question_id: string;
  /** 1–2 ID opsi. Boleh 0 hanya jika other_filled = true. */
  option_ids: string[];
  /** true jika user mengisi "Lainnya". Isi teksnya TIDAK dikirim. */
  other_filled?: boolean;
}

// ---------- Lite: analisis teks S-03 (K12) ----------

/** Teks S-03 yang SUDAH dimasking di browser (maskText). Satu-satunya request berisi teks user. */
export interface AnalyzeRequest {
  text: string; // 1–2000 karakter
}

export interface DetectedTactic {
  id: TacticId;
  /** 0–1, hanya untuk mengurutkan; jangan ditampilkan. */
  score: number;
  /** Maks. 3 token paling berpengaruh. */
  top_tokens: string[];
}

export interface AnalyzeResponse {
  /** Teks setelah masking ulang di server. */
  masked: string;
  /** Hitungan masking lapisan kedua di server; chip "N data disamarkan" memakai hitungan maskText() di browser. */
  masked_count: number;
  /** true → state Error TextArea "Tambahkan sedikit lagi…". */
  too_short: boolean;
  /** `confidence` hanya untuk logika; jangan ditampilkan. */
  category: { id: CategoryId; confidence: number };
  /** Skenario untuk S-04–06; fallback generic_emergency. */
  scenario_id: string;
  tactics: DetectedTactic[];
  model_version: string;
  disclaimer: string;
}

export const ANALYZE_TEXT_MAX_LENGTH = 2000;

export interface ReflectRequest {
  scenario_id: string;
  answers: [Answer, Answer, Answer];
}

export interface GapCard {
  flaw_id: string;
  kind: "found" | "missed";
  tactic: TacticRef;
  user_quote: string | null; // "Kamu menyebut: '…'"
  explanation: string;
  counter: string;
  severity: 1 | 2 | 3; // hanya untuk urutan, jangan ditampilkan
}

export interface ReportChannel {
  name: string;
  status: "placeholder" | "verified";
  url?: string | null;
  note: string;
}

export interface ActionCard {
  category_label: string;
  checklist: { id: string; text: string }[];
  warnings: { santai: string; tegas: string };
  report_channels: ReportChannel[];
}

export interface ReflectResponse {
  scenario_id: string;
  category: Category;
  found_count: number;
  found: GapCard[];
  /** Minimal 1 item. Frontend memilih maks. 2 untuk ditampilkan. */
  missed_candidates: GapCard[];
  why_it_works: string;
  action_card: ActionCard;
  disclaimer: string;
}

// ---------- Soul ----------

export type AvatarId = "1-lingkar" | "2-tumpuk" | "3-segitiga" | "4-kotak";

export interface CharacterTemplate {
  id: string;
  default_name: string;
  relation_id: string;
  avatar: AvatarId;
  arc_id: string;
}

export interface Relation {
  id: string;
  label: string;
  arc_id: string;
}

export interface CharacterOptions {
  templates: CharacterTemplate[];
  relations: Relation[];
  nickname_max_length: 20;
}

/** Nilai 0–100; UI menampilkan 5 segmen (20 poin per segmen). */
export interface Meters {
  kepercayaan: number;
  kewaspadaan: number;
  keamanan: number;
}

export type MeterDeltas = Meters; // nilai bisa negatif

export type ChoiceId = "A" | "B" | "C";

export interface Mission {
  id: string;
  index: 1 | 2 | 3;
  /** Berisi {{nama}} dan {{relasi}}; ganti di frontend dengan fillStory(). */
  story: string;
  choices: { id: ChoiceId; label: string }[];
}

export interface SoulStartRequest {
  arc_id: string;
}

export interface SoulStartResponse {
  arc_id: string;
  total_missions: 3;
  meters: Meters;
  mission: Mission;
}

export interface SoulStepRequest {
  arc_id: string;
  mission_id: string;
  choice_id: ChoiceId;
  meters: Meters;
}

export interface Consequence {
  kind: "positif" | "negatif" | "campuran";
  what_happened: string; // boleh berisi {{nama}}
  why: string;
}

export interface SoulSummary {
  rank_id: "pemula_waspada" | "penjaga_siaga" | "penjaga_teguh";
  rank_label: string;
  description: string;
  insights: string[];
  final_meters: Meters;
}

export interface SoulStepResponse {
  mission_index: 1 | 2 | 3;
  choice_id: ChoiceId;
  consequence: Consequence;
  deltas: MeterDeltas;
  meters: Meters;
  next_mission: Mission | null;
  summary: SoulSummary | null; // terisi jika next_mission null
}

/** Ganti placeholder narasi Soul di sisi frontend (nama tidak pernah dikirim ke server). */
export function fillStory(text: string, nama: string, relasi: string): string {
  return text.replaceAll("{{nama}}", nama).replaceAll("{{relasi}}", relasi.toLowerCase());
}
