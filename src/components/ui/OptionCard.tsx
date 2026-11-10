import { cn } from "@/lib/utils";

type OptionCardProps = {
  label: string;
  selected: boolean;
  /** true jika batas pilihan tercapai dan opsi ini belum dipilih. */
  disabled?: boolean;
  onToggle: () => void;
};

/**
 * OptionCard — gaya 06 (S-04, node 56:7110 / 56:7111; desktop node 56:8984: garis
 * terpilih 2px aksen). Tampil seperti radio,
 * tetapi pilihan bisa 1–2 sehingga semantiknya checkbox.
 */
export function OptionCard({ label, selected, disabled = false, onToggle }: OptionCardProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (!disabled) onToggle();
      }}
      className={cn(
        "relative flex w-full items-center gap-ato-12 rounded-[28px] px-[20px] py-ato-16 text-left",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent",
        selected
          ? "border-[0.5px] border-ato-ink bg-gradient-to-b from-[#c2f7ff] to-[#5fdff2] [filter:drop-shadow(0_8px_9px_rgba(13,89,115,0.28))] lg:border-2 lg:border-ato-lite-accent"
          : "border border-ato-border-subtle bg-ato-bg-1 [filter:drop-shadow(0_6px_8px_rgba(13,38,64,0.1))]",
        disabled && "cursor-not-allowed"
      )}
    >
      {selected ? (
        <span aria-hidden className="relative flex size-[22px] shrink-0 items-center justify-center rounded-ato-full border-2 border-ato-lite-accent">
          <span className="size-[10px] rounded-ato-full bg-ato-lite-accent" />
        </span>
      ) : (
        <span aria-hidden className="size-[22px] shrink-0 rounded-ato-full border-2 border-ato-border-strong" />
      )}
      <span className="relative min-w-px flex-1 font-ato-ui text-ato-m-body text-ato-text-1">{label}</span>
      {selected && (
        // Kilau atas (node 75:402)
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[3.5px] top-[2.5px] h-[25px] rounded-[24px] lg:inset-x-[2px] lg:top-px bg-gradient-to-b from-[rgba(255,255,255,0.6)] to-[rgba(255,255,255,0)]"
        />
      )}
    </button>
  );
}
