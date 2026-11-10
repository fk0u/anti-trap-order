"use client";

import { WifiOff } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { liteCopy } from "@/content/lite";
import { OfflineActions } from "@/components/lite/OfflineActions";
import { StatusIcon } from "@/components/lite/LiteShell";

const SHEET_ID = "lite-api-down";

/** S-19 API down (sheet) — Figma 06 node 56:8512. */
export function ApiDownSheet({ open, onClose, onRetry }: { open: boolean; onClose: () => void; onRetry: () => void }) {
  return (
    <BottomSheet id={SHEET_ID} open={open} onClose={onClose} title={liteCopy.offline.title} headerless className="items-center">
      <StatusIcon size={72}>
        <WifiOff size={36} strokeWidth={1.75} color="var(--ato-text-2)" />
      </StatusIcon>
      <h2 id={`${SHEET_ID}-title`} className="w-full text-center font-ato-ui text-ato-m-h2 text-ato-text-1">
        {liteCopy.offline.title}
      </h2>
      <p className="w-full text-center font-ato-ui text-ato-m-body text-ato-text-2">{liteCopy.offline.body}</p>
      <OfflineActions onRetry={onRetry} />
    </BottomSheet>
  );
}
