import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/IconButton";

type SiteHeaderProps = {
  logoMark: string;
  brand: string;
  onMenuClick: () => void;
  menuExpanded: boolean;
  menuControls: string;
  className?: string;
};

/** Header mobile — Figma 02 (node 52:225), gaya mengikuti 06 (S-01, node 56:6731). */
export const SiteHeader = forwardRef<HTMLButtonElement, SiteHeaderProps>(function SiteHeader(
  { logoMark, brand, onMenuClick, menuExpanded, menuControls, className },
  menuRef
) {
  return (
    <header className={cn("flex items-center justify-between px-ato-16 py-ato-12", className)}>
      <Link href="/" className="flex items-center gap-ato-8 rounded-ato-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent">
        <span
          aria-hidden
          className="flex h-8 w-10 shrink-0 items-center justify-center overflow-hidden rounded-ato-md border border-ato-lite-accent bg-ato-lite-accent-soft font-ato-console text-ato-console uppercase text-ato-lite-accent shadow-ato-hard-sm"
        >
          {logoMark}
        </span>
        <span className="whitespace-nowrap font-ato-ui text-ato-m-h3 text-ato-text-1">{brand}</span>
      </Link>

      <IconButton
        ref={menuRef}
        variant="aero"
        aria-label="Menu"
        aria-haspopup="dialog"
        aria-expanded={menuExpanded}
        aria-controls={menuControls}
        onClick={onMenuClick}
      >
        <span aria-hidden className="flex flex-col gap-ato-4">
          <span className="h-[2px] w-[18px] bg-ato-text-1" />
          <span className="h-[2px] w-[18px] bg-ato-text-1" />
          <span className="h-[2px] w-[18px] bg-ato-text-1" />
        </span>
      </IconButton>
    </header>
  );
});
