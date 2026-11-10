import { Alice, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";

/**
 * Font ATO sesuai Figma "06 | Prototype".
 *
 * Layout root sengaja tidak diubah. Pasang `atoFontVariables` pada wrapper
 * halaman yang memakai token `font-ato-*` (lihat tailwind.config.ts).
 */

/** family/ui — seluruh teks UI. */
export const atoUi = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ato-ui",
});

/**
 * Glyph "→" dan "↻" dari Plus Jakarta Sans (subset Google Fonts `text=`, ±0,7 KB
 * per weight; lisensi OFL di fonts/PlusJakartaSans-OFL.txt). Subset latin
 * Google untuk `atoUi` tidak memuat kedua glyph ini, sehingga "Lanjut →" jatuh
 * ke font sistem. Ditaruh SEBELUM `atoUi` di stack font (tailwind.config.ts);
 * karena hanya berisi dua glyph, huruf lain tetap memakai `atoUi`.
 * `adjustFontFallback: false` wajib: tanpa itu next/font menambah fallback
 * Arial yang akan merebut semua huruf.
 */
export const atoUiArrows = localFont({
  src: [
    { path: "./fonts/PlusJakartaSans-400-arrows.woff2", weight: "400", style: "normal" },
    { path: "./fonts/PlusJakartaSans-600-arrows.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-ato-ui-arrows",
});

/**
 * family/console — label konsol kecil (UPPERCASE, tracking 8%).
 * Di-host sendiri (rilis resmi v2.304, lisensi OFL di fonts/JetBrainsMono-OFL.txt)
 * karena versi Google Fonts tidak punya glyph "→" (U+2192) yang dipakai di
 * logo "A→Ω" dan label "JALUR ALPHA → OMEGA".
 */
export const atoConsole = localFont({
  src: "./fonts/JetBrainsMono-Medium.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
  variable: "--font-ato-console",
});

/** Judul hero S-01 (ukuran dari style Mobile/Display, family Alice di 06). */
export const atoDisplay = Alice({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-ato-display",
});

export const atoFontVariables = [atoUi.variable, atoUiArrows.variable, atoConsole.variable, atoDisplay.variable].join(" ");
