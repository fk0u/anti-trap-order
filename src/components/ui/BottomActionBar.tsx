import { cn } from "@/lib/utils";

/**
 * BottomActionBar — Figma 02 (node 52:379/52:383), gaya 06: menempel di bawah,
 * kaca blur 12, gradien `bg/0 → cyan`. Warna ujung gradien sedikit berbeda
 * per layar di 06, jadi bisa diisi lewat `glow`.
 */
export function BottomActionBar({
  children,
  glow = "#6be5f8",
  direction = "row",
  className,
}: {
  children: React.ReactNode;
  glow?: string;
  direction?: "row" | "column";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 flex w-full gap-ato-12 border-t border-ato-border-subtle px-ato-16 pb-ato-32 pt-ato-16 backdrop-blur-[12px]",
        direction === "column" ? "flex-col" : "items-start",
        className
      )}
      style={{ backgroundImage: `linear-gradient(to bottom, var(--ato-bg-0), ${glow})` }}
    >
      {children}
    </div>
  );
}
