import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge perlu tahu token kustom `ato-*` (tailwind.config.ts).
 * Tanpa ini, `text-ato-m-body` (ukuran) dianggap warna dan dibuang saat
 * digabung dengan `text-ato-text-1`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "ato-m-display",
        "ato-m-h1",
        "ato-m-h2",
        "ato-m-h3",
        "ato-m-body-l",
        "ato-m-body",
        "ato-caption",
        "ato-console",
        "ato-button",
        "ato-d-display",
        "ato-d-h1",
        "ato-d-h2",
        "ato-d-h3",
        "ato-d-body-l",
        "ato-d-body",
      ],
      radius: ["ato-sm", "ato-md", "ato-lg", "ato-full"],
      shadow: ["ato-glass", "ato-glass-strong", "ato-gloss", "ato-hard-sm", "ato-hard-md", "ato-hard-lg"],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
