"use client";

import { useId } from "react";
import { ShieldCheck } from "lucide-react";
import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { Button, FLOW_GRADIENTS } from "@/components/ui/Button";
import { CategoryChip } from "@/components/ui/CategoryChip";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { FlowTop, LiteScreen } from "@/components/lite/LiteShell";
import { liteCopy } from "@/content/lite";
import { iconFor } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ANALYZE_TEXT_MAX_LENGTH, type Category, type CategoryId } from "@/types/api-v1";

const copy = liteCopy.situation;

type SituationScreenProps = {
  categories: Category[] | null;
  categoryId: CategoryId | null;
  onSelectCategory: (id: CategoryId) => void;
  text: string;
  onTextChange: (text: string) => void;
  /** Hitungan dari maskText() di browser — chip "N data disamarkan". */
  maskedCount: number;
  showTooShort: boolean;
  canContinue: boolean;
  busy: boolean;
  /** busy lebih dari SLOW_HINT_MS → chip "Agak lama?" di atas tombol. */
  slow: boolean;
  /** Kategori gagal dimuat dan sheet S-19 sudah ditutup → tampilkan "Coba lagi". */
  onRetryCategories?: () => void;
  onExample: () => void;
  onNext: () => void;
};

/** S-03 Situasi — Figma 06 node 56:6842 (Empty) / 56:6933 (Filled+Masked). */
export function SituationScreen(props: SituationScreenProps) {
  const textId = useId();
  const helperId = useId();
  const errorId = useId();
  const { categories, categoryId, text, maskedCount, showTooShort, canContinue, busy, slow } = props;

  return (
    <LiteScreen>
      <div className="relative flex w-full flex-1 flex-col gap-ato-16 px-ato-16 pb-ato-24 pt-ato-16">
        <FlowTop back={{ label: liteCopy.header.home, href: "/" }} progress={liteCopy.progress.situation} step={0} />
        <DisclaimerBanner>{liteCopy.disclaimer}</DisclaimerBanner>

        <h1 className="ato-text-outline w-full font-ato-ui text-ato-m-h2 text-white">{copy.title}</h1>

        <div className="flex w-full flex-wrap gap-ato-8" role="group" aria-label={copy.title}>
          {categories?.map((c) => (
            <CategoryChip
              key={c.id}
              icon={iconFor(c.icon)}
              label={c.label}
              selected={categoryId === c.id}
              onClick={() => props.onSelectCategory(c.id)}
            />
          ))}
          {/* Keputusan desain mandiri: tidak ada di 06. Pola tombol ghost "Coba lagi" dari S-07 Error. */}
          {!categories && props.onRetryCategories && (
            <Button variant="ghost" size="md" className="w-auto px-ato-0" onClick={props.onRetryCategories}>
              {liteCopy.offline.retry}
            </Button>
          )}
        </div>

        <div aria-hidden className="flex w-full items-center gap-ato-12">
          <span className="h-px min-w-px flex-1 bg-ato-border-subtle" />
          <span className="whitespace-nowrap font-ato-ui text-ato-caption text-ato-text-3">{copy.divider}</span>
          <span className="h-px min-w-px flex-1 bg-ato-border-subtle" />
        </div>

        {/* Label row (node 56:6865): di 06 label 250px satu baris dan "↻" terpotong tepi frame. */}
        <div className="flex w-full items-center justify-between overflow-hidden">
          <label htmlFor={textId} className="w-[250px] shrink-0 whitespace-nowrap font-ato-ui text-ato-m-h3 text-ato-text-1">
            {copy.textLabel}
          </label>
          <Button
            variant="ghost"
            size="md"
            // Tinggi visual 25px seperti 06; area sentuh diperluas ke ±45px (target sentuh min. 44px di 01 Pondasi).
            className="h-auto w-auto shrink-0 self-stretch overflow-visible px-ato-16 after:absolute after:inset-x-0 after:-inset-y-[10px] after:content-['']"
            labelClassName="whitespace-nowrap"
            aria-label={copy.exampleButton.replace(" ↻", "")}
            onClick={props.onExample}
          >
            {copy.exampleButton}
          </Button>
        </div>

        <div
          className={cn(
            "flex h-[150px] w-full flex-col gap-ato-8 overflow-hidden rounded-ato-md bg-white p-ato-16 shadow-[4px_5px_0_0_var(--ato-ink)]",
            "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ato-lite-accent",
            text ? "border-[0.5px] border-ato-ink" : "border border-ato-ink"
          )}
        >
          <textarea
            id={textId}
            value={text}
            maxLength={ANALYZE_TEXT_MAX_LENGTH}
            placeholder={copy.placeholder}
            onChange={(e) => props.onTextChange(e.target.value)}
            aria-describedby={showTooShort ? `${helperId} ${errorId}` : helperId}
            aria-invalid={showTooShort && text.length > 0 ? true : undefined}
            className="min-h-0 w-full flex-1 resize-none bg-transparent font-ato-ui text-ato-m-body text-ato-text-1 outline-none placeholder:text-[#696969]"
          />
          {maskedCount > 0 && (
            <span
              aria-live="polite"
              className="inline-flex shrink-0 items-center self-start rounded-ato-full border border-ato-lite-accent bg-ato-lite-accent-soft py-ato-4 font-ato-ui text-ato-caption text-ato-lite-accent"
            >
              <ShieldCheck aria-hidden size={14} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-lite-accent)" className="shrink-0" />
              {copy.maskedChip(maskedCount)}
            </span>
          )}
        </div>

        <div className="flex w-full items-start gap-ato-8">
          <ShieldCheck aria-hidden size={16} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-text-3)" className="mt-[2px] shrink-0" />
          <p id={helperId} className="min-w-px flex-1 font-ato-ui text-ato-caption text-ato-text-3">
            {copy.helper}
          </p>
        </div>

        {showTooShort && (
          <p id={errorId} className="w-full font-ato-ui text-ato-caption text-ato-warning">
            {copy.tooShort}
          </p>
        )}
      </div>

      <BottomActionBar glow="#69e5f8">
        {/* Keputusan desain mandiri: chip sama dengan S-07 "Agak lama?", melayang di atas bar (tanpa geser layout). */}
        <div aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-full flex justify-center pb-ato-12">
          {busy && slow && (
            <p className="rounded-ato-full border border-ato-border-subtle bg-ato-bg-1 px-ato-16 font-ato-ui text-ato-caption text-ato-text-2 shadow-ato-glass backdrop-blur-[12px]">
              {liteCopy.loading.slow}
            </p>
          )}
        </div>
        <Button
          variant="aqua"
          gradient={FLOW_GRADIENTS.next}
          className="min-w-px flex-1"
          disabled={!canContinue}
          loading={busy}
          onClick={props.onNext}
        >
          {copy.next}
        </Button>
      </BottomActionBar>
    </LiteScreen>
  );
}
