import { Clock } from "lucide-react";
import { BUTTON_GRADIENTS, Button } from "@/components/ui/Button";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { StatusIcon } from "@/components/lite/LiteShell";
import { errorCopy } from "@/content/errors";
import { cn } from "@/lib/utils";

/** Gradien tombol S-17/S-18. */
const GRADIENTS = {
  /** S-17 "Kembali ke Awal", S-18 "Coba Lagi" (kode ekspor 06, cocok dengan render). */
  aqua: "linear-gradient(to bottom, #6fe6f8 0%, #ffffff 100%)",
  /**
   * S-18 "Beranda". Ekspor 06: `178.5deg, #FFDA37 14.459% → putih 116.88%`,
   * tetapi render-nya lebih pucat; diukur dari piksel = #FFDA37 ±84% → ±24%,
   * sama dengan tombol Soul di kartu Dua Mode S-01.
   */
  home: BUTTON_GRADIENTS.soulMode,
} as const;

/** Latar `bg/0` + "Aero sky" 560px, isi di tengah (sama dengan S-07/S-20). */
function ErrorShell({
  children,
  className,
  role,
  labelledBy,
}: {
  children: React.ReactNode;
  className?: string;
  role?: "alert" | "alertdialog";
  labelledBy?: string;
}) {
  return (
    <div
      role={role}
      aria-modal={role === "alertdialog" ? true : undefined}
      aria-labelledby={labelledBy}
      className={cn("relative flex min-h-screen flex-col items-center justify-center bg-ato-bg-0 px-ato-24", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-ato-sky to-[rgba(95,227,247,0)]"
      />
      <div className="relative flex w-full flex-col items-center gap-ato-24">{children}</div>
    </div>
  );
}

/** "Path A···Ω" S-17 (node 56:8470): Alpha aktif, titik memudar ke Omega. */
function PathAlphaOmega() {
  return (
    <div aria-hidden className="flex items-center gap-ato-8">
      <span
        className="flex size-10 items-center justify-center rounded-ato-full border-[0.5px] border-ato-ink"
        style={{ backgroundImage: "linear-gradient(to bottom, #80e8f8 0%, #ffffff 100%)" }}
      >
        <span className="font-ato-console text-ato-console text-ato-text-1">A</span>
      </span>
      {[8, 8, 8].map((s, i) => (
        <span key={`c${i}`} className="shrink-0 rounded-ato-full bg-[#60EBFF]" style={{ width: s, height: s }} />
      ))}
      {[4, 6, 6].map((s, i) => (
        <span key={`g${i}`} className="shrink-0 rounded-ato-full bg-[#B5C2D1]" style={{ width: s, height: s }} />
      ))}
      <span className="flex size-10 items-center justify-center rounded-ato-full border border-ato-border-strong bg-ato-bg-2">
        <span className="font-ato-console text-ato-console text-ato-text-3">Ω</span>
      </span>
    </div>
  );
}

/** S-17 Not found — Figma 06 node 56:8468. */
export function NotFoundScreen() {
  const copy = errorCopy.notFound;
  return (
    <ErrorShell>
      <PathAlphaOmega />
      <ConsoleLabel as="span" tone="text-3">
        {copy.code}
      </ConsoleLabel>
      <h1 className="w-full text-center font-ato-ui text-ato-m-h2 text-ato-text-1">{copy.title}</h1>
      {/* 06: tombol ini tanpa Gloss shadow (beda dengan "Coba Lagi" S-18). */}
      <Button variant="aqua" href="/" gradient={GRADIENTS.aqua} className="shadow-none" labelClassName="text-ato-text-1">
        {copy.home}
      </Button>
    </ErrorShell>
  );
}

const SERVER_TITLE_ID = "ato-server-error-title";

type ServerErrorScreenProps = {
  onRetry: () => void;
  /** Dipakai di LiteFlow: tampil menutupi layar alur (fixed overlay). */
  overlay?: boolean;
};

/**
 * S-18 Server error — Figma 06 node 56:8489. Dipakai oleh error.tsx,
 * global-error.tsx, dan LiteFlow (5xx/4xx/data rusak dari API v1).
 */
export function ServerErrorScreen({ onRetry, overlay = false }: ServerErrorScreenProps) {
  const copy = errorCopy.server;
  return (
    <ErrorShell
      role={overlay ? "alertdialog" : "alert"}
      labelledBy={overlay ? SERVER_TITLE_ID : undefined}
      className={overlay ? "fixed inset-0 z-50 min-h-0 overflow-y-auto" : undefined}
    >
      <StatusIcon>
        <Clock size={40} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-text-2)" />
      </StatusIcon>
      <ConsoleLabel as="span" tone="text-3">
        {copy.code}
      </ConsoleLabel>
      <h1 id={SERVER_TITLE_ID} className="w-full text-center font-ato-ui text-ato-m-h2 text-ato-text-1">
        {copy.title}
      </h1>
      <div className="flex w-full flex-col gap-ato-12">
        <Button variant="aqua" gradient={GRADIENTS.aqua} labelClassName="text-ato-text-1" onClick={onRetry} autoFocus={overlay}>
          {copy.retry}
        </Button>
        {/* <a> biasa (bukan Link): dari error boundary, muat ulang penuh lebih aman. */}
        <a
          href="/"
          className="relative flex h-[52px] w-full items-center justify-center overflow-hidden rounded-ato-md border-[0.5px] border-ato-ink px-ato-24 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent"
          style={{ backgroundImage: GRADIENTS.home }}
        >
          <span className="text-center font-ato-ui text-ato-button text-[#191919]">{copy.home}</span>
        </a>
      </div>
    </ErrorShell>
  );
}
