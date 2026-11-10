/**
 * URL publik situs. Diatur lewat NEXT_PUBLIC_SITE_URL saat build (mis. di
 * `.env.production` di server) supaya pindah domain tidak perlu mengubah kode.
 * Default: domain yang pasti hidup.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ato.kousozo.tech").replace(/\/$/, "");
export const SITE_HOST = new URL(SITE_URL).host;
