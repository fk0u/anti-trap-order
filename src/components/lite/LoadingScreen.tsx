"use client";

import { WifiOff } from "lucide-react";
import { StepperAlphaOmega } from "@/components/ui/StepperAlphaOmega";
import { LiteScreen, StatusIcon } from "@/components/lite/LiteShell";
import { OfflineActions } from "@/components/lite/OfflineActions";
import { liteCopy } from "@/content/lite";

export type LoadingState = "waiting" | "slow" | "error";
export type SimulateKind = "network" | "apiDown" | "server" | "tooFast";

/** Tombol "Simulasi uji" di 06 adalah alat uji prototype: hanya untuk development. */
const SHOW_SIMULATE = process.env.NODE_ENV === "development";

type LoadingScreenProps = {
  state: LoadingState;
  onRetry: () => void;
  onSimulate: (kind: SimulateKind) => void;
};

/** S-07 Loading — Figma 06: Default (56:7268), Lambat 3s (56:8425), Error (56:8446). */
export function LoadingScreen({ state, onRetry, onSimulate }: LoadingScreenProps) {
  const copy = liteCopy.loading;
  return (
    <LiteScreen className="items-center justify-center px-ato-24">
      {/* Cahaya bawah (node 149:5427) — hanya di state Default/Lambat, tidak ada di Error. */}
      {state !== "error" && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[106px] bg-gradient-to-b from-white to-[#8ce9f8]" />
      )}

      {state === "error" ? (
        <div role="alert" className="relative flex w-full flex-col items-center gap-ato-24">
          <StatusIcon>
            <WifiOff size={40} strokeWidth={1.75} color="var(--ato-text-2)" />
          </StatusIcon>
          <h1 className="w-full text-center font-ato-ui text-ato-m-h2 text-ato-text-1">{liteCopy.offline.title}</h1>
          <p className="w-full text-center font-ato-ui text-ato-m-body text-ato-text-2">{liteCopy.offline.body}</p>
          <OfflineActions onRetry={onRetry} />
        </div>
      ) : (
        <div role="status" aria-live="polite" className="relative flex w-full flex-col items-center gap-ato-24">
          <StepperAlphaOmega variant="flow" step={2} />
          {state === "slow" ? (
            <h1 className="w-full text-center font-ato-ui text-ato-m-h2 text-ato-text-1">{copy.title}</h1>
          ) : (
            <h1 className="w-full bg-gradient-to-b from-ato-lite-accent from-[0.862%] to-white to-[150%] bg-clip-text text-center font-ato-ui text-ato-m-h2 text-transparent">
              {copy.title}
            </h1>
          )}
          <p className="w-full text-center font-ato-ui text-ato-m-body text-ato-text-2">{copy.body}</p>
          {state === "slow" && (
            <p className="rounded-ato-full border border-ato-border-subtle bg-ato-bg-1 px-ato-16 font-ato-ui text-ato-caption text-ato-text-2 shadow-ato-glass backdrop-blur-[12px]">
              {copy.slow}
            </p>
          )}
        </div>
      )}

      {SHOW_SIMULATE && (
        <div className="absolute inset-x-0 bottom-[26px] flex flex-col items-center gap-[6px]">
          {(Object.keys(copy.simulate) as SimulateKind[]).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => onSimulate(kind)}
              className="font-ato-ui text-ato-caption text-ato-text-3 underline-offset-2 hover:underline"
            >
              {copy.simulate[kind]}
            </button>
          ))}
        </div>
      )}
    </LiteScreen>
  );
}
