"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { StepperAlphaOmega } from "@/components/ui/StepperAlphaOmega";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { StepperVertical } from "@/components/ui/StepperVertical";
import { LITE_PANEL_GRID, LiteScreen, StatusIcon } from "@/components/lite/LiteShell";
import { OfflineActions } from "@/components/lite/OfflineActions";
import { liteCopy } from "@/content/lite";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

export type LoadingState = "waiting" | "slow" | "error";

// ---------- Animasi S-07 (keputusan desain mandiri, tidak ada di Figma 06) ----------

/** Jeda tiap langkah titik: "" → "." → ".." → "...". */
const DOT_STEP_MS = 400;
/** Tips berganti setiap sekitar 3 detik. */
const TIP_INTERVAL_MS = 3_000;
/** Durasi fade keluar (lalu fade masuk dengan durasi sama). */
const TIP_FADE_MS = 300;

/**
 * Tiga titik di belakang judul. Ruang untuk 3 titik selalu ada (titik yang
 * belum muncul transparan) agar teks rata tengah tidak bergeser. aria-hidden
 * supaya pembaca layar tidak membacanya berulang. Reduced motion: tetap "...".
 */
function AnimatedDots({ reduced }: { reduced: boolean }) {
  const [count, setCount] = useState(3);
  useEffect(() => {
    if (reduced) {
      setCount(3);
      return;
    }
    setCount(0);
    const t = setInterval(() => setCount((c) => (c + 1) % 4), DOT_STEP_MS);
    return () => clearInterval(t);
  }, [reduced]);
  return (
    <span aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < count ? "opacity-100" : "opacity-0"}>
          .
        </span>
      ))}
    </span>
  );
}

/**
 * Tips bergantian dengan fade keluar lalu masuk. Semua tips ditumpuk di sel
 * grid yang sama (yang tidak aktif tak terlihat) sehingga tinggi area = tips
 * terpanjang dan layout tidak lompat. aria-live="off" supaya tidak dibacakan
 * setiap kali berganti. Reduced motion: berganti tanpa fade.
 */
function RotatingTips({ tips, reduced }: { tips: readonly string[]; reduced: boolean }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (tips.length < 2) return;
    let fade: ReturnType<typeof setTimeout> | undefined;
    const t = setInterval(() => {
      if (reduced) {
        setIndex((i) => (i + 1) % tips.length);
        return;
      }
      setShown(false);
      fade = setTimeout(() => {
        setIndex((i) => (i + 1) % tips.length);
        setShown(true);
      }, TIP_FADE_MS);
    }, TIP_INTERVAL_MS);
    return () => {
      clearInterval(t);
      clearTimeout(fade);
    };
  }, [tips.length, reduced]);

  return (
    <div aria-live="off" className="grid w-full">
      {tips.map((tip, i) => {
        const active = i === index;
        return (
          <p
            key={tip}
            aria-hidden={!active || undefined}
            className={cn(
              "w-full text-center font-ato-ui text-ato-m-body text-ato-text-2 [grid-area:1/1]",
              active ? (shown ? "opacity-100" : "opacity-0") : "invisible opacity-0",
              // Reduced motion: transition-none, karena aturan global di globals.css
              // (transition-duration 0.01ms + property bawaan `all`) tetap menyisakan 1 frame fade.
              reduced ? "transition-none" : "transition-opacity ease-out"
            )}
            style={reduced ? undefined : { transitionDuration: `${TIP_FADE_MS}ms` }}
          >
            {tip}
          </p>
        );
      })}
    </div>
  );
}

type LoadingScreenProps = {
  state: LoadingState;
  /**
   * Tips bergantian di bawah judul. Item pertama = teks Figma (copy.body),
   * sisanya `explanation` dari GET /lite/tactics — tidak ada kalimat karangan.
   */
  tips: readonly string[];
  onRetry: () => void;
  onLimited?: () => void;
};

/**
 * S-07 Loading — satu tampilan memakai desain Figma 06 "Lambat 3s" (56:8425):
 * judul `text/1` solid, tanpa cahaya bawah. Desain "Default" (56:7268, judul
 * bergradien pudar + cahaya bawah) tidak dipakai — keputusan Syafar, 10 Nov 2026.
 * Chip "Agak lama?" tetap muncul setelah SLOW_HINT_MS. Error: node 56:8446.
 */
export function LoadingScreen({ state, tips, onRetry, onLimited }: LoadingScreenProps) {
  const copy = liteCopy.loading;
  const reduced = useReducedMotion();
  return (
    <LiteScreen
      className="items-center justify-center px-ato-24 lg:items-stretch lg:justify-start lg:px-0"
      desktopGrid={LITE_PANEL_GRID}
    >
      {/* Desktop (tanpa frame di 06 — keputusan desain mandiri): panel konteks seperti S-03–S-06, langkah "Hasil". */}
      <aside className="hidden flex-col gap-ato-20 overflow-hidden rounded-ato-lg border border-ato-border-subtle bg-ato-bg-1 p-ato-24 shadow-ato-glass backdrop-blur-[12px] lg:flex">
        <ConsoleLabel as="span">{liteCopy.progress.result}</ConsoleLabel>
        <StepperVertical steps={liteCopy.desktop.steps} current={4} />
        <DisclaimerBanner>{liteCopy.disclaimer}</DisclaimerBanner>
      </aside>
      {state === "error" ? (
        <div role="alert" className="relative flex w-full flex-col items-center gap-ato-24 md:max-lg:max-w-[560px] lg:mx-auto lg:max-w-[480px] lg:pt-ato-40">
          <StatusIcon>
            <WifiOff size={40} strokeWidth={1.75} color="var(--ato-text-2)" />
          </StatusIcon>
          <h1 className="w-full text-center font-ato-ui text-ato-m-h2 text-ato-text-1">{liteCopy.offline.title}</h1>
          <p className="w-full text-center font-ato-ui text-ato-m-body text-ato-text-2">{liteCopy.offline.body}</p>
          <OfflineActions onRetry={onRetry} onLimited={onLimited} />
        </div>
      ) : (
        <div role="status" aria-live="polite" className="relative flex w-full flex-col items-center gap-ato-24 md:max-lg:max-w-[560px] lg:mx-auto lg:max-w-[480px] lg:pt-ato-40">
          <StepperAlphaOmega variant="flow" step={2} className="lg:hidden" />
          <h1 className="w-full text-center font-ato-ui text-ato-m-h2 text-ato-text-1">
            {copy.title}
            <AnimatedDots reduced={reduced} />
          </h1>
          <RotatingTips tips={tips} reduced={reduced} />
          {state === "slow" && (
            <p className="rounded-ato-full border border-ato-border-subtle bg-ato-bg-1 px-ato-16 font-ato-ui text-ato-caption text-ato-text-2 shadow-ato-glass backdrop-blur-[12px]">
              {copy.slow}
            </p>
          )}
        </div>
      )}
    </LiteScreen>
  );
}
