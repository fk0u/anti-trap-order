/**
 * Aturan frontend A20 Soul. Nama panggilan tidak pernah dikirim ke server,
 * tetapi tetap disaring supaya user tidak memasukkan data pribadi.
 */
import { maskText } from "@/lib/ml/contract";
import type { Meters } from "@/types/api-v1";

/** Batas dari kontrak (`nickname_max_length: 20`); dipakai jika API memberi nilai lain yang tidak masuk akal. */
export const NICKNAME_MAX_LENGTH = 20;

export type NicknameCheck =
  | { ok: true; value: string }
  | { ok: false; reason: "empty" | "too_long" | "contact" };

/**
 * Validasi nama panggilan S-10 (keputusan Syafar, 10 Nov 2026):
 * - kosong setelah trim → "empty" (tombol nonaktif, tanpa pesan);
 * - lebih dari `max` karakter → "too_long";
 * - mengandung angka APA PUN → "contact" (nomor HP/rekening/umur tidak boleh);
 * - email/URL tertangkap `maskText()` → "contact".
 * Pesan untuk "contact" diambil dari Figma S-10: "Pakai nama panggilan saja ya, tanpa nomor atau email."
 */
export function checkNickname(raw: string, max: number = NICKNAME_MAX_LENGTH): NicknameCheck {
  const value = raw.trim().replace(/\s+/g, " ");
  if (value.length === 0) return { ok: false, reason: "empty" };
  if (value.length > max) return { ok: false, reason: "too_long" };
  if (/\d/.test(value)) return { ok: false, reason: "contact" };
  if (maskText(value).maskedCount > 0) return { ok: false, reason: "contact" };
  return { ok: true, value };
}

/** Jumlah segmen meter yang terisi (0–5): round(nilai / 20), dijepit ke 0–5. */
export function meterSegments(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(0, Math.round(value / 20)));
}

export const METER_KEYS = ["kepercayaan", "kewaspadaan", "keamanan"] as const satisfies readonly (keyof Meters)[];
