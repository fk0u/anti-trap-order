"use client";

import { atoFontVariables } from "@/app/fonts";
import { ServerErrorScreen } from "@/components/errors/ErrorScreens";
import { cn } from "@/lib/utils";

/**
 * S-18 untuk error saat render di semua halaman — Figma 06 node 56:8489.
 * "Coba Lagi" = reset() (render ulang segmen). Error tidak dicatat ke
 * console di sini supaya tidak ada isi state (mis. teks S-03) yang ikut terlog.
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={cn(atoFontVariables, "min-h-screen bg-ato-bg-0 font-ato-ui text-ato-text-1")}>
      <ServerErrorScreen onRetry={reset} />
    </div>
  );
}
