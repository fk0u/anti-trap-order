"use client";

import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { Button } from "@/components/ui/Button";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { GreenCard, MetersCard, SOUL_GRADIENTS, SoulScreen, SoulTop, WhiteCard } from "@/components/soul/SoulParts";
import { soulCopy } from "@/content/soul";
import { TABLET_COLUMN } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { ChoiceId, Meters } from "@/types/api-v1";

const copy = soulCopy.consequence;

type ConsequenceScreenProps = {
  index: number;
  total: number;
  choice: ChoiceId;
  /** Teks sudah diisi nama & relasi (fillStory). */
  whatHappened: string;
  why: string;
  meters: Meters;
  deltas: Meters;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
};

/**
 * S-13 Konsekuensi — Figma 06 node 56:7640 (Positif) / 56:7700 (Negatif) /
 * 60:2684 (Campuran). Ketiga varian di 06 memakai kartu hijau yang sama;
 * bedanya hanya pada badge dan warna meter (dari `deltas`).
 */
export function ConsequenceScreen(props: ConsequenceScreenProps) {
  const { index, total } = props;
  return (
    // Desktop (node 58:3966): akibat (kiri) | meter + tombol lanjut (kanan, 440).
    <SoulScreen desktopGrid="lg:grid-cols-[minmax(0,1fr)_440px] lg:grid-rows-[auto_auto_1fr] lg:gap-y-ato-24">
      <div className={cn("relative flex w-full flex-1 flex-col gap-ato-20 px-ato-16 pb-ato-24 pt-ato-16", TABLET_COLUMN, "lg:contents")}>
        <SoulTop back={{ label: copy.back(index), onClick: props.onBack }} progress={copy.progress} />

        <div className="flex w-full flex-col gap-ato-8 lg:col-start-1 lg:row-start-1">
          <ConsoleLabel tone="soul">
            {copy.kicker(index, total)}
            <span className="hidden lg:inline">{copy.desktopKickerSuffix}</span>
          </ConsoleLabel>
          <h1 className="ato-text-outline w-full font-ato-ui text-ato-m-h1 text-white lg:text-ato-d-h1 lg:text-ato-bg-0">{copy.title(props.choice)}</h1>
        </div>

        <div className="contents lg:col-start-1 lg:row-start-2 lg:block">
          <GreenCard variant="consequence" label={copy.whatLabel}>
            {props.whatHappened}
          </GreenCard>
        </div>

        <div className="contents lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:flex lg:flex-col lg:items-start lg:gap-ato-24">
          <MetersCard meters={props.meters} deltas={props.deltas} />
          <Button
            variant="aqua"
            desktop="aero"
            gradient={SOUL_GRADIENTS.next}
            labelClassName="text-[#191919]"
            className="hidden lg:flex lg:w-full"
            onClick={props.onNext}
          >
            {props.isLast ? copy.finish : copy.next(index + 1)}
          </Button>
        </div>

        <WhiteCard className="gap-ato-8 lg:col-start-1 lg:row-start-3 lg:p-ato-24">
          <ConsoleLabel as="h2" tone="text-3">
            {copy.whyLabel}
          </ConsoleLabel>
          <p className="font-ato-ui text-ato-m-body text-ato-text-2 lg:text-ato-d-body">{props.why}</p>
        </WhiteCard>
      </div>

      <BottomActionBar glow="#ffda37" className="lg:hidden">
        <Button variant="aqua" gradient={SOUL_GRADIENTS.next} className="min-w-px flex-1" labelClassName="text-[#1b1b1b]" onClick={props.onNext}>
          {props.isLast ? copy.finish : copy.next(index + 1)}
        </Button>
      </BottomActionBar>
    </SoulScreen>
  );
}
