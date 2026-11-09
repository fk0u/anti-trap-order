"use client";

import Link from "next/link";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { modeSheet } from "@/content/mode-sheet";
import { cn } from "@/lib/utils";

/** Nilai dari Figma 06, S-02 (node 56:8402 / 56:8408 / 56:8414). */
const OPTION_STYLE = {
  lite: {
    card: "bg-gradient-to-t from-[#78e8f9] to-white",
    icon: "/icons/ato/clock-gradient.svg",
    tone: "lite",
  },
  soul: {
    card: "bg-gradient-to-b from-white to-[#ffda3f]",
    icon: "/icons/ato/heart-handshake-gradient.svg",
    tone: "soul",
  },
} as const;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent";

/** S-02 "Pilih Mode" — dibuka dari tombol menu di header. */
export function ModeSheet({ id, open, onClose }: { id: string; open: boolean; onClose: () => void }) {
  return (
    <BottomSheet id={id} open={open} onClose={onClose} title={modeSheet.title}>
      {modeSheet.options.map((option) => {
        const style = OPTION_STYLE[option.id];
        return (
          <Link
            key={option.id}
            href={option.href}
            onClick={onClose}
            className={cn(
              "flex w-full items-center gap-ato-16 overflow-hidden rounded-ato-lg border-[0.5px] border-ato-ink p-ato-16",
              style.card,
              focusRing
            )}
          >
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-ato-md border-[0.3px] border-ato-ink bg-white shadow-ato-gloss"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG gradien dari Figma, ukuran tetap */}
              <img src={style.icon} alt="" width={24} height={24} />
            </span>
            <span className="flex min-w-px flex-1 flex-col gap-ato-4 text-left">
              <span className="font-ato-ui text-ato-m-h3 text-ato-text-1">{option.title}</span>
              <ConsoleLabel as="span" tone={style.tone}>
                {option.meta}
              </ConsoleLabel>
            </span>
          </Link>
        );
      })}
      <Link
        href={modeSheet.aboutLink.href}
        onClick={onClose}
        className={cn(
          "flex h-11 w-full items-center justify-center rounded-ato-md px-ato-20 font-ato-ui text-ato-button text-[#82e9f9]",
          focusRing
        )}
      >
        {modeSheet.aboutLink.label}
      </Link>
    </BottomSheet>
  );
}
