"use client";

import { useEffect, useState } from "react";
import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { Button, FLOW_GRADIENTS } from "@/components/ui/Button";
import { ChannelItem } from "@/components/ui/ChannelItem";
import { ChecklistItem } from "@/components/ui/ChecklistItem";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { Segmented } from "@/components/ui/Segmented";
import { FlowTop, LiteScreen } from "@/components/lite/LiteShell";
import { liteCopy } from "@/content/lite";
import { cn } from "@/lib/utils";
import type { ActionCard } from "@/types/api-v1";

const copy = liteCopy.action;
type Tone = (typeof copy.tones)[number]["value"];

/** Salin ke clipboard; fallback untuk konteks non-HTTPS. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    el.remove();
    return ok;
  }
}

type ActionCardScreenProps = {
  card: ActionCard;
  onBack: () => void;
  onRestart: () => void;
};

/**
 * S-09 Action Card — Figma 06 node 56:7367 (Default) / Tersalin.
 * Checklist dan 👍👎 hanya disimpan di browser, tidak dikirim (K10).
 */
export function ActionCardScreen({ card, onBack, onRestart }: ActionCardScreenProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [tone, setTone] = useState<Tone>("santai");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  // "Tersalin ✓" (06) / "Gagal menyalin" (keputusan desain mandiri) tampil 2 detik.
  useEffect(() => {
    if (copyState === "idle") return;
    const t = setTimeout(() => setCopyState("idle"), 2000);
    return () => clearTimeout(t);
  }, [copyState]);

  const phrase = card.warnings[tone];

  return (
    <LiteScreen>
      <div className="relative flex w-full flex-1 flex-col gap-ato-20 px-ato-16 pb-ato-24 pt-ato-16">
        <FlowTop back={{ label: liteCopy.header.result, onClick: onBack }} progress={liteCopy.progress.action} />

        <div className="flex w-full flex-col gap-ato-8">
          <ConsoleLabel>{copy.label(card.category_label)}</ConsoleLabel>
          <h1 className="ato-text-outline w-full font-ato-ui text-ato-m-h1 text-white">{copy.title}</h1>
        </div>

        <article className="relative flex w-full flex-col gap-ato-24 overflow-hidden rounded-ato-lg border border-ato-lite-accent bg-ato-bg-1 p-ato-20 shadow-ato-glass-strong backdrop-blur-[20px]">
          <section className="flex w-full flex-col gap-ato-4">
            <ConsoleLabel as="h2">{copy.secureLabel}</ConsoleLabel>
            {card.checklist.map((item) => (
              <ChecklistItem
                key={item.id}
                text={item.text}
                checked={!!checked[item.id]}
                onToggle={() => setChecked((c) => ({ ...c, [item.id]: !c[item.id] }))}
              />
            ))}
          </section>

          <section className="flex w-full flex-col gap-ato-12">
            <ConsoleLabel as="h2">{copy.warnLabel}</ConsoleLabel>
            <Segmented
              aria-label={copy.warnLabel}
              options={copy.tones}
              value={tone}
              onChange={(t) => {
                setTone(t);
                setCopyState("idle");
              }}
            />
            <div className="w-full rounded-ato-md bg-ato-bg-2 p-ato-16">
              <p className="font-ato-ui text-ato-m-body text-ato-text-1">{phrase}</p>
            </div>
            <Button
              variant="secondary"
              size="md"
              aria-live="polite"
              onClick={async () => setCopyState((await copyText(phrase)) ? "copied" : "failed")}
            >
              {copyState === "copied" ? copy.copied : copyState === "failed" ? copy.copyFailed : copy.copy}
            </Button>
          </section>

          {card.report_channels.length > 0 && (
            <section className="flex w-full flex-col gap-ato-12">
              <ConsoleLabel as="h2">{copy.reportLabel}</ConsoleLabel>
              {card.report_channels.map((ch) => (
                <ChannelItem key={ch.name} name={ch.name} note={ch.note} status={ch.status} url={ch.url} pendingLabel={copy.pending} />
              ))}
            </section>
          )}

          <footer className="flex w-full flex-col gap-ato-12">
            <p className="font-ato-ui text-ato-caption text-ato-text-3">{copy.disclaimer}</p>
            <div className="flex items-center gap-ato-12">
              <span className="font-ato-ui text-ato-caption text-ato-text-2">{copy.helpful}</span>
              {(["up", "down"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={feedback === v}
                  aria-label={v === "up" ? "Membantu" : "Tidak membantu"}
                  onClick={() => setFeedback((f) => (f === v ? null : v))}
                  className={cn(
                    "rounded-ato-sm font-ato-ui text-ato-m-body transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent",
                    feedback && feedback !== v && "opacity-40"
                  )}
                >
                  {v === "up" ? "👍" : "👎"}
                </button>
              ))}
            </div>
          </footer>
        </article>
      </div>

      <BottomActionBar glow="#99ebf8" direction="column">
        <Button variant="soul" href="/soul" gradient={FLOW_GRADIENTS.soulAction} className="shadow-ato-gloss">
          {copy.soul}
        </Button>
        <div className="flex w-full gap-ato-12">
          {/* TODO(ekspor 4:5): "Simpan gambar" disembunyikan — belum ada desain gambar di Figma 06. */}
          <Button variant="ghost" size="md" className="min-w-px flex-1" onClick={onRestart}>
            {copy.again}
          </Button>
        </div>
      </BottomActionBar>
    </LiteScreen>
  );
}
