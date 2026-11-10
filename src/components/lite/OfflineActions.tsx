import { Button, FLOW_GRADIENTS } from "@/components/ui/Button";
import { liteCopy } from "@/content/lite";

/**
 * Dua tombol "koneksi terputus" (S-07 Error node 56:8462, S-19 node 56:8526).
 *
 * TODO(mode terbatas, PR 5): aktifkan "Lanjut mode terbatas" setelah engine
 * lokal v1 + model ML cadangan selesai. Sementara tampil sesuai Figma tetapi nonaktif.
 */
export function OfflineActions({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex w-full flex-col gap-ato-12">
      <Button variant="aqua" gradient={FLOW_GRADIENTS.limited} labelClassName="text-ato-text-1" disabled>
        {liteCopy.offline.limited}
      </Button>
      <Button
        variant="ghost"
        size="md"
        onClick={onRetry}
        labelClassName="bg-gradient-to-b from-ato-lite-accent to-white to-[160%] bg-clip-text text-transparent"
      >
        {liteCopy.offline.retry}
      </Button>
    </div>
  );
}
