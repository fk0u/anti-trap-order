import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/BackButton";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { StepperAlphaOmega, type StepperStep } from "@/components/ui/StepperAlphaOmega";

/** Latar layar Lite: `bg/0` + "Aero sky" 560px (node 75:82xx di setiap layar 06). */
export function LiteScreen({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative flex min-h-screen flex-col bg-ato-bg-0", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-ato-sky to-[rgba(95,227,247,0)]"
      />
      {children}
    </div>
  );
}

type FlowTopProps = {
  back: { label: string; href: string } | { label: string; onClick: () => void };
  progress: string;
  /** Tanpa stepper (mis. S-09). */
  step?: StepperStep;
};

/** Baris atas alur: BackButton + label progres konsol, lalu stepper A→Ω. */
export function FlowTop({ back, progress, step }: FlowTopProps) {
  return (
    <>
      <div className="flex w-full items-center justify-between">
        {"href" in back ? <BackButton label={back.label} href={back.href} /> : <BackButton label={back.label} onClick={back.onClick} />}
        <ConsoleLabel as="span" className="whitespace-nowrap">
          {progress}
        </ConsoleLabel>
      </div>
      {step !== undefined && <StepperAlphaOmega variant="flow" step={step} />}
    </>
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
