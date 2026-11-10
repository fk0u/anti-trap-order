import type { Metadata } from "next";
import { Check, Info, ShieldCheck, UserRoundX, type LucideIcon } from "lucide-react";
import { atoFontVariables } from "@/app/fonts";
import { Bullets, GlassCard, InfoPage, InfoSection, InfoTitle } from "@/components/info/InfoParts";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { privacyCopy } from "@/content/info-pages";

export const metadata: Metadata = {
  title: "Batasan & Privasi",
};

const ICONS: Record<(typeof privacyCopy.points)[number]["icon"], LucideIcon> = {
  "user-round-x": UserRoundX,
  "shield-check": ShieldCheck,
  check: Check,
  info: Info,
};

/**
 * S-16 Batasan & Privasi — Figma 06 node 56:8292. Mobile dulu; desktop belum.
 * Teks disalin persis; klaim yang bertentangan dengan K12 ditandai di
 * src/content/info-pages.ts dan CLAUDE.md "Menunggu keputusan".
 */
export default function PrivacyPage() {
  const c = privacyCopy;
  return (
    <div className={atoFontVariables}>
      <InfoPage from="#ffffff" stop="89.809%" bottom="#6ce4f7">
        <InfoTitle kicker={c.kicker} title={c.title}>
          <p className="w-full font-ato-ui text-ato-m-body-l text-ato-text-2">{c.lead}</p>
        </InfoTitle>

        <ul className="grid w-full grid-cols-2 gap-ato-16">
          {c.points.map((p) => {
            const Icon = ICONS[p.icon];
            return (
              <li key={p.label}>
                <GlassCard className="h-[168px] gap-ato-12">
                  <span aria-hidden className="flex size-10 items-center justify-center rounded-ato-md bg-ato-lite-accent-soft">
                    <Icon size={22} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-lite-accent)" />
                  </span>
                  <span className="font-ato-ui text-ato-m-h3 text-ato-text-1">{p.label}</span>
                </GlassCard>
              </li>
            );
          })}
        </ul>

        <div className="flex w-full flex-col gap-ato-16">
          <GlassCard className="gap-ato-12 p-ato-24">
            <ConsoleLabel as="h2" tone="text-3">
              {c.processed.label}
            </ConsoleLabel>
            <Bullets items={c.processed.items} textClassName="text-ato-m-body text-ato-text-1" gap />
          </GlassCard>
          <GlassCard accent className="gap-ato-12 p-ato-24">
            <ConsoleLabel as="h2">{c.neverStored.label}</ConsoleLabel>
            <Bullets items={c.neverStored.items} textClassName="text-ato-m-body text-ato-text-1" gap />
          </GlassCard>
        </div>

        <InfoSection label={c.limits.label} title={c.limits.title}>
          <Bullets items={c.limits.items} textClassName="text-ato-m-body-l text-ato-text-2" />
        </InfoSection>

        <InfoSection label={c.contact.label} title={c.contact.title}>
          <GlassCard className="gap-ato-8">
            <span className="flex items-center gap-[6px] self-start rounded-ato-full border-[0.5px] border-ato-ink bg-gradient-to-b from-[#ffda37] to-white px-ato-12 py-ato-4">
              <Info aria-hidden size={14} strokeWidth={1.75} absoluteStrokeWidth color="#212121" />
              <span className="whitespace-nowrap font-ato-ui text-ato-caption text-[#212121]">{c.contact.badge}</span>
            </span>
            <p className="font-ato-ui text-ato-m-body text-ato-text-2">{c.contact.body}</p>
          </GlassCard>
        </InfoSection>
      </InfoPage>
    </div>
  );
}
