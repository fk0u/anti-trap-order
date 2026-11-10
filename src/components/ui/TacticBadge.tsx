import { cn } from "@/lib/utils";

type TacticBadgeProps = {
  tone?: "found" | "missed";
  /** Ikon 16×16 (mis. ikon Lucide dengan strokeWidth 1.75). */
  icon?: React.ReactNode;
  label: string;
  className?: string;
};

/** TacticBadge — Figma 02 (node 21:52 / 21:58), sama dengan pemakaian di 06. */
export function TacticBadge({ tone = "found", icon, label, className }: TacticBadgeProps) {
  const isFound = tone === "found";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-ato-full border px-ato-12",
        isFound ? "border-ato-lite-accent bg-ato-lite-accent-soft" : "border-ato-border-strong bg-ato-bg-1",
        className
      )}
    >
      {icon && (
        <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span
        className={cn(
          "whitespace-nowrap font-ato-ui text-ato-caption",
          isFound ? "text-ato-lite-accent" : "text-ato-text-2"
        )}
      >
        {label}
      </span>
    </span>
  );
}
