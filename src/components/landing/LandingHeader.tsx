"use client";

import { useCallback, useState } from "react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { ModeSheet } from "@/components/layout/ModeSheet";
import { landingS01 } from "@/content/landing-s01";

const SHEET_ID = "mode-sheet";

/** Header S-01 + sheet S-02 yang dibuka dari tombol menu. */
export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <SiteHeader
        className="relative z-10"
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
