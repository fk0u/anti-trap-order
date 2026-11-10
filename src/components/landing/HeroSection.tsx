import { ShieldCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { StepperAlphaOmega } from "@/components/ui/StepperAlphaOmega";
import { TacticBadge } from "@/components/ui/TacticBadge";
import { landingS01 } from "@/content/landing-s01";
import { cn } from "@/lib/utils";

const { hero } = landingS01;

/**
 * S-01 Hero — Figma 06 node 56:6733.
 * Desktop (frame 56:8549, node "Hero"): teks kiri | kartu pratinjau Lite 520px kanan.
 */
export function HeroSection() {
  return (
    <section className="flex w-full flex-col gap-ato-16 lg:flex-row lg:items-center lg:gap-ato-0">
      <div className="contents lg:flex lg:min-w-px lg:flex-1 lg:flex-col lg:gap-ato-20">
        <ConsoleLabel>{hero.eyebrow}</ConsoleLabel>
        <h1 className="ato-text-outline w-full font-ato-display text-ato-m-display text-white [text-shadow:1px_1px_0_var(--ato-ink)] lg:font-ato-ui-heavy lg:text-ato-d-display">
          {hero.title}
        </h1>
        <p className="w-full font-ato-ui text-ato-m-body-l text-ato-text-2 lg:text-ato-d-body-l">{hero.body}</p>
        <div className="flex w-full flex-col gap-ato-12 lg:items-start">
          <Button variant="lite" desktop="lite" href={hero.ctaLite.href}>
            {hero.ctaLite.label}
          </Button>
          <Button variant="soul" desktop="secondary" href={hero.ctaSoul.href}>
            {hero.ctaSoul.label}
          </Button>
        </div>
        <div className="flex w-full items-center gap-ato-8">
          <ShieldCheck aria-hidden size={16} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-lite-accent)" className="shrink-0" />
          <p className="min-w-px flex-1 font-ato-ui text-ato-caption text-ato-text-3">{hero.trust}</p>
        </div>
      </div>
      <PreviewCard />
    </section>
  );
}

/** Kartu pratinjau Lite desktop ("Preview card Lite"): ilustrasi statis, tidak bisa diklik. */
function PreviewCard() {
  const p = landingS01.preview;
  return (
    <figure
      aria-hidden
      className="hidden w-[520px] shrink-0 flex-col gap-ato-16 overflow-hidden rounded-ato-lg border border-ato-lite-accent bg-ato-bg-1 p-ato-24 shadow-ato-glass backdrop-blur-[12px] lg:flex"
    >
      <div className="flex w-full items-center justify-between font-ato-console text-ato-console uppercase">
        <span className="text-ato-lite-accent">{p.progress}</span>
        <span className="text-ato-text-3">{p.mode}</span>
      </div>
      <StepperAlphaOmega variant="flow" step={1} />
      <p className="w-full rounded-ato-md bg-ato-bg-2 px-ato-16 py-ato-12 font-ato-ui text-ato-m-body text-ato-text-1">{p.message}</p>
      <p className="w-full font-ato-ui text-ato-d-h3 text-ato-text-1">{p.question}</p>
      <div className="flex w-full flex-col gap-ato-12">
        {p.options.map((o, i) => (
          <span
            key={o}
            className={cn(
              "relative flex w-full items-center gap-ato-12 rounded-[28px] px-[20px] py-ato-16",
              i === 0
                ? "border-2 border-ato-lite-accent bg-gradient-to-b from-[#c2f7ff] to-[#5fdff2] [filter:drop-shadow(0_8px_9px_rgba(13,89,115,0.28))]"
                : "border border-ato-border-subtle bg-ato-bg-1 [filter:drop-shadow(0_6px_8px_rgba(13,38,64,0.1))]"
            )}
          >
            {i === 0 ? (
              <span className="flex size-[22px] shrink-0 items-center justify-center rounded-ato-full border-2 border-ato-lite-accent">
                <span className="size-[10px] rounded-ato-full bg-ato-lite-accent" />
              </span>
            ) : (
              <span className="size-[22px] shrink-0 rounded-ato-full border-2 border-ato-border-strong" />
            )}
            <span className="min-w-px flex-1 font-ato-ui text-ato-m-body text-ato-text-1">{o}</span>
          </span>
        ))}
      </div>
      <TacticBadge
        tone="found"
        icon={<TrendingUp size={16} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-lite-accent)" />}
        label={p.found}
        className="self-start"
      />
    </figure>
  );
}
