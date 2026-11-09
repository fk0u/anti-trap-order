import { cn } from "@/lib/utils";

type ConsoleLabelProps = {
  as?: "p" | "span" | "h2" | "h3";
  /** Warna dari token ATO; default aksen Lite. */
  tone?: "lite" | "soul" | "text-1" | "text-3";
  className?: string;
  id?: string;
  children: React.ReactNode;
};

const toneClass = {
  lite: "text-ato-lite-accent",
  soul: "text-ato-soul-accent",
  "text-1": "text-ato-text-1",
  "text-3": "text-ato-text-3",
} as const;

/** Label konsol kecil — style Figma "ATO/Console label" (JetBrains Mono 12/18, UPPERCASE, tracking 8%). */
export function ConsoleLabel({ as: Tag = "p", tone = "lite", className, id, children }: ConsoleLabelProps) {
  return (
    <Tag id={id} className={cn("font-ato-console text-ato-console uppercase", toneClass[tone], className)}>
      {children}
    </Tag>
  );
}
