"use client";

import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { Button } from "@/components/ui/Button";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { GreenCard, MetersCard, SOUL_GRADIENTS, SoulScreen, SoulTop, WhiteCard } from "@/components/soul/SoulParts";
import { soulCopy } from "@/content/soul";
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
    <SoulScreen>
      <div className="relative flex w-full flex-1 flex-col gap-ato-20 px-ato-16 pb-ato-24 pt-ato-16">
        <SoulTop back={{ label: copy.back(index), onClick: props.onBack }} progress={copy.progress} />

        <div className="flex w-full flex-col gap-ato-8">
          <ConsoleLabel tone="soul">{copy.kicker(index, total)}</ConsoleLabel>
          <h1 className="ato-text-outline w-full font-ato-ui text-ato-m-h1 text-white">{copy.title(props.choice)}</h1>
        </div>

        <GreenCard variant="consequence" label={copy.whatLabel}>
          {props.whatHappened}
        </GreenCard>

        <MetersCard meters={props.meters} deltas={props.deltas} />

        <WhiteCard className="gap-ato-8">
          <ConsoleLabel as="h2" tone="text-3">
            {copy.whyLabel}
          </ConsoleLabel>
          <p className="font-ato-ui text-ato-m-body text-ato-text-2">{props.why}</p>
        </WhiteCard>
      </div>

      <BottomActionBar glow="#ffda37">
        <Button variant="aqua" gradient={SOUL_GRADIENTS.next} className="min-w-px flex-1" labelClassName="text-[#1b1b1b]" onClick={props.onNext}>
          {props.isLast ? copy.finish : copy.next(index + 1)}
        </Button>
      </BottomActionBar>
    </SoulScreen>
  );
}
