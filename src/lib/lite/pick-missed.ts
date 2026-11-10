import type { DetectedTactic, GapCard } from "@/types/api-v1";

/** Maksimal kartu "Yang mungkin belum kepikiran" di S-08. */
export const MAX_MISSED_CARDS = 2;

/**
 * Pilih kartu "missed" untuk S-08 (K6): kandidat yang taktiknya terdeteksi
 * model ML (`/analyze`) didahulukan — urut skor tertinggi — lalu sisanya
 * mengikuti urutan server (severity tertinggi dulu).
 */
export function pickMissed(
  candidates: readonly GapCard[],
  detected: readonly DetectedTactic[],
  max: number = MAX_MISSED_CARDS
): GapCard[] {
  const rank = new Map([...detected].sort((a, b) => b.score - a.score).map((t, i) => [t.id, i]));
  return candidates
    .map((card, index) => ({ card, index, r: rank.get(card.tactic.id) ?? Number.POSITIVE_INFINITY }))
    .sort((a, b) => a.r - b.r || a.index - b.index)
    .slice(0, max)
    .map((x) => x.card);
}
