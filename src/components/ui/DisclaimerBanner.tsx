import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** DisclaimerBanner Tone=info — Figma 02 (node 21:34), sama di 06 (S-03, S-08). */
export function DisclaimerBanner({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-ato-8 rounded-ato-md border border-ato-border-subtle bg-ato-bg-1 p-ato-12",
        className
      )}
    >
      <Info aria-hidden size={16} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-text-3)" className="shrink-0" />
      <p className="min-w-px flex-1 font-ato-ui text-ato-caption text-ato-text-2">{children}</p>
    </div>
  );
}
