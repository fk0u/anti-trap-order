"use client";

import { useEffect, useRef, useState } from "react";
import { Hourglass } from "lucide-react";
import { Button, FLOW_GRADIENTS } from "@/components/ui/Button";
import { liteCopy } from "@/content/lite";
import { StatusIcon } from "@/components/lite/LiteShell";

const format = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/**
 * S-20 Rate limited — Figma 06 node 56:8532. Hitung mundur dari `Retry-After`.
 * "OK" menutup pesan (catatan wireframe: "Tombol OK menutup pesan").
 */
export function RateLimitScreen({ seconds, onClose }: { seconds: number; onClose: () => void }) {
  const [left, setLeft] = useState(seconds);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      ref={rootRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="lite-rate-title"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-ato-bg-0"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-ato-sky to-[rgba(95,227,247,0)]"
      />
      <div className="relative flex w-full flex-col items-center gap-ato-24 px-ato-24">
        <StatusIcon>
          <Hourglass size={40} strokeWidth={1.75} color="var(--ato-lite-accent)" />
        </StatusIcon>
        <h2 id="lite-rate-title" className="w-full text-center font-ato-ui text-ato-m-h2 text-ato-text-1">
          {liteCopy.rateLimited.title(seconds)}
        </h2>
        <p
          role="timer"
          aria-live="off"
          className="rounded-ato-full border border-ato-lite-accent bg-ato-lite-accent-soft px-ato-24 py-ato-12 font-ato-ui text-[20px] font-semibold leading-[28px] text-ato-lite-accent"
        >
          {format(left)}
        </p>
        <Button variant="aqua" gradient={FLOW_GRADIENTS.ok} labelClassName="text-ato-text-1" onClick={onClose}>
          {liteCopy.rateLimited.ok}
        </Button>
      </div>
    </div>
  );
}
