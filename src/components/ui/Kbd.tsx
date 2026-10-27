import React from "react";
import { cn } from "@/lib/utils";

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

export function Kbd({ children, className, size = "md", ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded border border-white/10 bg-white/[0.04] font-mono font-medium text-text-muted shadow-sm select-none",
        size === "sm" && "px-1.5 py-0.5 text-[10px] leading-none",
        size === "md" && "px-2 py-0.5 text-xs",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
