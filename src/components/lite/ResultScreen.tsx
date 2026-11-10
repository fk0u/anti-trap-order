import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { Button, FLOW_GRADIENTS } from "@/components/ui/Button";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { GapCard } from "@/components/ui/GapCard";
import { FlowTop, LiteScreen } from "@/components/lite/LiteShell";
import { liteCopy } from "@/content/lite";
import type { GapCard as GapCardData, ReflectResponse } from "@/types/api-v1";

const copy = liteCopy.result;

type ResultScreenProps = {
  result: ReflectResponse;
  /** Maks. 2 kartu "missed" yang sudah dipilih (lihat pickMissed). */
  missed: GapCardData[];
  onNext: () => void;
};

/** S-08 Hasil Celah — Figma 06 node 56:7287. */
export function ResultScreen({ result, missed, onNext }: ResultScreenProps) {
  return (
    <LiteScreen>
      <div className="relative flex w-full flex-1 flex-col gap-ato-20 px-ato-16 pb-ato-24 pt-ato-16">
        <FlowTop back={{ label: liteCopy.header.home, href: "/" }} progress={liteCopy.progress.result} step={4} />

        <div className="flex w-full flex-col gap-ato-8">
          <ConsoleLabel>{copy.label}</ConsoleLabel>
          <h1 className="ato-text-outline w-full font-ato-ui text-ato-m-h1 text-white">{copy.title(result.found_count)}</h1>
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
        <div className="relative w-full overflow-hidden rounded-ato-lg border border-ato-lite-accent bg-ato-bg-1 p-ato-20 shadow-ato-glass backdrop-blur-[12px]">
          <p className="font-ato-ui text-ato-m-body text-ato-text-1">{result.why_it_works}</p>
        </div>

        <DisclaimerBanner>{liteCopy.disclaimer}</DisclaimerBanner>
      </div>

      <BottomActionBar glow="#95ebf8">
        <Button variant="aqua" gradient={FLOW_GRADIENTS.result} className="min-w-px flex-1" onClick={onNext}>
          {copy.next}
        </Button>
      </BottomActionBar>
    </LiteScreen>
  );
}
