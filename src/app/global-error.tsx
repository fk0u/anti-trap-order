"use client";

import "./globals.css";
import { atoFontVariables } from "@/app/fonts";
import { ServerErrorScreen } from "@/components/errors/ErrorScreens";
import { cn } from "@/lib/utils";

/**
 * S-18 jika layout root sendiri gagal — Figma 06 node 56:8489.
 * Menggantikan layout root, jadi wajib punya <html>/<body> sendiri.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body className={cn(atoFontVariables, "min-h-screen bg-ato-bg-0 font-ato-ui text-ato-text-1 antialiased")}>
        <ServerErrorScreen onRetry={reset} />
      </body>
    </html>
  );
}
