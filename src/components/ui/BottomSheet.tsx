"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Bottom sheet — Figma 02 "Sheet" (node 52:300), gaya mengikuti 06 (S-02, node 56:8395).
 * Scrim di 06 berwarna `text/1` penuh (tidak transparan).
 */
export function BottomSheet({ open, onClose, id, title, children, className }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = `${id}-title`;

  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    sheet?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !sheet) return;
      const items = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div aria-hidden className="absolute inset-0 bg-ato-text-1" onClick={onClose} />
      <div
        ref={sheetRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex w-full flex-col gap-ato-16 overflow-hidden rounded-t-ato-lg bg-ato-bg-1 px-ato-20 pb-ato-32 pt-ato-12",
          "shadow-ato-glass-strong backdrop-blur-[20px]",
          className
        )}
      >
        <div aria-hidden className="flex w-full justify-center">
          <span className="h-1 w-10 rounded-ato-full bg-ato-border-strong" />
        </div>
        <div className="flex w-full items-center justify-between">
          <h2 id={titleId} className="font-ato-ui text-ato-m-h2 text-ato-text-1">
            {title}
          </h2>
          <IconButton variant="soft" aria-label="Tutup" onClick={onClose}>
            <X aria-hidden size={20} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-text-1)" />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}
