/**
 * Breakpoint layout ATO (keputusan Syafar, 10 Nov 2026):
 * - < 768 (mobile): Figma 06 mobile, tidak diubah.
 * - 768–1023 (tablet, tanpa desain): layout mobile, kolom konten maks. 560px di tengah.
 * - ≥ 1024 (lg): layout desktop Figma 06 (frame BROWSER 1440).
 */

/** Kolom konten tablet: layout mobile, maks. 560px di tengah. */
export const TABLET_COLUMN = "md:max-lg:mx-auto md:max-lg:w-full md:max-lg:max-w-[560px]";

/** Container desktop: konten 1120px di tengah (margin 160 di 1440), padding 32 di layar lebih sempit. */
export const DESKTOP_CONTAINER = "lg:mx-auto lg:w-full lg:max-w-[1184px] lg:px-ato-32";
