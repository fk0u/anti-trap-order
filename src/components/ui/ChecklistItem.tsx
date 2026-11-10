import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** ChecklistItem — Figma 02 (node 21:160 / 21:163), sama di 06 (S-09). */
export function ChecklistItem({ text, checked, onToggle }: { text: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex w-full items-center gap-ato-12 rounded-ato-sm py-ato-12 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent"
    >
      <span
        aria-hidden
        className={cn(
          "flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-ato-sm border-[1.5px]",
          checked ? "border-ato-lite-accent bg-ato-lite-accent" : "border-ato-border-strong bg-ato-bg-1"
        )}
      >
        {checked && <Check size={16} strokeWidth={1.75} absoluteStrokeWidth color="#ffffff" />}
      </span>
      <span className={cn("min-w-px flex-1 font-ato-ui text-ato-m-body", checked ? "text-ato-text-3" : "text-ato-text-1")}>
        {text}
      </span>
    </button>
  );
}
