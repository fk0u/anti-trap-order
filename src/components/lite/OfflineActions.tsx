import { Button, FLOW_GRADIENTS } from "@/components/ui/Button";
import { liteCopy } from "@/content/lite";

/**
 * Dua tombol "koneksi terputus" (S-07 Error node 56:8462, S-19 node 56:8526).
 *
 * "Lanjut mode terbatas" aktif jika `onLimited` diberikan (Lite: mesin lokal di
 * `src/lib/offline/`). Tanpa `onLimited` (Soul, jawaban Syafar no. 12) tombol
 * tampil sesuai Figma tetapi nonaktif.
 */
export function OfflineActions({ onRetry, onLimited }: { onRetry: () => void; onLimited?: () => void }) {
  return (
    <div className="flex w-full flex-col gap-ato-12">
      <Button variant="aqua" desktop="lite" gradient={FLOW_GRADIENTS.limited} labelClassName="text-ato-text-1" className="lg:w-full" disabled={!onLimited} onClick={onLimited}>
        {liteCopy.offline.limited}
      </Button>
      <Button
        variant="ghost"
        size="md"
        desktop="ghost"
        className="lg:w-full"
        onClick={onRetry}
        labelClassName="bg-gradient-to-b from-ato-lite-accent to-white to-[160%] bg-clip-text text-transparent"
      >
        {liteCopy.offline.retry}
      </Button>
    </div>
  );
}
