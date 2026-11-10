import { cn } from "@/lib/utils";

/**
 * Stepper vertikal desktop — Figma 02 "StepperVertical" (node 55:167), gaya 06
 * di panel konteks Lite desktop (S-03 node 56:8724, S-04 node 56:8972).
 *
 * - Selesai: Alpha 28px aksen "A"; titik tengah 12px aksen (keputusan desain
 *   mandiri — 06 hanya menggambar Alpha selesai), garis sesudahnya aksen.
 * - Sekarang: Alpha 28px aksen, atau titik 18px `lite/accent-soft` + garis 2px aksen; label `text/1`.
 * - Belum: titik 12px `border/strong`, label `text/3`.
 * - Ω: 28px `bg/2` bergaris `border/strong`; saat dicapai (S-07/S-08) terisi aksen
 *   seperti stepper horizontal S-08 desktop (keputusan desain mandiri).
 */
export function StepperVertical({ steps, current, className }: { steps: readonly string[]; current: number; className?: string }) {
  const last = steps.length - 1;
  return (
    <ol className={cn("flex w-full flex-col", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const now = i === current;
        const lineOn = i < current;
        let dot: React.ReactNode;
        if (i === 0) {
          dot = (
            <span className="flex size-7 items-center justify-center rounded-ato-full bg-ato-lite-accent font-ato-console text-ato-console uppercase text-white">
              A
            </span>
          );
        } else if (i === last) {
          dot = (
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-ato-full font-ato-console text-ato-console uppercase",
                now || done ? "bg-ato-lite-accent text-white" : "border border-ato-border-strong bg-ato-bg-2 text-ato-text-3"
              )}
            >
              Ω
            </span>
          );
        } else if (now) {
          dot = <span className="size-[18px] rounded-ato-full border-2 border-ato-lite-accent bg-ato-lite-accent-soft" />;
        } else {
          dot = <span className={cn("size-3 rounded-ato-full", done ? "bg-ato-lite-accent" : "bg-ato-border-strong")} />;
        }
        return (
          <li key={label} aria-current={now ? "step" : undefined} className="flex w-full items-start gap-ato-12">
            <span aria-hidden className="flex shrink-0 flex-col items-center">
              {dot}
              {i < last && <span className={cn("h-6 w-[2px]", lineOn ? "bg-ato-lite-accent" : "bg-ato-border-strong")} />}
            </span>
            <span className={cn("min-w-px flex-1 font-ato-ui text-ato-d-body", now ? "text-ato-text-1" : "text-ato-text-3")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
