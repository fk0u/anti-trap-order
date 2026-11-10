"use client";

import { useId } from "react";
import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { BUTTON_GRADIENTS, Button } from "@/components/ui/Button";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { CharacterCard, SoulScreen, SoulTop } from "@/components/soul/SoulParts";
import { soulCopy } from "@/content/soul";
import { TABLET_COLUMN } from "@/lib/layout";
import type { NicknameCheck } from "@/lib/soul/rules";
import { cn } from "@/lib/utils";
import type { CharacterOptions } from "@/types/api-v1";

const copy = soulCopy.character;

export type CharacterSelection = { kind: "template"; id: string } | { kind: "custom" } | null;

type CharacterScreenProps = {
  options: CharacterOptions | null;
  selection: CharacterSelection;
  onSelectTemplate: (id: string) => void;
  nickname: string;
  nicknameCheck: NicknameCheck;
  maxLength: number;
  relationId: string;
  onCustomChange: (nickname: string, relationId: string) => void;
  canStart: boolean;
  busy: boolean;
  /** Kategori gagal dimuat dan sheet S-19 ditutup → tombol "Coba lagi" (pola S-03). */
  retry?: { label: string; onClick: () => void };
  onStart: () => void;
};

/** S-10 Pilih Karakter — Figma 06 node 56:7441. */
export function CharacterScreen(props: CharacterScreenProps) {
  const { options, selection, nickname, nicknameCheck, maxLength, relationId } = props;
  const nickId = useId();
  const relId = useId();
  const errId = useId();
  const relationLabel = (id: string) => options?.relations.find((r) => r.id === id)?.label ?? "";
  // Pesan error hanya untuk isi yang berisi angka/email/URL (06), bukan untuk kotak kosong.
  const showError = selection?.kind === "custom" && !nicknameCheck.ok && nicknameCheck.reason !== "empty";

  return (
    // Desktop (node 58:3736): judul + tombol di kiri (400) | kartu 2×2 + "Buat sendiri" di kanan.
    <SoulScreen desktopTop={80} desktopGrid="lg:grid-cols-[400px_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
      <div className={cn("relative flex w-full flex-1 flex-col gap-ato-16 px-ato-16 pb-ato-24 pt-ato-16", TABLET_COLUMN, "lg:contents")}>
        <SoulTop back={{ label: copy.back, href: "/" }} progress={copy.progress} />

        <div className="flex w-full flex-col gap-ato-8 lg:col-start-1 lg:row-start-1 lg:gap-ato-20">
          <ConsoleLabel tone="soul">{copy.kicker}</ConsoleLabel>
          <h1 className="ato-text-outline w-full font-ato-ui text-ato-m-h1 text-white lg:text-ato-d-h1 lg:text-ato-text-1 lg:[--ato-outline-width:0px]">{copy.title}</h1>
          <p className="w-full font-ato-ui text-ato-m-body text-ato-text-2 lg:text-ato-d-body-l">{copy.body}</p>
        </div>

        <div className="contents lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col lg:gap-ato-16">
        <div role="radiogroup" aria-label={copy.title} className="flex w-full flex-col gap-ato-16 lg:grid lg:grid-cols-2">
          {options?.templates.map((t) => (
            <CharacterCard
              key={t.id}
              name={t.default_name}
              relation={relationLabel(t.relation_id)}
              avatar={t.avatar}
              selected={selection?.kind === "template" && selection.id === t.id}
              onSelect={() => props.onSelectTemplate(t.id)}
            />
          ))}
          {props.retry && (
            <Button variant="ghost" size="md" className="w-auto self-start px-ato-0" labelClassName="text-ato-soul-accent" onClick={props.retry.onClick}>
              {props.retry.label}
            </Button>
          )}
        </div>

        {options && (
          <section
            aria-labelledby={`${nickId}-h`}
            className="relative flex w-full flex-col overflow-hidden rounded-ato-lg border border-ato-soul-accent bg-ato-soul-surface p-ato-20 backdrop-blur-[12px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_12px_32px_-8px_rgba(13,23,33,0.08)] lg:gap-ato-16 lg:p-ato-24"
          >
            <h2 id={`${nickId}-h`} className="flex w-full items-center gap-ato-8 font-ato-ui text-ato-m-h3 lg:text-ato-d-h3">
              <span aria-hidden className="text-ato-soul-accent">
                ＋
              </span>
              <span className="min-w-px flex-1 text-ato-text-1">{copy.custom}</span>
            </h2>

            {/* Desktop (node 58:3759): dua field berdampingan, jarak 16. */}
            <div className="contents lg:flex lg:w-full lg:items-start lg:gap-ato-16">
            <div className="flex w-full flex-col lg:min-w-px lg:flex-1">
              <div className="flex w-full items-start justify-between whitespace-nowrap font-ato-ui text-ato-caption">
                <label htmlFor={nickId} className="text-ato-text-2">
                  {copy.nickname}
                </label>
                <span aria-hidden className="text-ato-text-3">
                  {copy.counter(nickname.length, maxLength)}
                </span>
              </div>
              <input
                id={nickId}
                type="text"
                value={nickname}
                maxLength={maxLength}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={showError || undefined}
                aria-describedby={showError ? errId : undefined}
                onFocus={() => selection?.kind !== "custom" && props.onCustomChange(nickname, relationId)}
                onChange={(e) => props.onCustomChange(e.target.value, relationId)}
                className={cn(
                  "w-full rounded-ato-md border bg-ato-bg-1 px-ato-16 py-ato-12 font-ato-ui text-ato-m-body text-ato-text-1 outline-none lg:text-ato-d-body",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-soul-accent",
                  showError ? "border-ato-soul-rose" : "border-ato-border-strong"
                )}
              />
            </div>

            <div className="flex w-full flex-col lg:min-w-px lg:flex-1">
              <label htmlFor={relId} className="whitespace-nowrap font-ato-ui text-ato-caption text-ato-text-2">
                {copy.relation}
              </label>
              <div className="relative w-full">
                <select
                  id={relId}
                  value={relationId}
                  onChange={(e) => props.onCustomChange(nickname, e.target.value)}
                  onFocus={() => selection?.kind !== "custom" && props.onCustomChange(nickname, relationId)}
                  className="w-full appearance-none rounded-ato-md border border-ato-border-strong bg-ato-bg-1 px-ato-16 py-ato-12 pr-ato-32 font-ato-ui text-ato-m-body text-ato-text-1 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-soul-accent lg:text-ato-d-body"
                >
                  {options.relations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <span aria-hidden className="pointer-events-none absolute right-ato-16 top-1/2 -translate-y-1/2 font-ato-ui text-ato-caption text-ato-text-3">
                  ▾
                </span>
              </div>
            </div>
            </div>

            {showError && (
              <p id={errId} role="alert" className="w-full font-ato-ui text-ato-caption text-ato-soul-rose">
                {copy.nicknameError}
              </p>
            )}
          </section>
        )}
        </div>
      </div>

      <BottomActionBar glow="#ffda37" direction="column" className="lg:col-start-1 lg:row-start-2 lg:mt-ato-20 lg:flex-col lg:items-start lg:justify-start">
        <Button
          variant="aqua"
          desktop="soul"
          gradient={BUTTON_GRADIENTS.soulMode}
          className="shadow-none"
          labelClassName="text-[#151515]"
          disabled={!props.canStart}
          loading={props.busy}
          onClick={props.onStart}
        >
          {copy.start}
        </Button>
        {/* TODO(cara main Soul): "Lihat cara mainnya" disembunyikan — /tentang belum menjelaskan cara main Soul (jawaban Syafar no. 6). */}
      </BottomActionBar>
    </SoulScreen>
  );
}
