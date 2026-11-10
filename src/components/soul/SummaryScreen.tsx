"use client";

import { Check } from "lucide-react";
import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { Button } from "@/components/ui/Button";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { MetersCard, SOUL_GRADIENTS, SoulPath, SoulScreen, SoulTop } from "@/components/soul/SoulParts";
import { soulCopy } from "@/content/soul";
import type { Meters, SoulSummary } from "@/types/api-v1";

const copy = soulCopy.summary;

type SummaryScreenProps = {
  summary: SoulSummary;
  /** Perubahan dari meter awal (POST /soul/start) ke `final_meters`. */
  deltas: Meters;
  onAgain: () => void;
};

/** S-14 Ringkasan — Figma 06 node 56:8128 (Siaga) / 61:5908 (Pemula) / 61:5991 (Teguh). */
export function SummaryScreen({ summary, deltas, onAgain }: SummaryScreenProps) {
  return (
    <SoulScreen>
      <div className="relative flex w-full flex-1 flex-col gap-ato-20 px-ato-16 pb-ato-24 pt-ato-16">
        <SoulTop back={{ label: copy.back, href: "/" }} progress={copy.progress} />
        <SoulPath />

        <div className="flex w-full flex-col items-start">
          <h1 className="ato-text-outline w-full font-ato-ui text-ato-m-h1 text-white">{copy.title}</h1>
          <p className="flex items-center gap-ato-8 rounded-ato-full border-[1.5px] border-ato-soul-accent bg-ato-soul-surface px-ato-16 py-ato-8">
            <Check aria-hidden size={16} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-soul-accent)" />
            <span className="whitespace-nowrap font-ato-ui text-ato-m-h3 text-ato-soul-accent">{summary.rank_label}</span>
          </p>
          <p className="w-full font-ato-ui text-ato-m-body-l text-ato-text-2">{summary.description}</p>
        </div>

        <MetersCard meters={summary.final_meters} deltas={deltas} />

        {summary.insights.length > 0 && (
          <section className="relative flex w-full flex-col overflow-hidden rounded-ato-lg border border-ato-soul-accent bg-ato-soul-surface p-ato-20 backdrop-blur-[12px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_12px_32px_-8px_rgba(13,23,33,0.08)]">
            <ConsoleLabel as="h2" tone="soul">
              {copy.insightLabel}
            </ConsoleLabel>
            <ul className="flex w-full flex-col">
              {summary.insights.map((text) => (
                <li key={text} className="flex w-full items-start font-ato-ui text-ato-m-body">
                  <span aria-hidden className="whitespace-nowrap text-ato-soul-accent">
                    •
                  </span>
                  <span className="min-w-px flex-1 text-ato-text-1">{text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <BottomActionBar glow="#ffda37" direction="column">
        <Button variant="aqua" href="/lite" gradient={SOUL_GRADIENTS.lite} labelClassName="text-[#1f1f1f]">
          {copy.lite}
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="border-[0.5px] border-ato-ink bg-white"
          labelClassName="bg-[linear-gradient(178.57deg,#0e7490_10.312%,#ffffff_90.845%)] bg-clip-text text-transparent"
          onClick={onAgain}
        >
          {copy.again}
        </Button>
        <p className="w-full text-center font-ato-ui text-ato-caption text-ato-text-3">{copy.disclaimer}</p>
      </BottomActionBar>
    </SoulScreen>
  );
}
