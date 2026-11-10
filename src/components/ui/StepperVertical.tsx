import { cn } from "@/lib/utils";

/**
 * Stepper vertikal desktop — Figma 02 "StepperVertical" (node 55:167), gaya Aero
 * frame desktop 06 terbaru di panel konteks Lite (S-03 node 56:8724, S-05 node
 * 56:9062, S-06 node 56:9150).
 *
 * - Alpha sekarang (S-03): 28px gradien `#78E7F7 → putih`, garis hitam 0.5px, "A" `text/1`.
 * - Selesai: Alpha 28px `#78E7F7` dengan "A" `#04222A`, titik tengah 12px dan garis
 *   sesudahnya `#78E7F7` (S-05/S-06). S-04 di 06 masih memakai aksen pekat lama;
 *   semua langkah memakai warna S-05/S-06 (keputusan desain mandiri).
 * - Sekarang (titik tengah): 18px `lite/accent-soft` bergaris 2px `#78E7F7`; label `text/1`.
 * - Belum: titik 12px `border/strong`, label `text/3`.
 * - Ω: 28px `bg/2` bergaris `border/strong`; saat dicapai (S-07/S-08) terisi
 *   `#78E7F7` seperti Alpha selesai (keputusan desain mandiri).
 *
 * Perataan (keputusan desain mandiri, permintaan Syafar 10 Nov 2026): di Figma
 * kolom titik selebar titiknya sendiri (28 / 12px), jadi titik, garis, dan label
 * bergeser. Di sini semua titik berada di kolom 28px yang sama (pusat x = 14),
 * label mulai di x = 40, setiap titik rata tengah dengan baris labelnya, dan
 * garis menyambung dari pusat titik ke pusat titik berikutnya. Tinggi total sama
 * dengan Figma (188px untuk 5 langkah: jarak antarbaris 40px).
 */
/** Warna langkah selesai di frame desktop 06 terbaru (S-05/S-06). */
const DONE_BG = "bg-[#78e7f7]";

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
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-ato-full font-ato-console text-ato-console uppercase",
                now ? "border-[0.5px] border-ato-ink bg-gradient-to-b from-[#78e7f7] to-white text-ato-text-1" : cn(DONE_BG, "text-[#04222a]")
              )}
            >
              A
            </span>
          );
        } else if (i === last) {
          dot = (
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-ato-full font-ato-console text-ato-console uppercase",
                now || done ? cn(DONE_BG, "text-[#04222a]") : "border border-ato-border-strong bg-ato-bg-2 text-ato-text-3"
              )}
            >
              Ω
            </span>
          );
        } else if (now) {
          dot = <span className="size-[18px] rounded-ato-full border-2 border-[#78e7f7] bg-ato-lite-accent-soft" />;
        } else {
          dot = <span className={cn("size-3 rounded-ato-full", done ? DONE_BG : "bg-ato-border-strong")} />;
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
                className={cn("absolute left-[13px] top-[14px] h-full w-[2px]", lineOn ? DONE_BG : "bg-ato-border-strong")}
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
