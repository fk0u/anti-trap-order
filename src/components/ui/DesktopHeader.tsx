import Link from "next/link";
import { siteNav, type NavId } from "@/content/site";
import { DESKTOP_CONTAINER } from "@/lib/layout";
import { cn } from "@/lib/utils";

/** Tombol solid desktop (02 Button primary, gaya frame BROWSER 06): isi aksen, kilau atas, Gloss Button. */
export const DESKTOP_SOLID = {
  lite: "bg-ato-lite-accent text-white",
  soul: "bg-ato-soul-accent text-white",
} as const;

/**
 * Header desktop — Figma 02 (node 52:235), gaya 06 (instance di frame BROWSER,
 * mis. node 56:8716): bar putih 68px, logo, link Lite/Soul/Tentang, CTA.
 * Hanya tampil mulai breakpoint lg; di bawahnya header mobile/flow tetap dipakai.
 */
/**
 * Varian `landing` (S-01 desktop, frame 56:8549): logo berbayangan keras, CTA
 * gradien `#67e4f7 → putih` bergaris hitam 0.5px. Link di render 06 berwarna
 * pucat (`#97ecfa` / `#ffe469`) dengan kontras jauh di bawah AA; diganti
 * `lite/accent` dan `soul/accent` (keputusan Syafar, 10 Nov 2026).
 */
const LANDING_LINK: Record<NavId, string> = {
  lite: "text-ato-lite-accent",
  soul: "text-ato-soul-accent",
  tentang: "text-ato-lite-accent",
};

export function DesktopHeader({
  active = null,
  cta = "lite",
  variant = "default",
  className,
}: {
  active?: NavId | null;
  cta?: "lite" | "soul";
  variant?: "default" | "landing";
  className?: string;
}) {
  const accent = cta === "soul" ? "text-ato-soul-accent" : "text-ato-lite-accent";
  const action = siteNav.cta[cta];
  const landing = variant === "landing";
  return (
    <header className={cn("relative z-10 hidden w-full bg-ato-bg-1 lg:block", className)}>
      <div className={cn(DESKTOP_CONTAINER, "flex items-center justify-between py-ato-12")}>
        <Link
          href="/"
          className="flex items-center gap-ato-8 rounded-ato-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent"
        >
          <span
            aria-hidden
            className={cn(
              "flex h-8 w-10 items-center justify-center rounded-ato-md border border-ato-lite-accent bg-ato-lite-accent-soft font-ato-console text-ato-console uppercase text-ato-lite-accent",
              landing && "shadow-[3px_1px_0_0_var(--ato-ink)]"
            )}
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
                landing ? LANDING_LINK[l.id] : active === l.id ? accent : "text-ato-text-2 hover:text-ato-text-1"
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={action.href}
            className={cn(
              "relative flex h-11 items-center justify-center overflow-hidden rounded-ato-md px-ato-20 shadow-ato-gloss",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent",
              landing ? "border-[0.5px] border-ato-ink bg-gradient-to-b from-[#67e4f7] to-white text-ato-text-1" : DESKTOP_SOLID[cta]
            )}
          >
            {!landing && (
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[22px] rounded-t-ato-md bg-gradient-to-b from-white/[0.34] to-white/0" />
            )}
            <span className="relative whitespace-nowrap font-ato-ui text-ato-button">{action.label}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
