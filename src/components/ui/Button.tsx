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
 * - `lite` / `soul`: CTA landing — gradien, label putih bergaris luar.
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
  // Garis luar label tombol di 06 lebih tipis daripada judul.
  lite: "ato-text-outline [--ato-outline-width:1px] text-white",
  soul: "ato-text-outline [--ato-outline-width:1px] text-white",
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

type CommonProps = {
  variant: ButtonVariant;
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
  const { variant, size = "lg", gradient, className, labelClassName, children } = props;
  const classes = cn(baseClass, sizeClass[size], variantClass[variant], className);
  const bg = gradient ?? defaultGradient[variant];
  const style = bg ? { backgroundImage: bg } : undefined;
  const label = (
    <span className={cn("min-w-px text-center font-ato-ui text-ato-button", labelClassByVariant[variant], labelClassName)}>
      {children}
    </span>
  );

  if (props.href !== undefined) {
    return (
      <Link href={props.href} onClick={props.onClick} className={classes} style={style}>
        {label}
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    gradient: _g,
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
          className={cn("shrink-0 motion-safe:animate-spin", labelClassByVariant[variant], labelClassName)}
        />
      )}
      {label}
    </button>
  );
}
