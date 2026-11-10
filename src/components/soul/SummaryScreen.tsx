"use client";

import { Check } from "lucide-react";
import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { Button } from "@/components/ui/Button";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { MetersCard, SOUL_GRADIENTS, SoulPath, SoulPathDesktop, SoulScreen, SoulTop } from "@/components/soul/SoulParts";
import { soulCopy } from "@/content/soul";
import { TABLET_COLUMN } from "@/lib/layout";
import { cn } from "@/lib/utils";
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
    // Desktop (node 58:4508): status + tombol (kiri) | meter akhir + insight (kanan, 480).
    <SoulScreen desktopTop={80} desktopGrid="lg:grid-cols-[minmax(0,1fr)_480px] lg:grid-rows-[auto_auto_1fr] lg:gap-y-ato-24">
      <div className={cn("relative flex w-full flex-1 flex-col gap-ato-20 px-ato-16 pb-ato-24 pt-ato-16", TABLET_COLUMN, "lg:contents")}>
        <SoulTop back={{ label: copy.back, href: "/" }} progress={copy.progress} />
        <SoulPath />
        <div className="hidden lg:col-start-1 lg:row-start-1 lg:block">
          <SoulPathDesktop />
        </div>

        <div className="flex w-full flex-col items-start lg:col-start-1 lg:row-start-2 lg:gap-ato-24">
          <h1 className="ato-text-outline w-full font-ato-ui text-ato-m-h1 text-white lg:text-ato-d-h1 lg:text-ato-text-1 lg:[--ato-outline-width:0px]">{copy.title}</h1>
          <p className="flex items-center gap-ato-8 rounded-ato-full border-[1.5px] border-ato-soul-accent bg-ato-soul-surface px-ato-16 py-ato-8">
            <Check aria-hidden size={16} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-soul-accent)" className="lg:size-[18px]" />
            <span className="whitespace-nowrap font-ato-ui text-ato-m-h3 text-ato-soul-accent lg:text-ato-d-h3">{summary.rank_label}</span>
          </p>
          <p className="w-full font-ato-ui text-ato-m-body-l text-ato-text-2 lg:text-ato-d-body-l">{summary.description}</p>
        </div>

        <div className="contents lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:flex lg:flex-col lg:gap-ato-20">
        <MetersCard meters={summary.final_meters} deltas={deltas} />

        {summary.insights.length > 0 && (
          <section className="relative flex w-full flex-col overflow-hidden rounded-ato-lg border border-ato-soul-accent bg-ato-soul-surface p-ato-20 backdrop-blur-[12px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_12px_32px_-8px_rgba(13,23,33,0.08)] lg:gap-ato-12 lg:p-ato-24">
            <ConsoleLabel as="h2" tone="soul">
              {copy.insightLabel}
            </ConsoleLabel>
            <ul className="flex w-full flex-col lg:gap-ato-12">
              {summary.insights.map((text) => (
                <li key={text} className="flex w-full items-start font-ato-ui text-ato-m-body lg:text-ato-d-body">
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
      </div>

      <BottomActionBar glow="#ffda37" direction="column" className="lg:col-start-1 lg:row-start-3 lg:flex-col lg:items-start lg:justify-start">
        <Button variant="aqua" href="/lite" desktop="lite" gradient={SOUL_GRADIENTS.lite} labelClassName="text-[#1f1f1f]">
          {copy.lite}
        </Button>
        <Button
          variant="secondary"
          size="md"
          desktop="secondary"
          className="border-[0.5px] border-ato-ink bg-white lg:h-[52px] lg:px-ato-24"
          labelClassName="bg-[linear-gradient(178.57deg,#0e7490_10.312%,#ffffff_90.845%)] bg-clip-text text-transparent"
          onClick={onAgain}
        >
          {copy.again}
        </Button>
        <p className="w-full text-center font-ato-ui text-ato-caption text-ato-text-3 lg:text-left">{copy.disclaimer}</p>
      </BottomActionBar>
    </SoulScreen>
  );
}
