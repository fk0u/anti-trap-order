import { cn } from "@/lib/utils";
import { iconFor } from "@/lib/icons";
import { TacticBadge } from "@/components/ui/TacticBadge";
import type { TacticRef } from "@/types/api-v1";

type GapCardProps = {
  kind: "found" | "missed";
  tactic: TacticRef;
  /** Baris kecil di bawah badge ("Kamu menyebut: '…'" / "Yang mungkin belum kepikiran"). */
  note: string;
  explanation: string;
  counterLabel: string;
  counter: string;
};

/** GapCard Kind=found / Kind=missed — Figma 02 (node 21:132 / 21:144), gaya 06 (S-08). */
export function GapCard({ kind, tactic, note, explanation, counterLabel, counter }: GapCardProps) {
  const found = kind === "found";
  const Icon = iconFor(tactic.icon);
  return (
    <article
      className={cn(
        "relative flex w-full flex-col gap-ato-12 rounded-ato-lg border bg-ato-bg-1 p-ato-20",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] [filter:drop-shadow(0_12px_16px_rgba(13,23,33,0.08))]",
        found ? "border-ato-lite-accent" : "border-ato-border-subtle"
      )}
    >
      <TacticBadge
        tone={found ? "found" : "missed"}
        label={tactic.label}
        icon={
          <Icon
            size={16}
            strokeWidth={1.75}
            absoluteStrokeWidth
            color={found ? "var(--ato-lite-accent)" : "var(--ato-text-2)"}
          />
        }
        className="self-start"
      />
      <p className="font-ato-ui text-ato-caption text-ato-text-3">{note}</p>
      <p className="font-ato-ui text-ato-m-body text-ato-text-1">{explanation}</p>
      <div className={cn("flex w-full flex-col gap-ato-4 rounded-ato-sm p-ato-12", found ? "bg-ato-lite-accent-soft" : "bg-ato-bg-1")}>
        <p className={cn("font-ato-console text-ato-console uppercase", found ? "text-ato-lite-accent" : "text-ato-text-3")}>
          {counterLabel}
        </p>
        <p className="font-ato-ui text-ato-m-body text-ato-text-1">{counter}</p>
      </div>
    </article>
  );
}
