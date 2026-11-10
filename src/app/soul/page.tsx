import type { Metadata } from "next";
import { atoFontVariables } from "@/app/fonts";
import { SoulFlow } from "@/components/soul/SoulFlow";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "A20 Soul",
};

/**
 * A20 Soul (S-10 → S-14) — Figma "06 | Prototype". Mobile dulu; desktop belum.
 * Halaman lama diganti total (tersimpan di riwayat git).
 */
export default function SoulPage() {
  return (
    <div className={cn(atoFontVariables, "min-h-screen bg-ato-bg-0 font-ato-ui text-ato-text-1")}>
      <SoulFlow />
    </div>
  );
}
