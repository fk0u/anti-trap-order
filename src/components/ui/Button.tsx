import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Tombol utama sesuai Figma "06 | Prototype" (bukan varian halaman 02 —
 * perbedaannya dicatat di CLAUDE.md "Untuk desainer").
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

type ButtonVariant = "lite" | "soul";

const variantClass: Record<ButtonVariant, string> = {
  lite: "shadow-ato-gloss",
  soul: "",
};

const defaultGradient: Record<ButtonVariant, string> = {
  lite: BUTTON_GRADIENTS.liteHero,
  soul: BUTTON_GRADIENTS.soulHero,
};

type CommonProps = {
  variant: ButtonVariant;
  gradient?: string;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = CommonProps & { href: string; onClick?: () => void };
type ButtonAsButton = CommonProps & { href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>;

export type ButtonProps = ButtonAsLink | ButtonAsButton;

const baseClass =
  "relative flex h-[52px] w-full items-center justify-center gap-ato-8 overflow-hidden rounded-ato-md " +
  "border-[0.5px] border-ato-ink px-ato-24 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent";

// Garis luar label tombol di 06 lebih tipis daripada judul.
const labelClass =
  "ato-text-outline [--ato-outline-width:1px] min-w-px flex-1 text-center font-ato-ui text-ato-button text-white";

export function Button(props: ButtonProps) {
  const { variant, gradient, className, children } = props;
  const classes = cn(baseClass, variantClass[variant], className);
  const style = { backgroundImage: gradient ?? defaultGradient[variant] };
  const label = <span className={labelClass}>{children}</span>;

  if (props.href !== undefined) {
    return (
      <Link href={props.href} onClick={props.onClick} className={classes} style={style}>
        {label}
      </Link>
    );
  }

  const { variant: _v, gradient: _g, className: _c, children: _ch, href: _h, type, ...rest } = props;
  return (
    <button type={type ?? "button"} className={classes} style={style} {...rest}>
      {label}
    </button>
  );
}
