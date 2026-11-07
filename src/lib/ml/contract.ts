/**
 * Kontrak modul analisis teks yang berjalan DI BROWSER (bukan API server).
 *
 * Dipakai di S-03 saat user menempel/menceritakan situasi. Teks tidak pernah
 * meninggalkan perangkat; yang dikirim ke server hanya `scenarioId` hasil analisis.
 *
 * Implementasi: src/lib/ml/analyze.ts (Naive Bayes, bobot dari model.json).
 * Tim frontend boleh memakai `mockAnalyzeText` di bawah sampai model siap.
 */
import type { CategoryId, TacticId } from "@/types/api-v1";

export interface MaskResult {
  /** Teks setelah nomor HP, email, rekening, dan URL diganti token. */
  masked: string;
  /** Untuk chip "N data disamarkan". */
  maskedCount: number;
}

export interface DetectedTactic {
  id: TacticId;
  /** 0–1, hanya untuk mengurutkan; jangan ditampilkan sebagai skor. */
  score: number;
  /** Kata dari teks user yang paling berpengaruh (untuk penjelasan, opsional ditampilkan). */
  topTokens: string[];
}

export interface AnalyzeResult extends MaskResult {
  /** true → tampilkan state error TextArea "Tambahkan sedikit lagi…" dan nonaktifkan Lanjut. */
  tooShort: boolean;
  category: { id: CategoryId; confidence: number };
  /** Skenario yang dipakai untuk S-04–06. Fallback: "generic_emergency". */
  scenarioId: string;
  /** Kosong jika tidak ada taktik yang yakin; jangan mengarang kartu "missed" dari sini. */
  tactics: DetectedTactic[];
}

/** Batas minimal kata sebelum teks dianalisis. */
export const MIN_WORDS = 5;

export type AnalyzeText = (raw: string) => AnalyzeResult;

/** Masking sederhana; dipakai juga oleh implementasi final. */
export function maskText(raw: string): MaskResult {
  let count = 0;
  const rules: [RegExp, string][] = [
    [/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, "<EMAIL>"],
    [/\bhttps?:\/\/\S+|\bwww\.\S+/gi, "<URL>"],
    [/(\+62|62|0)8[\d\s-]{7,13}\d/g, "<NOMOR>"],
    [/\b\d{8,16}\b/g, "<REKENING>"],
  ];
  let masked = raw;
  for (const [re, token] of rules) {
    masked = masked.replace(re, () => {
      count++;
      return token;
    });
  }
  return { masked, maskedCount: count };
}

/** Mock untuk tim frontend sebelum model selesai dilatih. */
export const mockAnalyzeText: AnalyzeText = (raw) => {
  const m = maskText(raw);
  const words = m.masked.trim().split(/\s+/).filter(Boolean).length;
  const lower = m.masked.toLowerCase();
  const tactics: DetectedTactic[] = [];
  if (/hari ini|segera|kuota|terbatas|sekarang/.test(lower))
    tactics.push({ id: "urgency", score: 0.8, topTokens: ["hari ini"] });
  if (/biaya|transfer|deposit|seragam|bayar/.test(lower))
    tactics.push({ id: "upfront_fee", score: 0.85, topTokens: ["biaya"] });
  const isJob = /kerja|lowongan|loker|admin|gaji/.test(lower);
  return {
    ...m,
    tooShort: words < MIN_WORDS,
    category: isJob
      ? { id: "tawaran_kerja", confidence: 0.9 }
      : { id: "lainnya", confidence: 0.4 },
    scenarioId: isJob ? "wfh_admin_fee" : "generic_emergency",
    tactics,
  };
};
