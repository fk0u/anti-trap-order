"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  id: string;
  title: string;
  /**
   * true = tanpa baris judul + tombol tutup (mis. S-19). Isi sheet wajib
   * memuat elemen judul dengan id `${id}-title` untuk aria-labelledby.
   */
  headerless?: boolean;
  /**
   * false = ketuk area gelap tidak menutup sheet (mis. S-19, supaya tidak
   * tertutup tanpa sengaja). Esc tetap menutup.
   */
  dismissOnScrim?: boolean;
  children: React.ReactNode;
  className?: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Durasi animasi masuk/keluar (ms). Harus sama dengan `duration-300` di bawah. */
const ANIMATION_MS = 300;

/**
 * Bottom sheet — Figma 02 "Sheet" (node 52:300), gaya mengikuti 06 (S-02, node 56:8395).
 *
 * Menyimpang dari 06 atas permintaan Syafar (9 Nov 2026): scrim di 06 `text/1`
 * pekat penuh sehingga terasa seperti pindah halaman. Di sini scrim 50% agar
 * halaman tetap terlihat, dan sheet meluncur dari bawah.
 */
export function BottomSheet({
  open,
  onClose,
  id,
  title,
  headerless = false,
  dismissOnScrim = true,
  children,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = `${id}-title`;
  // `mounted`: elemen ada di DOM; `shown`: posisi akhir animasi (terlihat).
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Dua frame: pastikan posisi awal (di bawah layar) sudah dirender sebelum transisi.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), ANIMATION_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || !mounted) return;
    const sheet = sheetRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    sheet?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });

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
      previous?.focus({ preventScroll: true });
    };
  }, [open, mounted, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        aria-hidden
        onClick={dismissOnScrim ? onClose : undefined}
        className={cn(
          "absolute inset-0 bg-ato-text-1 transition-opacity duration-300 ease-out",
          shown ? "opacity-50" : "opacity-0"
        )}
      />
      <div
        ref={sheetRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex w-full flex-col gap-ato-16 overflow-hidden rounded-t-ato-lg bg-ato-bg-1 px-ato-20 pb-ato-32 pt-ato-12",
          "shadow-ato-glass-strong backdrop-blur-[20px]",
          "transition-transform duration-300 ease-out",
          shown ? "translate-y-0" : "translate-y-full",
          className
        )}
      >
        <div aria-hidden className="flex w-full justify-center">
          <span className="h-1 w-10 rounded-ato-full bg-ato-border-strong" />
        </div>
        {!headerless && (
          <div className="flex w-full items-center justify-between">
            <h2 id={titleId} className="font-ato-ui text-ato-m-h2 text-ato-text-1">
              {title}
            </h2>
            <IconButton variant="soft" aria-label="Tutup" onClick={onClose}>
              <X aria-hidden size={20} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-text-1)" />
            </IconButton>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
