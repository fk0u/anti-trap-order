import { cn } from "@/lib/utils";

type SegmentedProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
};

/** Segmented (Santai | Tegas) — Figma 02 (node 21:173), sama di 06 (S-09). */
export function Segmented<T extends string>({ options, value, onChange, ...rest }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={rest["aria-label"]}
      className="flex h-11 w-full items-stretch gap-ato-4 rounded-ato-md border border-ato-border-subtle bg-ato-bg-1 p-ato-4"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex min-w-px flex-1 items-center justify-center rounded-ato-sm font-ato-ui text-ato-button",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ato-lite-accent",
              active ? "border border-ato-lite-accent bg-ato-lite-accent-soft text-ato-lite-accent" : "text-ato-text-2"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
