import { Check } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { DesktopHeader } from "@/components/ui/DesktopHeader";
import { soulCopy } from "@/content/soul";
import { DESKTOP_CONTAINER } from "@/lib/layout";
import { METER_KEYS, meterSegments } from "@/lib/soul/rules";
import { cn } from "@/lib/utils";
import type { AvatarId, ChoiceId, Meters } from "@/types/api-v1";

/**
 * Bagian layar A20 Soul (S-10 – S-14) sesuai Figma "06 | Prototype".
 * Warna mentah 06 yang bukan Variable Figma ditulis langsung di sini dan
 * dicatat di CLAUDE.md "Keputusan desain mandiri".
 *
 * Desktop (lg) mengikuti frame BROWSER 06 yang memakai palet berbeda dari
 * mobile: aksen `soul/accent` cokelat, langit peach, kartu `soul/surface`.
 * Semua gaya desktop hanya lewat kelas `lg:`; tampilan mobile tidak berubah.
 */

/** Gradien tombol alur Soul — dari kode ekspor 06. */
export const SOUL_GRADIENTS = {
  /** S-11 "Pilih →". */
  choose: "linear-gradient(to bottom, #ffda37 20.192%, #ffffff 100%)",
  /** S-13 "Lanjut ke Misi n →" / "Lihat Status Penjagaan →". */
  next: "linear-gradient(to bottom, #ffda37 0%, #ffffff 100%)",
  /** S-14 "Jalankan Lite untuk situasi serupa →". */
  lite: "linear-gradient(to bottom, #7bd3eb 0%, #ffffff 100%)",
} as const;

/**
 * Latar Soul: `bg/0` + "Aero sky" kuning 560px (node 75:82xx).
 * Desktop: langit peach `rgba(255,210,122,.95)` 640px, header desktop, grid
 * `desktopGrid` di container 1120 (pembungkus `display: contents` di bawah lg).
 */
export function SoulScreen({
  children,
  className,
  desktopGrid,
  desktopTop = 56,
}: {
  children: React.ReactNode;
  className?: string;
  desktopGrid?: string;
  /** Jarak atas konten desktop: 56 (S-11, S-13) atau 80 (S-10, S-14) sesuai frame 06. */
  desktopTop?: 56 | 80;
}) {
  return (
    <div className={cn("relative flex min-h-screen flex-col bg-ato-bg-0", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-[rgba(255,218,55,0.95)] to-[rgba(255,218,55,0)] lg:h-[640px] lg:from-[rgba(255,210,122,0.95)] lg:to-[rgba(255,210,122,0)]"
      />
      <DesktopHeader active="soul" cta="soul" />
      <div
        className={cn(
          "contents",
          DESKTOP_CONTAINER,
          "lg:relative lg:grid lg:items-start lg:gap-x-ato-56 lg:pb-ato-80",
          desktopTop === 80 ? "lg:pt-ato-80" : "lg:pt-ato-56",
          desktopGrid
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Baris atas: BackButton Soul + label konsol. */
export function SoulTop({
  back,
  progress,
  desktopBack = false,
}: {
  back: { label: string; href: string } | { label: string; onClick: () => void };
  progress: string;
  /** Desktop: hanya tombol kembali (S-11) atau disembunyikan (S-10, S-13, S-14). Label progres tidak dipakai desktop. */
  desktopBack?: boolean;
}) {
  return (
    <div className={cn("flex w-full items-center justify-between", desktopBack ? "lg:justify-start lg:[&>span]:hidden" : "lg:hidden")}>
      {"href" in back ? (
        <BackButton tone="soul" label={back.label} href={back.href} />
      ) : (
        <BackButton tone="soul" label={back.label} onClick={back.onClick} />
      )}
      <ConsoleLabel as="span" tone="soul" className="whitespace-nowrap">
        {progress}
      </ConsoleLabel>
    </div>
  );
}

// ---------- S-10 ----------

const AVATAR_SRC: Record<AvatarId, string> = {
  "1-lingkar": "/icons/ato/soul/avatar-1-lingkar.svg",
  "2-tumpuk": "/icons/ato/soul/avatar-2-tumpuk.svg",
  "3-segitiga": "/icons/ato/soul/avatar-3-segitiga.svg",
  "4-kotak": "/icons/ato/soul/avatar-4-kotak.svg",
};

/**
 * Avatar geometris 56px. SVG "1 Lingkar" di 06 berukuran 59px dengan inset −2,68%.
 * Desktop memakai avatar frame BROWSER 06 (oranye/cokelat, 56px) lewat <picture>.
 */
export function Avatar({ id }: { id: AvatarId }) {
  return (
    <span aria-hidden className="relative block size-14 shrink-0">
      <picture>
        <source media="(min-width: 1024px)" srcSet={`/icons/ato/soul/desktop-avatar-${id}.svg`} />
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG statis kecil */}
        <img
          src={AVATAR_SRC[id]}
          alt=""
          width={id === "1-lingkar" ? 59 : 56}
          height={id === "1-lingkar" ? 59 : 56}
          className={cn("absolute block max-w-none", id === "1-lingkar" ? "inset-[-2.68%] size-[105.36%] lg:inset-0 lg:size-full" : "inset-0 size-full")}
        />
      </picture>
    </span>
  );
}

/** CharacterCard (02 node 29:104 / 29:111, gaya 06 S-10). */
export function CharacterCard({
  name,
  relation,
  avatar,
  selected,
  onSelect,
}: {
  name: string;
  relation: string;
  avatar: AvatarId;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-ato-16 rounded-[20px] p-ato-16 text-left",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-soul-accent",
        selected
          ? "border-[0.5px] border-ato-ink bg-gradient-to-b from-white to-[#ffda37] drop-shadow-[0_8px_9px_rgba(115,64,5,0.28)] lg:border-2 lg:border-ato-soul-accent lg:from-[#ffe6bf] lg:to-[#fbc57a]"
          : "border border-ato-border-subtle bg-ato-bg-1 drop-shadow-[0_6px_8px_rgba(13,38,64,0.1)]",
        // Desktop (node 58:3751): radius 36.
        "lg:rounded-[36px]"
      )}
    >
      <Avatar id={avatar} />
      <span className="flex min-w-px flex-1 flex-col">
        <span className="truncate font-ato-ui text-ato-m-h3 text-ato-text-1">{name}</span>
        <span className="truncate font-ato-ui text-ato-caption text-ato-text-3">{relation}</span>
      </span>
      {selected && <Check aria-hidden size={20} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-soul-accent)" className="shrink-0" />}
    </button>
  );
}

// ---------- Meter ----------

/** MeterMini S-11 (node 29:92): label caption + 5 segmen 6px tanpa jarak. */
export function MeterMini({ label, value }: { label: string; value: number }) {
  const filled = meterSegments(value);
  return (
    <div className="flex min-w-px flex-1 flex-col">
      <span className="whitespace-nowrap font-ato-ui text-ato-caption text-ato-text-2">{label}</span>
      <span aria-hidden className="flex w-full">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("h-1.5 min-w-px flex-1 rounded-ato-full", i < filled ? "bg-[#00c407] lg:bg-ato-soul-accent" : "bg-ato-border-subtle")} />
        ))}
      </span>
    </div>
  );
}

export function MetersMini({ meters }: { meters: Meters }) {
  return (
    <div role="group" aria-label="Meter" className="flex w-full items-start gap-ato-12 lg:gap-ato-16">
      {METER_KEYS.map((k) => (
        <MeterMini key={k} label={soulCopy.meters[k]} value={meters[k]} />
      ))}
    </div>
  );
}

/** Badge perubahan meter: "+10 ▲" / "−10 ▼" / "0" (02 node 29:55/29:66/29:77, warna 06). */
function DeltaBadge({ delta }: { delta: number }) {
  const text = delta > 0 ? `+${delta} ▲` : delta < 0 ? `−${Math.abs(delta)} ▼` : "0";
  return (
    <span
      className={cn(
        "shrink-0 whitespace-nowrap rounded-ato-full border px-ato-12 py-ato-4 font-ato-ui text-ato-caption",
        delta > 0 ? "border-ato-success text-ato-success" : delta < 0 ? "border-[#bf0003] text-[#bf0003]" : "border-ato-text-3 text-ato-text-3"
      )}
    >
      {text}
    </span>
  );
}

/** Meter S-13/S-14: judul H3 + badge, 5 segmen 8px (hijau naik/tetap, merah turun). */
function MeterRow({ label, value, delta }: { label: string; value: number; delta: number }) {
  const filled = meterSegments(value);
  // Desktop 06: naik/tetap `soul/accent`; turun tetap merah (02 Meter State=down).
  const on = delta < 0 ? "bg-[#bf0003]" : "bg-[#1fc814] lg:bg-ato-soul-accent";
  return (
    <div className="flex w-full flex-col gap-ato-8">
      <div className="flex w-full items-center justify-between">
        <span className="whitespace-nowrap font-ato-ui text-ato-m-h3 text-ato-text-1">{label}</span>
        <DeltaBadge delta={delta} />
      </div>
      <span aria-hidden className="flex w-full gap-ato-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("h-2 min-w-px flex-1 rounded-ato-full", i < filled ? on : "bg-ato-border-subtle")} />
        ))}
      </span>
    </div>
  );
}

export function MetersCard({ meters, deltas }: { meters: Meters; deltas: Meters }) {
  return (
    <WhiteCard className="gap-ato-16 lg:gap-ato-20 lg:p-ato-32">
      {METER_KEYS.map((k) => (
        <MeterRow key={k} label={soulCopy.meters[k]} value={meters[k]} delta={deltas[k]} />
      ))}
    </WhiteCard>
  );
}

// ---------- Kartu ----------

/** Kartu putih kaca (Meters, "Kenapa begini"): border subtle, p20, Glass. */
export function WhiteCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-ato-lg border border-ato-border-subtle bg-ato-bg-1 p-ato-20 backdrop-blur-[12px]",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_12px_32px_-8px_rgba(13,23,33,0.08)]",
        className
      )}
    >
      {children}
    </section>
  );
}

/** StoryCard S-11 (node 29:141) dan ConsequenceCard S-13: gradien `soul/surface → #7aff55`. */
export function GreenCard({
  label,
  children,
  variant,
}: {
  label: string;
  children: React.ReactNode;
  variant: "story" | "consequence";
}) {
  return (
    <section
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-ato-lg border-[0.5px] border-ato-ink p-ato-24 backdrop-blur-[12px]",
        "bg-gradient-to-b from-ato-soul-surface to-[#7aff55]",
        variant === "story"
          ? "gap-ato-12 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),4px_4px_3px_0_rgba(0,0,0,0.25),0_12px_32px_0_rgba(13,23,33,0.08)]"
          : "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),4px_4px_3px_0_rgba(0,0,0,0.25),0_12px_32px_-8px_rgba(13,23,33,0.08)]",
        // Desktop (node 58:3907 / 58:3976): `soul/surface` datar, garis 1px `soul/accent`.
        "lg:border lg:border-ato-soul-accent lg:bg-none lg:bg-ato-soul-surface",
        variant === "story"
          ? "lg:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_12px_16px_0_rgba(13,23,33,0.08)]"
          : "lg:gap-ato-12 lg:p-ato-32 lg:shadow-ato-glass"
      )}
    >
      <ConsoleLabel as="h2" tone="text-3" className="lg:text-ato-soul-accent">
        {label}
      </ConsoleLabel>
      <p className={cn("font-ato-ui text-ato-m-body-l text-ato-text-1", variant === "consequence" && "lg:text-ato-d-body-l")}>{children}</p>
    </section>
  );
}

// ---------- S-11 ----------

/** ProgressDots (02 node 29:148): aktif 28×10, selesai/berikut 10px. Warna dari frame 06 "None selected". */
export function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <span aria-hidden className="flex items-center gap-ato-8">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-2.5 rounded-ato-full",
            i + 1 === step ? "w-7 bg-ato-soul-accent" : i + 1 < step ? "w-2.5 bg-ato-soul-accent" : "w-2.5 bg-ato-border-strong"
          )}
        />
      ))}
    </span>
  );
}

export type ChoiceState = "default" | "selected" | "locked";

/** ChoiceCard (02 node 29:125/29:129/29:133, gaya 06 S-11). Locked = opacity 55% (02). */
export function ChoiceCard({
  id,
  label,
  state,
  disabled,
  onSelect,
}: {
  id: ChoiceId;
  label: string;
  state: ChoiceState;
  disabled: boolean;
  onSelect: () => void;
}) {
  const selected = state === "selected";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onSelect}
      className={cn(
        "flex w-full items-center gap-ato-16 rounded-[50px] p-ato-16 text-left transition-opacity",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-soul-accent",
        selected
          ? "border-[0.5px] border-ato-ink bg-gradient-to-b from-[#ffe6bf] to-[#ffda37] drop-shadow-[0_8px_9px_rgba(115,64,5,0.28)]"
          : "border border-ato-border-subtle bg-ato-bg-1 drop-shadow-[0_6px_8px_rgba(13,38,64,0.1)]",
        // Desktop (node 58:3910–58:3912): radius 32, terpilih bergaris 2px `soul/accent`.
        "lg:rounded-[32px]",
        selected && "lg:border-2 lg:border-ato-soul-accent lg:to-[#f9b45e]",
        state === "locked" && "opacity-[0.55]",
        disabled && "cursor-default"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-ato-full font-ato-ui text-[18px] leading-[25.2px] text-[#ffda37]",
          selected ? "border-[0.5px] border-ato-ink bg-white font-normal" : "border-[1.5px] border-[#ffda37] font-semibold",
          // Desktop: huruf `soul/accent`; terpilih = lingkaran `soul/accent` penuh, huruf putih.
          selected ? "lg:border-0 lg:bg-ato-soul-accent lg:font-semibold lg:text-white" : "lg:border-ato-soul-accent lg:text-ato-soul-accent"
        )}
      >
        {id}
      </span>
      <span className="min-w-px flex-1 font-ato-ui text-ato-m-body text-ato-text-1">{label}</span>
      {selected && (
        // Kilau atas desktop (node I58:3911;75:403).
        <span aria-hidden className="pointer-events-none absolute inset-x-[2px] top-px hidden h-[26px] rounded-[28px] bg-gradient-to-b from-white/60 to-white/0 lg:block" />
      )}
    </button>
  );
}

// ---------- S-14 ----------

const YELLOW_DISC = "bg-gradient-to-b from-[#ffda37] to-white";
/** Border 0.3px di 06: browser menggambar min. 1px pekat, jadi ditiru 0.5px hitam 60% (sama dengan StepperAlphaOmega). */
const HAIRLINE = "border-[0.5px] border-[rgba(0,0,0,0.6)]";
const GLOSS_INNER = "shadow-[inset_0_-2px_4px_0_rgba(13,23,33,0.14),inset_0_1px_0_0_rgba(255,255,255,0.45),0_6px_14px_-4px_rgba(13,23,33,0.2)]";

/** "Path A→Ω" S-14 (node 56:8138): Alpha 28px, 3 titik 12px, Omega 64px, garis #ffd000. */
export function SoulPath() {
  const line = <span className="h-0.5 min-w-px flex-1 bg-[#ffd000]" />;
  const dot = <span className={cn("size-3 shrink-0 rounded-ato-full", HAIRLINE, YELLOW_DISC)} />;
  return (
    <div aria-hidden className="flex w-full items-center lg:hidden">
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-ato-full", HAIRLINE, YELLOW_DISC, GLOSS_INNER)}>
        <span className="font-ato-console text-ato-console uppercase text-[#262626]">A</span>
      </span>
      {line}
      {dot}
      {line}
      {dot}
      {line}
      {dot}
      {line}
      <span className={cn("flex size-16 shrink-0 items-center justify-center rounded-ato-full border-[0.5px] border-ato-ink", YELLOW_DISC, GLOSS_INNER)}>
        <span className="font-ato-ui text-ato-m-h1 text-[#202020]">Ω</span>
      </span>
    </div>
  );
}

/** "Path A→Ω" S-14 desktop (node 58:4515): Alpha 32, titik 12, Ω 80, semua `soul/accent`, jarak 8. */
export function SoulPathDesktop() {
  const line = <span className="h-0.5 min-w-px flex-1 bg-ato-soul-accent" />;
  const dot = <span className="size-3 shrink-0 rounded-ato-full bg-ato-soul-accent" />;
  return (
    <div aria-hidden className="hidden w-full items-center gap-ato-8 lg:flex">
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-ato-full bg-ato-soul-accent", GLOSS_INNER)}>
        <span className="font-ato-console text-ato-console uppercase text-white">A</span>
      </span>
      {line}
      {dot}
      {line}
      {dot}
      {line}
      {dot}
      {line}
      <span className={cn("flex size-20 shrink-0 items-center justify-center rounded-ato-full bg-ato-soul-accent", GLOSS_INNER)}>
        <span className="font-ato-ui text-ato-d-h1 text-white">Ω</span>
      </span>
    </div>
  );
}
