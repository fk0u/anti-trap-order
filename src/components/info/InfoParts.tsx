import { LandingHeader } from "@/components/landing/LandingHeader";
import { ConsoleLabel } from "@/components/ui/ConsoleLabel";
import { DESKTOP_CONTAINER, TABLET_COLUMN } from "@/lib/layout";
import { cn } from "@/lib/utils";

/**
 * Bagian bersama S-15 Tentang dan S-16 Batasan & Privasi (Figma 06 node
 * 56:8211 / 56:8292): header landing, judul Alice, seksi, kartu kaca.
 * Desktop (node 56:9392 / 56:9483): container 1120, seksi berjarak 56,
 * judul Desktop H1 gelap (Plus Jakarta Sans, bukan Alice).
 */

/** Latar: "Aero sky" cyan 560px + gradien bawah ke cyan (`bottom` = warna akhir dari 06). */
export function InfoPage({ children, from, stop, bottom }: { children: React.ReactNode; from: string; stop: string; bottom: string }) {
  return (
    <div className="relative min-h-screen overflow-x-clip font-ato-ui text-ato-text-1" style={{ backgroundImage: `linear-gradient(to bottom, ${from} ${stop}, ${bottom} 100%)` }}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-ato-sky to-[rgba(95,227,247,0)] lg:h-[640px]" />
      <LandingHeader active="tentang" />
      <main className={cn("relative flex w-full flex-col gap-ato-32 px-ato-16 pb-[40px] pt-ato-8", TABLET_COLUMN, DESKTOP_CONTAINER, "lg:gap-ato-56 lg:pb-ato-80 lg:pt-ato-56")}>
        {children}
      </main>
    </div>
  );
}

/**
 * Kicker konsol + judul Alice 28/33.6 putih, garis luar gelap + bayangan keras 1px (sama dengan judul hero S-01).
 * Desktop 06 terbaru (node 56:9400 / 56:9491): Plus Jakarta Sans Desktop/H1 `bg/0` bergaris luar gelap, tanpa bayangan.
 */
export function InfoTitle({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="flex w-full flex-col gap-ato-8">
      <ConsoleLabel>{kicker}</ConsoleLabel>
      <h1 className="ato-text-outline w-full font-ato-display text-[28px] font-normal leading-[33.6px] text-white [text-shadow:1px_1px_0_var(--ato-ink)] lg:font-ato-ui lg:text-ato-d-h1 lg:text-ato-bg-0 lg:[text-shadow:none]">
        {title}
      </h1>
      {children}
    </header>
  );
}

/** Seksi: label konsol + judul H2 + isi (gap 12). */
export function InfoSection({ label, title, children }: { label: string; title?: string; children: React.ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-ato-12">
      <ConsoleLabel as="h2">{label}</ConsoleLabel>
      {title && <p className="w-full font-ato-ui text-ato-m-h2 text-ato-text-1 lg:text-ato-d-h2">{title}</p>}
      {children}
    </section>
  );
}

/** Kartu kaca putih (ATO/Aero/Glass). `accent` = garis `lite/accent`. */
export function GlassCard({
  children,
  accent = false,
  className,
}: {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-ato-lg border bg-ato-bg-1 p-ato-20 backdrop-blur-[12px]",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_12px_32px_-8px_rgba(13,23,33,0.08)]",
        accent ? "border-ato-lite-accent" : "border-ato-border-subtle",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Daftar butir "•" berwarna aksen Lite. */
export function Bullets({ items, textClassName, gap = false }: { items: readonly string[]; textClassName: string; gap?: boolean }) {
  return (
    <ul className={cn("flex w-full flex-col", gap && "gap-ato-12")}>
      {items.map((t) => (
        <li key={t} className="flex w-full items-start">
          <span aria-hidden className="whitespace-nowrap font-ato-ui text-ato-m-body text-ato-lite-accent">
            •
          </span>
          <span className={cn("min-w-px flex-1 font-ato-ui", textClassName)}>{t}</span>
        </li>
      ))}
    </ul>
  );
}
