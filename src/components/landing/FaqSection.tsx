"use client";

import { useId, useState } from "react";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { landingS01 } from "@/content/landing-s01";
import { cn } from "@/lib/utils";

const { faq } = landingS01;

/**
 * S-01 "Pertanyaan umum" — Figma 06 node 56:6778.
 * Accordion: item dengan jawaban kosong tidak bisa dibuka (jawaban belum ada di Figma).
 * State terbuka tidak ada di Figma; jawaban tampil di bawah pertanyaan dan tanda berubah jadi "−".
 */
export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <section aria-labelledby={`${baseId}-label`} className="flex w-full flex-col gap-ato-8">
      <ConsoleLabel as="h2" id={`${baseId}-label`}>
        {faq.label}
      </ConsoleLabel>
      {faq.items.map((item, i) => {
        const hasAnswer = item.answer.trim().length > 0;
        const isOpen = hasAnswer && openIndex === i;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div key={item.question} className="w-full overflow-hidden rounded-ato-md border border-ato-border-subtle bg-ato-bg-1">
            <h3>
              <button
                type="button"
                disabled={!hasAnswer}
                aria-expanded={isOpen}
                aria-controls={hasAnswer ? panelId : undefined}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className={cn(
                  "flex w-full items-center gap-ato-12 p-ato-16 text-left",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ato-lite-accent",
                  !hasAnswer && "cursor-default"
                )}
              >
                <span className="min-w-px flex-1 font-ato-ui text-ato-m-body text-ato-text-1">{item.question}</span>
                <span aria-hidden className="whitespace-nowrap font-ato-console text-ato-console uppercase text-ato-lite-accent">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            {hasAnswer && (
              <div id={panelId} role="region" hidden={!isOpen} className="px-ato-16 pb-ato-16 font-ato-ui text-ato-m-body text-ato-text-2">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
