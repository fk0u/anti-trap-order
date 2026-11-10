import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  label: string;
  className?: string;
} & ({ href: string; onClick?: undefined } | { href?: undefined; onClick: () => void });

const circleClass =
  "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-ato-full border-[0.5px] border-ato-text-1 " +
  "bg-gradient-to-b from-white to-[#9edff1] shadow-[3px_1px_0_0_var(--ato-ink)]";

const rootClass =
  "flex items-center gap-ato-12 rounded-ato-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent";

/** BackButton — Figma 02 (node 77:409), gaya 06: tombol bulat 44px + judul H3. */
export function BackButton({ label, className, href, onClick }: BackButtonProps) {
  const content = (
    <>
      <span aria-hidden className={circleClass}>
        <ArrowLeft size={20} strokeWidth={1.75} absoluteStrokeWidth color="var(--ato-text-1)" />
      </span>
      <span className="whitespace-nowrap font-ato-ui text-ato-m-h3 text-ato-text-1">{label}</span>
    </>
  );
  if (href !== undefined) {
    return (
      <Link href={href} className={cn(rootClass, className)}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cn(rootClass, className)}>
      {content}
    </button>
  );
}
