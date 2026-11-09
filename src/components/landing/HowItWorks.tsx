import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { landingS01 } from "@/content/landing-s01";

const { howItWorks } = landingS01;

/** Gradien tiap kartu langkah — Figma 06 node 56:6750 / 56:6753 / 56:6756 (berbeda per kartu). */
const STEP_GRADIENTS = [
  "linear-gradient(to bottom, #ffffff 0%, #97dcef 113.5%)",
  "linear-gradient(176.85deg, #ffffff 7.97%, #97dcef 91.78%)",
  "linear-gradient(179.14deg, #ffffff 2.31%, #95dcef 97.24%)",
];

/** S-01 "Cara kerja" — Figma 06 node 56:6747. */
export function HowItWorks() {
  return (
    <section aria-labelledby="landing-how" className="flex w-full flex-col gap-ato-12">
      <ConsoleLabel>{howItWorks.label}</ConsoleLabel>
      <h2 id="landing-how" className="ato-text-outline w-full font-ato-ui text-ato-m-h2 text-white">
        {howItWorks.title}
      </h2>
      <ol className="flex w-full flex-col gap-ato-12">
        {howItWorks.steps.map((step, i) => (
          <li
            key={step.number}
            className="relative flex h-[100px] w-full items-center gap-ato-12 overflow-hidden rounded-ato-lg border-[0.5px] border-ato-ink p-ato-16 backdrop-blur-[12px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_12px_32px_-8px_rgba(13,23,33,0.08),inset_0_1px_0_0_rgba(255,255,255,0.9)]"
            style={{ backgroundImage: STEP_GRADIENTS[i] }}
          >
            <span className="whitespace-nowrap font-ato-console text-ato-console uppercase text-ato-lite-accent">{step.number}</span>
            <span className="min-w-px flex-1 font-ato-ui text-ato-m-body text-ato-text-1">{step.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
