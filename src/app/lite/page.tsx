import type { Metadata } from "next";
import { atoFontVariables } from "@/app/fonts";
import { LiteFlow } from "@/components/lite/LiteFlow";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "A20 Lite",
};

/**
 * A20 Lite (S-03 → S-09) — Figma "06 | Prototype". Mobile dulu; desktop belum.
 * Halaman lama diganti total (tersimpan di riwayat git).
 */
export default function LitePage() {
  return (
    <div className={cn(atoFontVariables, "min-h-screen bg-ato-bg-0 font-ato-ui text-ato-text-1")}>
      <LiteFlow />
    </div>
  );
}
