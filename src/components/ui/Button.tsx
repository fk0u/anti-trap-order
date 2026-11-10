import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Tombol utama sesuai Figma "06 | Prototype" (bukan varian halaman 02 —
 * perbedaannya dicatat di CLAUDE.md "Keputusan desain mandiri").
 *
 * - `lite`: gradien cyan, border hitam 0.5px, Gloss shadow.
 * - `soul`: gradien kuning, border hitam 0.5px, tanpa bayangan.
 *
 * Gradien diambil dari RENDER Figma 06 (sampel piksel), bukan dari kode
 * ekspornya: titik gradien hasil ekspor tidak cocok dengan tampilan (handle
 * gradien di luar kotak). Hasil ukur: warna CTA dicampur putih, memudar
 * linear dari atas ke bawah. Pakai `gradient` untuk menimpa per instance.
 */
const mix = (token: string, pct: number) => `color-mix(in srgb, var(${token}) ${pct}%, #ffffff)`;

export const BUTTON_GRADIENTS = {
  /** S-01 CTA hero (node 56:6738): #00AAD9 60% → putih. */
  liteHero: `linear-gradient(180deg, ${mix("--ato-cta-lite", 60)} 0%, #ffffff 100%)`,
  /** S-01 CTA hero (node 56:6739): #FFDA37 72% → putih. */
  soulHero: `linear-gradient(180deg, ${mix("--ato-cta-soul", 72)} 0%, #ffffff 100%)`,
  /** S-01 kartu Dua Mode (node 128:4886): sama dengan hero. */
  liteMode: `linear-gradient(180deg, ${mix("--ato-cta-lite", 60)} 0%, #ffffff 100%)`,
  /** S-01 kartu Dua Mode (node 128:4895): #FFDA37 85% → 27%. */
  soulMode: `linear-gradient(180deg, ${mix("--ato-cta-soul", 85)} 0%, ${mix("--ato-cta-soul", 27)} 100%)`,
} as const;

/** Gradien tombol alur Lite (S-03–S-09, S-07 Error, S-20) — dari kode ekspor 06. */
export const FLOW_GRADIENTS = {
  /** S-03 "Lanjut →" (aktif & nonaktif). */
  next: "linear-gradient(to bottom, #97dcef 0%, #ffffff 136.54%)",
  /** S-04–S-06 "Lanjut →" / "Lihat hasil →". */
  question: "linear-gradient(to bottom, #a9e2f1 0%, #ffffff 100%)",
  /** S-08 "Lihat Action Card →". */
  result: "linear-gradient(to bottom, #68e5f8 10.577%, #ffffff 100%)",
  /** S-07 Error / S-19 "Lanjut mode terbatas". */
  limited: "linear-gradient(to bottom, #6fe6f8 0%, #ffffff 100%)",
  /** S-20 "OK". */
  ok: "linear-gradient(to bottom, #67e4f7 0%, #ffffff 100%)",
  /** S-09 "Coba A20 Soul →". */
  soulAction: "linear-gradient(to bottom, var(--ato-cta-soul) 0%, #ffffff 90.385%)",
} as const;

/**
 * - `lite` / `soul`: CTA landing — gradien, label hitam (lihat labelClassByVariant).
 * - `aqua`: tombol utama alur Lite — gradien cyan, label hitam, Gloss shadow.
 * - `secondary`: putih, garis `border/strong` (mis. "Kembali", "Salin kalimat").
 * - `ghost`: tanpa latar, label aksen Lite (mis. "Coba situasi lain").
 */
type ButtonVariant = "lite" | "soul" | "aqua" | "secondary" | "ghost";
type ButtonSize = "lg" | "md";

const variantClass: Record<ButtonVariant, string> = {
  lite: "border-[0.5px] border-ato-ink shadow-ato-gloss",
  soul: "border-[0.5px] border-ato-ink",
  aqua: "border-[0.5px] border-ato-ink shadow-ato-gloss",
  secondary: "border border-ato-border-strong bg-ato-bg-1",
  ghost: "",
};

const labelClassByVariant: Record<ButtonVariant, string> = {
  // 06: putih bergaris luar di atas gradien pucat — sulit dibaca. Keputusan Syafar
  // (10 Nov 2026): label hitam tanpa garis luar, sama dengan varian `aqua` (tombol alur Lite 06).
  lite: "text-black",
  soul: "text-black",
  aqua: "text-black",
  secondary: "text-ato-text-1",
  ghost: "text-ato-lite-accent",
};

const defaultGradient: Partial<Record<ButtonVariant, string>> = {
  lite: BUTTON_GRADIENTS.liteHero,
  soul: BUTTON_GRADIENTS.soulHero,
  aqua: FLOW_GRADIENTS.question,
};

const sizeClass: Record<ButtonSize, string> = {
  lg: "h-[52px] px-ato-24",
  md: "h-11 px-ato-20",
};

/**
 * Gaya tombol mulai breakpoint lg, mengikuti frame desktop 06 (BROWSER 1440),
 * yang memakai gaya 02: `lite`/`soul` solid + kilau atas + Gloss Button, label
 * putih; `secondary` putih bergaris `border/strong`; `ghost` teks aksen Lite.
 * Lebar tombol di desktop mengikuti isi (bukan penuh).
 */
export type DesktopButtonStyle = "lite" | "soul" | "secondary" | "ghost";

const desktopClass: Record<DesktopButtonStyle, string> = {
  lite: "lg:w-auto lg:border-0 lg:[background-image:none] lg:bg-ato-lite-accent lg:shadow-ato-gloss",
  soul: "lg:w-auto lg:border-0 lg:[background-image:none] lg:bg-ato-soul-accent lg:shadow-ato-gloss",
  secondary: "lg:w-auto lg:border lg:border-solid lg:border-ato-border-strong lg:[background-image:none] lg:bg-ato-bg-1 lg:shadow-none",
  ghost: "lg:w-auto lg:border-0 lg:[background-image:none] lg:bg-transparent lg:shadow-none",
};

const desktopLabelClass: Record<DesktopButtonStyle, string> = {
  lite: "lg:bg-none lg:text-white lg:[--ato-outline-width:0px]",
  soul: "lg:bg-none lg:text-white lg:[--ato-outline-width:0px]",
  secondary: "lg:bg-none lg:text-ato-text-1 lg:[--ato-outline-width:0px]",
  ghost: "lg:bg-none lg:text-ato-lite-accent lg:[--ato-outline-width:0px]",
};

type CommonProps = {
  variant: ButtonVariant;
  /** Gaya di breakpoint lg (desktop). Tanpa ini tombol tampil sama di semua ukuran. */
  desktop?: DesktopButtonStyle;
  size?: ButtonSize;
  gradient?: string;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
};

type ButtonAsLink = CommonProps & { href: string; onClick?: () => void; loading?: undefined };
type ButtonAsButton = CommonProps & {
  href?: undefined;
  /**
   * State Loading (pola Figma 02 Button "Loading"): spinner di depan label,
   * klik diabaikan, tanpa redup 40% (bukan nonaktif). Keputusan desain
   * mandiri — 06 tidak menggambar state ini.
   */
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export type ButtonProps = ButtonAsLink | ButtonAsButton;

const baseClass =
  "relative flex w-full items-center justify-center gap-ato-8 overflow-hidden rounded-ato-md " +
  // Nonaktif di 06: opacity 40%.
  "disabled:cursor-not-allowed disabled:opacity-40 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent";

export function Button(props: ButtonProps) {
  const { variant, size = "lg", gradient, className, labelClassName, children, desktop } = props;
  const bg = gradient ?? defaultGradient[variant];
  // Gradien lewat variabel CSS (bukan style backgroundImage langsung) supaya kelas lg: bisa menimpanya.
  // className terakhir: penyesuaian per pemakaian (mis. lg:w-full di modal) menang atas gaya desktop bawaan.
  const classes = cn(baseClass, sizeClass[size], variantClass[variant], bg && "[background-image:var(--ato-btn-bg)]", desktop && desktopClass[desktop], className);
  const style = bg ? ({ "--ato-btn-bg": bg } as React.CSSProperties) : undefined;
  const labelClasses = cn(labelClassByVariant[variant], labelClassName, desktop && desktopLabelClass[desktop]);
  const sheen =
    desktop === "lite" || desktop === "soul" ? (
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 hidden h-1/2 rounded-t-ato-md bg-gradient-to-b from-white/[0.34] to-white/0 lg:block" />
    ) : null;
  const label = (
    <span className={cn("relative min-w-px text-center font-ato-ui text-ato-button", labelClasses)}>
      {children}
    </span>
  );

  if (props.href !== undefined) {
    return (
      <Link href={props.href} onClick={props.onClick} className={classes} style={style}>
        {sheen}
        {label}
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    gradient: _g,
    desktop: _d,
    className: _c,
    labelClassName: _l,
    children: _ch,
    href: _h,
    loading,
    type,
    onClick,
    ...rest
  } = props;
  return (
    <button
      type={type ?? "button"}
      className={cn(classes, loading && "cursor-wait")}
      style={style}
      {...rest}
      aria-busy={loading || rest["aria-busy"] || undefined}
      aria-disabled={loading || rest["aria-disabled"] || undefined}
      onClick={loading ? undefined : onClick}
    >
      {loading && (
        <LoaderCircle
          aria-hidden
          size={18}
          strokeWidth={2}
          className={cn("relative shrink-0 motion-safe:animate-spin", labelClasses)}
        />
      )}
      {sheen}
      {label}
    </button>
  );
}
