import type { Metadata } from "next";
import { atoFontVariables } from "@/app/fonts";
import { GlassCard, InfoPage, InfoSection, InfoTitle } from "@/components/info/InfoParts";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { aboutCopy } from "@/content/info-pages";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tentang",
};

const GLOSS = "border-[0.5px] border-ato-ink shadow-[inset_0_-2px_4px_0_rgba(13,23,33,0.14),inset_0_1px_0_0_rgba(255,255,255,0.45),0_6px_14px_-4px_rgba(13,23,33,0.2)]";

/** Badge 36px diagram A→Ω (node 56:8229 / 56:8235 / 56:8241). */
const STEP_BADGE = [
  cn(GLOSS, "bg-gradient-to-b from-[#68e5f7] to-white text-ato-text-1"),
  "bg-ato-bg-2 text-ato-text-2",
  cn(GLOSS, "bg-gradient-to-b from-[#73e7f7] to-white text-ato-text-1"),
];

/**
 * S-15 Tentang — Figma 06 node 56:8211. Mobile dulu; desktop belum.
 * Halaman lama diganti total (tersimpan di riwayat git).
 */
export default function AboutPage() {
  const c = aboutCopy;
  return (
    <div className={atoFontVariables}>
      <InfoPage from="var(--ato-bg-0)" stop="93.659%" bottom="#67e4f7">
        <InfoTitle kicker={c.kicker} title={c.title} />

        <InfoSection label={c.a20.label} title={c.a20.title}>
          <div className="flex w-full flex-col gap-ato-12">
            {c.a20.paragraphs.map((p) => (
              <p key={p} className="w-full font-ato-ui text-ato-m-body-l text-ato-text-2">
                {p}
              </p>
            ))}
          </div>
          <ol className="flex w-full flex-col gap-ato-12">
            {c.a20.steps.map((s, i) => (
              <li key={s.label}>
                <GlassCard accent={i === 2} className="gap-ato-8">
                  <span aria-hidden className={cn("flex size-9 items-center justify-center rounded-ato-full", STEP_BADGE[i])}>
                    <span className="font-ato-console text-ato-console uppercase">{s.badge}</span>
                  </span>
                  <ConsoleLabel as="span">{s.label}</ConsoleLabel>
                  <span className="font-ato-ui text-ato-m-h3 text-ato-text-1">{s.title}</span>
                  <span className="font-ato-ui text-ato-caption text-ato-text-2">{s.body}</span>
                </GlassCard>
              </li>
            ))}
          </ol>
        </InfoSection>

        <InfoSection label={c.how.label} title={c.how.title}>
          <GlassCard accent>
            <p className="font-ato-ui text-ato-m-body text-ato-text-1">{c.how.body}</p>
          </GlassCard>
        </InfoSection>

        <InfoSection label={c.team.label} title={c.team.title}>
          <ul className="grid w-full grid-cols-2 gap-ato-16">
            {c.team.roles.map((r) => (
              <li key={r.name}>
                <GlassCard className="h-[168px] gap-ato-12">
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG statis kecil */}
                  <img src={`/icons/ato/tentang/avatar-${r.avatar}.svg`} alt="" width={56} height={56} className="block size-14 shrink-0" />
                  <span className="font-ato-ui text-ato-m-h3 text-ato-text-1">{r.name}</span>
                </GlassCard>
              </li>
            ))}
          </ul>
        </InfoSection>

        <InfoSection label={c.attribution.label} title={c.attribution.title}>
          <GlassCard>
            <p className="font-ato-ui text-ato-m-body text-ato-text-2">{c.attribution.body}</p>
          </GlassCard>
        </InfoSection>

        {/* TODO(GitHub): tombol "Lihat di GitHub" (node 56:8273) disembunyikan — repo masih privat (404 untuk publik). */}
      </InfoPage>
    </div>
  );
}
