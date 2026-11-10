import { cn } from "@/lib/utils";

/**
 * BottomActionBar — Figma 02 (node 52:379/52:383), gaya 06: menempel di bawah,
 * kaca blur 12, gradien `bg/0 → cyan`. Warna ujung gradien sedikit berbeda
 * per layar di 06, jadi bisa diisi lewat `glow`.
 *
 * - Tablet (md–lg): isi mengikuti kolom konten maks. 560px di tengah.
 * - Desktop (lg): bukan bar menempel lagi — baris tombol biasa rata kanan
 *   di kolom konten (frame BROWSER 06, mis. "Actions" node 56:8748).
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
        "[background-image:var(--ato-bar-bg)]",
        direction === "column" ? "flex-col" : "items-start",
        "md:max-lg:px-[max(16px,calc(50%-264px))]",
        "lg:static lg:z-auto lg:flex-row lg:items-center lg:justify-end lg:border-0 lg:p-0 lg:backdrop-blur-none lg:[background-image:none]",
        className
      )}
      style={{ "--ato-bar-bg": `linear-gradient(to bottom, var(--ato-bg-0), ${glow})` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
