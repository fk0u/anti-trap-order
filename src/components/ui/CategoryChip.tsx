import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryChipProps = {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onClick: () => void;
};

/**
 * CategoryChip — gaya 06 (S-03, node 56:6856 / 56:6947): pil 44px dengan
 * bayangan keras. Terpilih: gradien `#C2F7FF → #5FDFF2`, border hitam 0.5px.
 */
export function CategoryChip({ icon: Icon, label, selected, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex h-11 shrink-0 items-center justify-center gap-ato-8 rounded-ato-full px-ato-16 [filter:drop-shadow(2px_3px_0_var(--ato-ink))]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent",
        selected
          ? "border-[0.5px] border-ato-ink bg-gradient-to-b from-[#c2f7ff] to-[#5fdff2]"
          : "border border-ato-border-subtle bg-ato-bg-1"
      )}
    >
      <Icon
        aria-hidden
        size={20}
        strokeWidth={1.75}
        absoluteStrokeWidth
        color={selected ? "var(--ato-lite-accent)" : "var(--ato-text-2)"}
        className="shrink-0"
      />
      <span className={cn("whitespace-nowrap font-ato-ui text-ato-caption", selected ? "text-ato-lite-accent" : "text-ato-text-2")}>
        {label}
      </span>
    </button>
  );
}
