import Link from "next/link";
import { siteNav, type NavId } from "@/content/site";
import { DESKTOP_CONTAINER } from "@/lib/layout";
import { cn } from "@/lib/utils";

/**
 * Header desktop — gaya Aero frame BROWSER 06 terbaru (instance mis. node 214:4934
 * di S-03, 214:5488 di S-10), sama di semua layar: bar putih 68px, logo berbayangan
 * keras `3px 1px 0 #000`, link Lite/Soul/Tentang, CTA gradien bergaris hitam 0.5px
 * dengan label `text/1` (Lite/Tentang/Privasi/landing `#67e4f7 → putih`, Soul
 * `#ffda37 → putih`). Hanya tampil mulai breakpoint lg.
 *
 * Link di render 06 putih/pucat bergaris luar (kontras jauh di bawah AA); diganti
 * `lite/accent` dan `soul/accent` (keputusan Syafar, 10 Nov 2026). 06 tidak
 * membedakan link aktif secara visual; halaman aktif hanya ditandai `aria-current`.
 */
const LINK_COLOR: Record<NavId, string> = {
  lite: "text-ato-lite-accent",
  soul: "text-ato-soul-accent",
  tentang: "text-ato-lite-accent",
};

const CTA_GRADIENT = {
  lite: "from-[#67e4f7]",
  soul: "from-[#ffda37]",
} as const;

export function DesktopHeader({
  active = null,
  cta = "lite",
  className,
}: {
  active?: NavId | null;
  cta?: "lite" | "soul";
  className?: string;
}) {
  const action = siteNav.cta[cta];
  return (
    <header className={cn("relative z-10 hidden w-full bg-ato-bg-1 lg:block", className)}>
      <div className={cn(DESKTOP_CONTAINER, "flex items-center justify-between py-ato-12")}>
        <Link
          href="/"
          className="flex items-center gap-ato-8 rounded-ato-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent"
        >
          <span
            aria-hidden
            className="flex h-8 w-10 items-center justify-center rounded-ato-md border border-ato-lite-accent bg-ato-lite-accent-soft font-ato-console text-ato-console uppercase text-ato-lite-accent shadow-[3px_1px_0_0_var(--ato-ink)]"
          >
            {siteNav.logoMark}
          </span>
          <span className="whitespace-nowrap font-ato-ui text-ato-m-h3 text-ato-text-1">{siteNav.brand}</span>
        </Link>
        <nav aria-label="Utama" className="flex items-center gap-ato-32">
          {siteNav.links.map((l) => (
            <Link
              key={l.id}
              href={l.href}
              aria-current={active === l.id ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-ato-sm font-ato-ui text-ato-d-body focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent",
                LINK_COLOR[l.id]
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={action.href}
            className={cn(
              "relative flex h-11 items-center justify-center overflow-hidden rounded-ato-md border-[0.5px] border-ato-ink bg-gradient-to-b to-white px-ato-20 text-ato-text-1 shadow-ato-gloss",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent",
              CTA_GRADIENT[cta]
            )}
          >
            <span className="relative whitespace-nowrap font-ato-ui text-ato-button">{action.label}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
