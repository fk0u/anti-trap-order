import { TrendingUp, Wallet } from "lucide-react";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { TacticBadge } from "@/components/ui/TacticBadge";
import { landingS01 } from "@/content/landing-s01";

const { example } = landingS01;

/** Warna ikon persis dari SVG Figma 06 (trending-up gelap, wallet aksen Lite). */
const BADGE_ICONS = {
  "trending-up": <TrendingUp size={16} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-text-1)" />,
  wallet: <Wallet size={16} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-lite-accent)" />,
} as const;

/** S-01 "Contoh (fiktif)" — Figma 06 node 56:6759. */
export function ExampleSection() {
  return (
    <section aria-labelledby="landing-example" className="flex w-full flex-col gap-ato-12">
      <ConsoleLabel as="h2" id="landing-example">
        {example.label}
      </ConsoleLabel>
      <div className="relative flex w-full flex-col gap-ato-16 overflow-hidden rounded-ato-lg border border-ato-border-subtle bg-white p-ato-20 shadow-ato-glass backdrop-blur-[12px]">
        <div
          className="w-full rounded-[20px] border-[0.5px] border-ato-ink px-ato-16 py-ato-12"
          style={{ backgroundImage: "linear-gradient(to bottom, #ffffff 6.25%, var(--ato-bubble) 117.36%)" }}
        >
          <p className="font-ato-ui text-ato-m-body text-ato-text-1">{example.message}</p>
        </div>
        <div className="flex w-full flex-wrap gap-ato-8">
          {example.badges.map((badge) => (
            <TacticBadge key={badge.label} tone="found" icon={BADGE_ICONS[badge.icon]} label={badge.label} />
          ))}
        </div>
        <p className="font-ato-ui text-ato-caption text-ato-text-2">{example.note}</p>
      </div>
    </section>
  );
}
