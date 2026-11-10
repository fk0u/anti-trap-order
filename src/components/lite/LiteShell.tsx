import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/BackButton";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { DesktopHeader } from "@/components/ui/DesktopHeader";
import { StepperAlphaOmega, type StepperStep } from "@/components/ui/StepperAlphaOmega";
import { StepperVertical } from "@/components/ui/StepperVertical";
import { liteCopy } from "@/content/lite";
import { DESKTOP_CONTAINER } from "@/lib/layout";

/**
 * Latar layar Lite: `bg/0` + "Aero sky" 560px (node 75:82xx di setiap layar 06).
 *
 * Desktop (lg, frame BROWSER 06): header desktop + container 1120px berisi grid
 * (`desktopGrid`, mis. panel 340 | konten). Pembungkus grid memakai
 * `display: contents` di bawah lg, jadi susunan mobile tidak berubah.
 */
export function LiteScreen({
  children,
  className,
  desktopGrid,
}: {
  children: React.ReactNode;
  className?: string;
  desktopGrid?: string;
}) {
  return (
    <div className={cn("relative flex min-h-screen flex-col bg-ato-bg-0", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-ato-sky to-[rgba(95,227,247,0)] lg:h-[640px]"
      />
      <DesktopHeader active="lite" cta="lite" />
      <div className={cn("contents", DESKTOP_CONTAINER, "lg:relative lg:grid lg:items-start lg:gap-x-ato-56 lg:pb-ato-80 lg:pt-ato-56", desktopGrid)}>
        {children}
      </div>
    </div>
  );
}

/** Grid desktop Lite: panel konteks 340 | konten (S-03–S-07). Aksi di baris kedua kolom konten. */
export const LITE_PANEL_GRID = "lg:grid-cols-[340px_minmax(0,1fr)] lg:grid-rows-[auto_1fr]";

/**
 * Panel konteks kiri desktop (node 56:8719 / 56:8967): kaca putih, p24, gap 20.
 * Di bawah lg `display: contents` — isinya tetap berurutan di kolom mobile.
 */
export function LitePanel({ children }: { children: React.ReactNode }) {
  return (
    <aside
      className={cn(
        "contents",
        "lg:relative lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col lg:gap-ato-20 lg:overflow-hidden lg:rounded-ato-lg lg:border lg:border-ato-border-subtle lg:bg-ato-bg-1 lg:p-ato-24 lg:shadow-ato-glass lg:backdrop-blur-[12px]"
      )}
    >
      {children}
    </aside>
  );
}

/** Kolom konten desktop (kanan). Di bawah lg `display: contents`. */
export function LiteMain({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("contents lg:col-start-2 lg:row-start-1 lg:flex lg:min-w-px lg:flex-col", className)}>{children}</div>;
}

/** Kelas BottomActionBar di grid panel: baris kedua kolom konten, jarak 24 dari isi. */
export const LITE_ACTIONS = "lg:col-start-2 lg:row-start-2 lg:mt-ato-24";

type FlowTopProps = {
  back: { label: string; href: string } | { label: string; onClick: () => void };
  progress: string;
  /** Tanpa stepper (mis. S-09). */
  step?: StepperStep;
  /** Langkah stepper vertikal di panel desktop (0 = Situasi … 4 = Hasil). */
  desktopStep?: number;
  /** true = baris kembali + progres disembunyikan di desktop (S-08 desktop tidak memakainya). */
  hideOnDesktop?: boolean;
};

/**
 * Baris atas alur: BackButton + label progres konsol, lalu stepper A→Ω.
 * Desktop: kembali dan progres bertumpuk (panel), stepper vertikal.
 */
export function FlowTop({ back, progress, step, desktopStep, hideOnDesktop = false }: FlowTopProps) {
  return (
    <>
      <div className={cn("flex w-full items-center justify-between", "lg:flex-col lg:items-start lg:gap-ato-20", hideOnDesktop && "lg:hidden")}>
        {"href" in back ? <BackButton label={back.label} href={back.href} /> : <BackButton label={back.label} onClick={back.onClick} />}
        <ConsoleLabel as="span" className="whitespace-nowrap">
          {progress}
        </ConsoleLabel>
      </div>
      {step !== undefined && <StepperAlphaOmega variant="flow" step={step} className="lg:hidden" />}
      {desktopStep !== undefined && <StepperVertical steps={liteCopy.desktop.steps} current={desktopStep} className="hidden lg:flex" />}
    </>
  );
}

/** Stepper A→Ω S-08 desktop (node 56:9234): semua langkah tercapai, warna aksen Lite. */
export function StepperDesktopComplete() {
  const node = "size-3 shrink-0 rounded-ato-full bg-ato-lite-accent";
  const line = "h-[2px] min-w-px flex-1 bg-ato-lite-accent";
  const cap = "flex size-7 shrink-0 items-center justify-center rounded-ato-full bg-ato-lite-accent font-ato-console text-ato-console uppercase text-white";
  return (
    <div aria-hidden className="hidden h-7 w-full items-center lg:flex">
      <span className={cap}>A</span>
      <span className={line} />
      <span className={node} />
      <span className={line} />
      <span className={node} />
      <span className={line} />
      <span className={node} />
      <span className={line} />
      <span className={cn(cap, "shadow-ato-gloss")}>Ω</span>
    </div>
  );
}

/** Lingkaran ikon kaca 88px (S-07 Error, S-20) atau 72px `bg/2` (S-19). */
export function StatusIcon({ children, size = 88 }: { children: React.ReactNode; size?: 88 | 72 }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-ato-full",
        size === 88
          ? "size-[88px] border border-ato-border-subtle bg-ato-bg-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_12px_32px_-8px_rgba(13,23,33,0.08)] backdrop-blur-[12px]"
          : "size-[72px] bg-ato-bg-2"
      )}
    >
      {children}
    </span>
  );
}
