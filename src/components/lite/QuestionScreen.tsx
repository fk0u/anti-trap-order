"use client";

import { useId, useState } from "react";
import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { Button, FLOW_GRADIENTS } from "@/components/ui/Button";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { OptionCard } from "@/components/ui/OptionCard";
import { OtherOption } from "@/components/ui/OtherOption";
import { FlowTop, LITE_ACTIONS, LITE_PANEL_GRID, LiteMain, LitePanel, LiteScreen } from "@/components/lite/LiteShell";
import { liteCopy } from "@/content/lite";
import { TABLET_COLUMN } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/api-v1";

const copy = liteCopy.question;

export type AnswerDraft = { optionIds: string[]; otherOpen: boolean; otherText: string };

export const EMPTY_DRAFT: AnswerDraft = { optionIds: [], otherOpen: false, otherText: "" };

/** Jawaban sah: 1–2 opsi, atau "Lainnya" terisi (sesuai kontrak Answer). */
export function isDraftValid(d: AnswerDraft): boolean {
  return d.optionIds.length >= 1 || (d.otherOpen && d.otherText.trim().length > 0);
}

type QuestionScreenProps = {
  question: Question;
  /** Teks kotak "PESAN (FIKTIF)" — example_message skenario. */
  message: string;
  draft: AnswerDraft;
  onDraftChange: (draft: AnswerDraft) => void;
  onBack: () => void;
  onNext: () => void;
};

/** S-04 / S-05 / S-06 — Figma 06 node 56:7089 (Two selected) dan varian None selected. */
export function QuestionScreen({ question, message, draft, onDraftChange, onBack, onNext }: QuestionScreenProps) {
  const [messageOpen, setMessageOpen] = useState(true);
  const messageId = useId();
  const promptId = useId();
  const step = question.step;
  const isLast = step === 3;
  const maxReached = draft.optionIds.length >= question.max_select;

  const toggle = (optionId: string) => {
    const selected = draft.optionIds.includes(optionId);
    if (!selected && maxReached) return;
    onDraftChange({
      ...draft,
      optionIds: selected ? draft.optionIds.filter((id) => id !== optionId) : [...draft.optionIds, optionId],
    });
  };

  return (
    <LiteScreen desktopGrid={LITE_PANEL_GRID}>
      <div className={cn("relative flex w-full flex-1 flex-col gap-ato-20 px-ato-16 pb-ato-24 pt-ato-16", TABLET_COLUMN, "lg:contents")}>
        <LitePanel>
        <FlowTop back={{ label: liteCopy.header.back, onClick: onBack }} progress={liteCopy.progress.question(step)} step={step} desktopStep={step} />

        {/* Context card (node 146:5334); desktop node 56:8973: `bg/2`, tanpa garis dan bayangan. */}
        <section
          className={cn(
            "relative flex w-full flex-col gap-ato-8 overflow-hidden rounded-ato-lg border-[0.5px] border-ato-ink p-ato-16 backdrop-blur-[12px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),4px_4px_3px_0_rgba(0,0,0,0.25),0_12px_32px_-8px_rgba(13,23,33,0.08)]",
            "[background-image:linear-gradient(to_bottom,#ffffff,#7aff55_99.98%)]",
            "lg:rounded-ato-md lg:border-0 lg:bg-ato-bg-2 lg:shadow-none lg:backdrop-blur-none lg:[background-image:none]"
          )}
        >
          <button
            type="button"
            aria-expanded={messageOpen}
            aria-controls={messageId}
            onClick={() => setMessageOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-ato-sm text-ato-text-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent"
          >
            <span className="font-ato-console text-ato-console uppercase">{copy.messageLabel}</span>
            <span aria-hidden className={`font-ato-ui text-ato-caption transition-transform ${messageOpen ? "" : "-rotate-90"}`}>
              ▾
            </span>
          </button>
          <p id={messageId} hidden={!messageOpen} className="w-full font-ato-ui text-ato-m-body text-ato-text-2 lg:text-ato-d-body">
            {message}
          </p>
        </section>
        </LitePanel>

        <LiteMain className="lg:gap-ato-20">
        <div className="flex w-full flex-col gap-ato-8">
          <ConsoleLabel>{copy.modeLabel}</ConsoleLabel>
          <h1 id={promptId} className="w-full font-ato-ui text-ato-m-h2 text-ato-text-1 lg:text-ato-d-h2">
            {question.prompt}
          </h1>
          <p className="font-ato-ui text-ato-caption text-ato-text-3">{copy.hint}</p>
        </div>

        <div role="group" aria-labelledby={promptId} className="flex w-full flex-col gap-ato-8 lg:gap-ato-12">
          {question.options.map((opt) => {
            const selected = draft.optionIds.includes(opt.id);
            return (
              <OptionCard
                key={opt.id}
                label={opt.label}
                selected={selected}
                disabled={!selected && maxReached}
                onToggle={() => toggle(opt.id)}
              />
            );
          })}
          {question.allow_other && (
            <OtherOption
              label={copy.otherLabel}
              placeholder={copy.otherPlaceholder}
              maxLength={question.other_max_length}
              expanded={draft.otherOpen}
              value={draft.otherText}
              onToggle={() => onDraftChange({ ...draft, otherOpen: !draft.otherOpen })}
              onChange={(otherText) => onDraftChange({ ...draft, otherText })}
            />
          )}
        </div>
        </LiteMain>
      </div>

      <BottomActionBar glow="#6be5f8" className={cn(LITE_ACTIONS, "lg:mt-ato-20 lg:justify-between")}>
        <Button variant="secondary" desktop="secondary" className="w-auto shrink-0" onClick={onBack}>
          {copy.back}
        </Button>
        <Button
          variant="aqua"
          desktop="lite"
          gradient={FLOW_GRADIENTS.question}
          className="min-w-px flex-1 lg:flex-none"
          disabled={!isDraftValid(draft)}
          onClick={onNext}
        >
          {isLast ? copy.finish : copy.next}
        </Button>
      </BottomActionBar>
    </LiteScreen>
  );
}
