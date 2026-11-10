import type { Metadata } from "next";
import { atoFontVariables } from "@/app/fonts";
import { NotFoundScreen } from "@/components/errors/ErrorScreens";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
};

/** S-17 — Figma 06 node 56:8468. */
export default function NotFound() {
  return (
    <div className={cn(atoFontVariables, "min-h-screen bg-ato-bg-0 font-ato-ui text-ato-text-1")}>
      <NotFoundScreen />
    </div>
  );
}
