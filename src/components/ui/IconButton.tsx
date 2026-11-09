import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * - `aero`: tombol menu header S-01 (gradien putih → glow, border hitam, bayangan keras).
   * - `soft`: tombol tutup sheet S-02 (bulat, `bg/2`).
   */
  variant: "aero" | "soft";
  "aria-label": string;
};

const variantClass = {
  aero: "rounded-ato-md border-[0.5px] border-ato-ink bg-gradient-to-b from-white to-ato-glow shadow-ato-hard-md",
  soft: "rounded-ato-full bg-ato-bg-2",
} as const;

/** IconButton 44×44 — Figma 02 (node 52:368), gaya mengikuti 06. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant, className, type, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center overflow-hidden",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ato-lite-accent",
        variantClass[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
