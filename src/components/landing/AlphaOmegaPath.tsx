import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { StepperAlphaOmega } from "@/components/ui/StepperAlphaOmega";
import { landingS01 } from "@/content/landing-s01";

const { path } = landingS01;

/** S-01 "Jalur Alpha → Omega" — Figma 06 node 56:6743. */
export function AlphaOmegaPath() {
  return (
    <section
      aria-labelledby="landing-path"
      className="relative flex w-full flex-col gap-ato-16 overflow-hidden rounded-ato-lg border-[0.5px] border-ato-ink bg-white p-ato-20 lg:hidden shadow-[4px_4px_0_0_var(--ato-ink),0_6px_14px_-4px_rgba(13,23,33,0.2),inset_0_-2px_4px_0_rgba(13,23,33,0.14),inset_0_1px_0_0_rgba(255,255,255,0.45)]"
    >
      <ConsoleLabel as="h2" id="landing-path" tone="text-1">
        {path.label}
      </ConsoleLabel>
      <StepperAlphaOmega step={2} />
      <p className="font-ato-ui text-ato-caption text-ato-text-2">{path.caption}</p>
    </section>
  );
}
