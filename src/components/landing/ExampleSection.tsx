import { ArrowRight, TrendingUp, Wallet } from "lucide-react";
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
    <section aria-labelledby="landing-example" className="flex w-full flex-col gap-ato-12 lg:gap-ato-24">
      <ConsoleLabel as="h2" id="landing-example">
        {example.label}
      </ConsoleLabel>
      {/* Desktop (node "Before after"): kartu Sebelum → Sesudah berdampingan. */}
      <div className="hidden w-full items-center gap-ato-24 lg:flex">
        <div className="flex min-w-px flex-1 flex-col gap-ato-12 overflow-hidden rounded-ato-lg border border-ato-border-subtle bg-ato-bg-1 p-ato-24 shadow-ato-glass backdrop-blur-[12px]">
          <ConsoleLabel as="span" tone="text-3">
            {example.before}
          </ConsoleLabel>
          <p className="w-full rounded-ato-md border-[0.5px] border-ato-ink bg-gradient-to-b from-ato-bg-2 to-[#7aff55] px-ato-16 py-ato-12 font-ato-ui text-ato-d-body-l text-ato-text-1">
            {example.message}
          </p>
        </div>
        <ArrowRight aria-hidden size={24} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-lite-accent)" className="shrink-0" />
        <div className="flex min-w-px flex-1 flex-col gap-ato-8 overflow-hidden rounded-ato-lg border border-ato-lite-accent bg-ato-bg-1 p-ato-24 shadow-ato-glass backdrop-blur-[12px]">
          <ConsoleLabel as="span">{example.after}</ConsoleLabel>
          <div className="flex w-full flex-wrap gap-ato-8">
            {example.badges.map((badge) => (
              <TacticBadge key={badge.label} tone="found" icon={BADGE_ICONS[badge.icon]} label={badge.label} />
            ))}
          </div>
          <p className="font-ato-ui text-ato-d-body text-ato-text-2">{example.note}</p>
        </div>
      </div>
      <div className="relative flex w-full flex-col gap-ato-16 overflow-hidden rounded-ato-lg border border-ato-border-subtle bg-white p-ato-20 shadow-ato-glass backdrop-blur-[12px] lg:hidden">
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
