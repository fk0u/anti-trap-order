"use client";

import { useCallback, useState } from "react";
import { DesktopHeader } from "@/components/ui/DesktopHeader";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { ModeSheet } from "@/components/layout/ModeSheet";
import { landingS01 } from "@/content/landing-s01";
import type { NavId } from "@/content/site";
import { TABLET_COLUMN } from "@/lib/layout";
import { cn } from "@/lib/utils";

const SHEET_ID = "mode-sheet";

/**
 * Header S-01 + sheet S-02 yang dibuka dari tombol menu (mobile/tablet).
 * Desktop: header bar dengan link nav (S-02 tidak dipakai, perannya diganti nav).
 */
export function LandingHeader({ active = null }: { active?: NavId | null }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <DesktopHeader active={active} />
      <SiteHeader
        className={cn("relative z-10 lg:hidden", TABLET_COLUMN)}
        logoMark={landingS01.header.logoMark}
        brand={landingS01.header.brand}
        onMenuClick={() => setOpen(true)}
        menuExpanded={open}
        menuControls={SHEET_ID}
      />
      <ModeSheet id={SHEET_ID} open={open} onClose={close} />
    </>
  );
}
