import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { Button, FLOW_GRADIENTS } from "@/components/ui/Button";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { GapCard } from "@/components/ui/GapCard";
import { FlowTop, LiteScreen, StepperDesktopComplete } from "@/components/lite/LiteShell";
import { liteCopy } from "@/content/lite";
import { TABLET_COLUMN } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { GapCard as GapCardData, ReflectResponse } from "@/types/api-v1";

const copy = liteCopy.result;

type ResultScreenProps = {
  result: ReflectResponse;
  /** Maks. 2 kartu "missed" yang sudah dipilih (lihat pickMissed). */
  missed: GapCardData[];
  onNext: () => void;
};

/**
 * S-08 Hasil Celah — Figma 06 node 56:7287.
 * Desktop (node 56:9226): hasil 724 | kartu kanan 340 "Langkah berikutnya" (menempel saat
 * digulir). Tombol Action Card di desktop ada di kartu kanan; BottomActionBar disembunyikan.
 */
export function ResultScreen({ result, missed, onNext }: ResultScreenProps) {
  return (
    <LiteScreen desktopGrid="lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className={cn("relative flex w-full flex-1 flex-col gap-ato-20 px-ato-16 pb-ato-24 pt-ato-16", TABLET_COLUMN, "lg:min-w-px lg:gap-ato-24 lg:p-0")}>
        <FlowTop back={{ label: liteCopy.header.home, href: "/" }} progress={liteCopy.progress.result} step={4} hideOnDesktop />
        <StepperDesktopComplete />

        <div className="flex w-full flex-col gap-ato-8">
          <ConsoleLabel>{copy.label}</ConsoleLabel>
          <h1 className="ato-text-outline w-full font-ato-ui text-ato-m-h1 text-white lg:text-ato-d-h1 lg:text-ato-text-1 lg:[--ato-outline-width:0px]">
            {copy.title(result.found_count)}
          </h1>
        </div>

        {result.found.length > 0 && (
          <>
            <ConsoleLabel as="h2" tone="text-3">
              {copy.foundLabel}
            </ConsoleLabel>
            {result.found.map((gap) => (
              <GapCard
                key={gap.flaw_id}
                kind="found"
                tactic={gap.tactic}
                note={gap.user_quote ? copy.quote(gap.user_quote) : ""}
                explanation={gap.explanation}
                counterLabel={copy.counterLabel}
                counter={gap.counter}
              />
            ))}
          </>
        )}

        {missed.length > 0 && (
          <>
            <ConsoleLabel as="h2" tone="text-3">
              {copy.missedLabel}
            </ConsoleLabel>
            {missed.map((gap) => (
              <GapCard
                key={gap.flaw_id}
                kind="missed"
                tactic={gap.tactic}
                note={copy.missedNote}
                explanation={gap.explanation}
                counterLabel={copy.counterLabel}
                counter={gap.counter}
              />
            ))}
          </>
        )}

        <ConsoleLabel as="h2" tone="text-3">
          {copy.whyLabel}
        </ConsoleLabel>
        <div className="relative w-full overflow-hidden rounded-ato-lg border border-ato-lite-accent bg-ato-bg-1 p-ato-20 shadow-ato-glass backdrop-blur-[12px] lg:p-ato-24">
          <p className="font-ato-ui text-ato-m-body text-ato-text-1 lg:text-ato-d-body-l">{result.why_it_works}</p>
        </div>

        <DisclaimerBanner className="lg:hidden">{liteCopy.disclaimer}</DisclaimerBanner>
      </div>

      {/* Kartu kanan desktop "Sticky rail" (node 56:9246). */}
      <aside className="sticky top-ato-24 hidden flex-col gap-ato-16 overflow-hidden rounded-ato-lg border border-ato-lite-accent bg-ato-bg-1 p-ato-24 shadow-ato-glass backdrop-blur-[12px] lg:flex">
        <ConsoleLabel as="h2">{liteCopy.desktop.nextLabel}</ConsoleLabel>
        <p className="font-ato-ui text-ato-d-body text-ato-text-1">{liteCopy.desktop.nextBody}</p>
        <Button variant="aqua" desktop="lite" className="lg:w-full" onClick={onNext}>
          {copy.next}
        </Button>
        <DisclaimerBanner>{liteCopy.disclaimer}</DisclaimerBanner>
        <p className="font-ato-ui text-ato-caption text-ato-text-3">{liteCopy.action.disclaimer}</p>
      </aside>

      <BottomActionBar glow="#95ebf8" className="lg:hidden">
        <Button variant="aqua" gradient={FLOW_GRADIENTS.result} className="min-w-px flex-1" onClick={onNext}>
          {copy.next}
        </Button>
      </BottomActionBar>
    </LiteScreen>
  );
}
