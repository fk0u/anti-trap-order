import { BUTTON_GRADIENTS, Button } from "@/components/ui/Button";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { landingS01 } from "@/content/landing-s01";
import { cn } from "@/lib/utils";

const { modes } = landingS01;

const cardClass =
  "relative flex w-full flex-col gap-ato-12 overflow-hidden rounded-ato-lg border p-ato-20 shadow-ato-glass backdrop-blur-[12px] " +
  // Desktop (node "Mode Lite" / "Mode Soul"): berdampingan, p32, gap 16.
  "lg:min-w-px lg:flex-1 lg:gap-ato-16 lg:p-ato-32";

/** S-01 "Dua mode" — Figma 06 node 56:6768. */
export function ModesSection() {
  return (
    <section aria-labelledby="landing-modes" className="flex w-full flex-col gap-ato-12 lg:gap-ato-24">
      <ConsoleLabel as="h2" id="landing-modes">
        {modes.label}
      </ConsoleLabel>
      <div className="contents lg:flex lg:w-full lg:items-start lg:gap-ato-24">

      <div className={cn(cardClass, "border-ato-lite-accent bg-white")}>
        <ConsoleLabel as="h3">{modes.lite.label}</ConsoleLabel>
        <p className="font-ato-ui text-ato-m-body text-ato-text-1 lg:text-ato-d-body-l">{modes.lite.body}</p>
        <Button variant="lite" desktop="lite" href={modes.lite.cta.href} gradient={BUTTON_GRADIENTS.liteMode} className="lg:h-11 lg:self-start lg:px-ato-20">
          {modes.lite.cta.label}
        </Button>
      </div>

      <div className={cn(cardClass, "border-ato-soul-accent bg-ato-soul-surface")}>
        <ConsoleLabel as="h3" tone="soul">
          {modes.soul.label}
        </ConsoleLabel>
        <p className="font-ato-ui text-ato-m-body text-ato-text-1 lg:text-ato-d-body-l">{modes.soul.body}</p>
        <Button variant="soul" desktop="soul" href={modes.soul.cta.href} gradient={BUTTON_GRADIENTS.soulMode} className="lg:h-11 lg:self-start lg:px-ato-20">
          {modes.soul.cta.label}
        </Button>
      </div>
      </div>
    </section>
  );
}
