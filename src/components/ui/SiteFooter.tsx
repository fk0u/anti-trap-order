import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

type FooterLink = { label: string; href: string; external?: boolean };

type SiteFooterProps = {
  /** [kalimat utama (text/2), kalimat kedua (text/3)] */
  lines: readonly [string, string] | readonly string[];
  links: readonly FooterLink[];
  className?: string;
};

const linkClass =
  "text-ato-text-2 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent";

/** Footer mobile — Figma 02 (node 52:248), gaya mengikuti 06 (S-01, node 56:6792). */
export function SiteFooter({ lines, links, className }: SiteFooterProps) {
  const [primary, secondary] = lines;
  return (
    <footer
      className={cn(
        "flex flex-col items-start gap-ato-12 border-t border-ato-border-subtle bg-gradient-to-b from-white to-ato-footer-glow",
        "px-ato-16 pb-ato-32 pt-ato-24 font-ato-ui text-ato-caption",
        className
      )}
    >
      <div className="flex flex-col">
        <p className="text-ato-text-2">{primary}</p>
        {secondary && <p className="text-ato-text-3">{secondary}</p>}
      </div>
      <nav className="flex items-center gap-ato-8">
        {links.map((link, i) => (
          <Fragment key={link.href}>
            {i > 0 && (
              <span aria-hidden className="text-ato-text-3">
                ·
              </span>
            )}
            {link.external ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className={linkClass}>
                {link.label}
              </Link>
            )}
          </Fragment>
        ))}
      </nav>
    </footer>
  );
}
