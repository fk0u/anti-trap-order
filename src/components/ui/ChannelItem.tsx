import { Info } from "lucide-react";

const mixWarning = (pct: number) => `color-mix(in srgb, var(--ato-warning) ${pct}%, #ffffff)`;

type ChannelItemProps = {
  name: string;
  note: string;
  status: "placeholder" | "verified";
  /** Teks badge status placeholder ("Menunggu verifikasi"). */
  pendingLabel: string;
  url?: string | null;
};

/**
 * ChannelItem — gaya 06 (S-09, node 56:7396). Warna diambil dari render 06:
 * kode ekspor kehilangan opacity (tertulis `warning` pekat, tampil peach).
 * Varian `verified` belum ada di 06; sementara tampil tanpa badge dan dengan
 * tautan bila ada `url` (tautan hanya untuk kanal yang sudah diverifikasi).
 */
export function ChannelItem({ name, note, status, pendingLabel, url }: ChannelItemProps) {
  const pending = status === "placeholder";
  return (
    <div
      className="flex w-full flex-col gap-ato-8 overflow-hidden rounded-ato-md border p-ato-16"
      style={{ backgroundColor: mixWarning(8), borderColor: mixWarning(40) }}
    >
      {pending && (
        <span
          className="inline-flex items-center self-start rounded-ato-full py-ato-4 font-ato-ui text-ato-caption text-ato-warning"
          style={{ backgroundColor: mixWarning(21) }}
        >
          <Info aria-hidden size={14} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-warning)" className="shrink-0" />
          {pendingLabel}
        </span>
      )}
      {!pending && url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-ato-ui text-ato-m-h3 text-ato-text-1 underline underline-offset-2"
        >
          {name}
        </a>
      ) : (
        <p className="font-ato-ui text-ato-m-h3 text-ato-text-1">{name}</p>
      )}
      <p className="font-ato-ui text-ato-caption text-ato-text-2">{note}</p>
    </div>
  );
}
