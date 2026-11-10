"use client";

import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { Button } from "@/components/ui/Button";
import {
  ChoiceCard,
  GreenCard,
  MetersMini,
  ProgressDots,
  SOUL_GRADIENTS,
  SoulScreen,
  SoulTop,
  type ChoiceState,
} from "@/components/soul/SoulParts";
import { soulCopy } from "@/content/soul";
import type { ChoiceId, Meters, Mission } from "@/types/api-v1";

const copy = soulCopy.mission;

type MissionScreenProps = {
  mission: Mission;
  total: number;
  meters: Meters;
  /** Cerita sudah diisi nama & relasi (fillStory). */
  story: string;
  selected: ChoiceId | null;
  onSelect: (id: ChoiceId) => void;
  /**
   * - "open": bisa memilih.
   * - "locked": sedang mengirim pilihan (pilihan lain redup, tombol loading).
   * - "answered": misi sudah dijawab (dibuka lagi lewat Back) — hanya baca.
   */
  mode: "open" | "locked" | "answered";
  onChoose: () => void;
  onChangeCharacter: () => void;
};

/**
 * S-11 Misi — Figma 06 node 56:7512 (None selected) / 56:7576 (Selected).
 * State terkunci dan hanya-baca tidak digambar di 06: memakai ChoiceCard
 * "Locked" dari 02 (opacity 55%) — keputusan desain mandiri.
 */
export function MissionScreen(props: MissionScreenProps) {
  const { mission, total, meters, story, selected, mode } = props;
  const stateOf = (id: ChoiceId): ChoiceState =>
    id === selected ? "selected" : mode === "open" ? "default" : "locked";

  return (
    <SoulScreen>
      <div className="relative flex w-full flex-1 flex-col gap-ato-20 px-ato-16 pb-ato-24 pt-ato-16">
        <SoulTop back={{ label: copy.back, onClick: props.onChangeCharacter }} progress={copy.progress(mission.index, total)} />

        <div className="flex w-full items-center justify-between">
          <h1 className="whitespace-nowrap font-ato-ui text-ato-m-h2 text-ato-text-1">{copy.title(mission.index, total)}</h1>
          <ProgressDots step={mission.index} total={total} />
        </div>

        <MetersMini meters={meters} />

        <GreenCard variant="story" label={copy.storyLabel}>
          {story}
        </GreenCard>

        <div role="radiogroup" aria-label={copy.title(mission.index, total)} className="flex w-full flex-col gap-ato-12">
          {mission.choices.map((c) => (
            <ChoiceCard
              key={c.id}
              id={c.id}
              label={c.label}
              state={stateOf(c.id)}
              disabled={mode !== "open"}
              onSelect={() => props.onSelect(c.id)}
            />
          ))}
        </div>
      </div>

      <BottomActionBar glow="#ffda37">
        <Button
          variant="aqua"
          gradient={SOUL_GRADIENTS.choose}
          className="min-w-px flex-1"
          labelClassName="text-[#1b1b1b]"
          disabled={selected === null}
          loading={mode === "locked"}
          onClick={props.onChoose}
        >
          {copy.choose}
        </Button>
      </BottomActionBar>
    </SoulScreen>
  );
}
