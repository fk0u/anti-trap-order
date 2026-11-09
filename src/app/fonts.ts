import { Alice, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

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

/** family/console — label konsol kecil (UPPERCASE, tracking 8%). */
export const atoConsole = JetBrains_Mono({
  subsets: ["latin", "greek"], // greek: huruf Ω di logo & stepper A→Ω
  weight: ["500"],
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

export const atoFontVariables = [atoUi.variable, atoConsole.variable, atoDisplay.variable].join(" ");
