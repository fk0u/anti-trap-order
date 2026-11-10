"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type OtherOptionProps = {
  label: string;
  placeholder: string;
  maxLength: number;
  expanded: boolean;
  value: string;
  onToggle: () => void;
  onChange: (value: string) => void;
};

/**
 * OtherOption "Lainnya".
 * - Tertutup: gaya 06 (S-04, node 56:7115) — garis putus-putus.
 * - Terbuka/terisi: tidak ada di 06, memakai 02 (node 52:66 / 52:73).
 *
 * Isi teks hanya disimpan di browser; ke server cukup `other_filled: true`.
 */
export function OtherOption({ label, placeholder, maxLength, expanded, value, onToggle, onChange }: OtherOptionProps) {
  const inputId = useId();
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-ato-12 rounded-ato-md p-ato-16",
        expanded
          ? "border-[1.5px] border-ato-lite-accent bg-ato-lite-accent-soft"
          : "border border-dashed border-ato-border-strong"
      )}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={expanded ? inputId : undefined}
        onClick={onToggle}
        className="flex w-full items-center gap-ato-12 rounded-ato-sm text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ato-lite-accent"
      >
        <span aria-hidden className="whitespace-nowrap font-ato-console text-ato-console uppercase text-ato-lite-accent">
          {expanded ? "−" : "+"}
        </span>
        <span className={cn("min-w-px flex-1 font-ato-ui text-ato-m-body", expanded ? "text-ato-text-1" : "text-ato-text-2")}>
          {label}
        </span>
      </button>
      {expanded && (
        <>
          <input
            id={inputId}
            type="text"
            value={value}
            maxLength={maxLength}
            placeholder={placeholder}
            autoComplete="off"
            aria-label={label}
            onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
            className="w-full rounded-ato-md border border-ato-lite-accent bg-ato-bg-1 px-ato-16 py-ato-12 font-ato-ui text-ato-m-body text-ato-text-1 placeholder:text-ato-text-3 focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-ato-lite-accent"
          />
          <p aria-live="polite" className="w-full text-right font-ato-ui text-ato-caption text-ato-text-3">
            {value.length}/{maxLength}
          </p>
        </>
      )}
    </div>
  );
}
