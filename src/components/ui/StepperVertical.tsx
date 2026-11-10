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
 *
 * Perataan (keputusan desain mandiri, permintaan Syafar 10 Nov 2026): di Figma
 * kolom titik selebar titiknya sendiri (28 / 12px), jadi titik, garis, dan label
 * bergeser. Di sini semua titik berada di kolom 28px yang sama (pusat x = 14),
 * label mulai di x = 40, setiap titik rata tengah dengan baris labelnya, dan
 * garis menyambung dari pusat titik ke pusat titik berikutnya. Tinggi total sama
 * dengan Figma (188px untuk 5 langkah: jarak antarbaris 40px).
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
          <li
            key={label}
            aria-current={now ? "step" : undefined}
            className={cn("relative flex w-full items-start gap-ato-12", i < last && "pb-ato-12")}
          >
            {/* Garis: dari pusat titik ini (y = 14) sampai pusat titik berikutnya (tinggi baris = 28 + 12). */}
            {i < last && (
              <span
                aria-hidden
                className={cn("absolute left-[13px] top-[14px] h-full w-[2px]", lineOn ? "bg-ato-lite-accent" : "bg-ato-border-strong")}
              />
            )}
            <span aria-hidden className="relative flex size-7 shrink-0 items-center justify-center">
              {dot}
            </span>
            <span className={cn("flex min-h-7 min-w-px flex-1 items-center font-ato-ui text-ato-d-body", now ? "text-ato-text-1" : "text-ato-text-3")}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
