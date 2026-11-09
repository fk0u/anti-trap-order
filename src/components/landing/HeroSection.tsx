import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { landingS01 } from "@/content/landing-s01";

const { hero } = landingS01;

/** S-01 Hero — Figma 06 node 56:6733. */
export function HeroSection() {
  return (
    <section className="flex w-full flex-col gap-ato-16">
      <ConsoleLabel>{hero.eyebrow}</ConsoleLabel>
      <h1 className="ato-text-outline w-full font-ato-display text-ato-m-display text-white [text-shadow:1px_1px_0_var(--ato-ink)]">
        {hero.title}
      </h1>
      <p className="w-full font-ato-ui text-ato-m-body-l text-ato-text-2">{hero.body}</p>
      <div className="flex w-full flex-col gap-ato-12">
        <Button variant="lite" href={hero.ctaLite.href}>
          {hero.ctaLite.label}
        </Button>
        <Button variant="soul" href={hero.ctaSoul.href}>
          {hero.ctaSoul.label}
        </Button>
      </div>
      <div className="flex w-full items-center gap-ato-8">
        <ShieldCheck aria-hidden size={16} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-lite-accent)" className="shrink-0" />
        <p className="min-w-px flex-1 font-ato-ui text-ato-caption text-ato-text-3">{hero.trust}</p>
      </div>
    </section>
  );
}
