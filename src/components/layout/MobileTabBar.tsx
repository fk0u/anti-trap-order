"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Compass, MessageSquare, Zap, ShieldCheck, BookOpen } from "lucide-react";

export function MobileTabBar() {
  const pathname = usePathname();

  const tabs = [
    { label: "Latihan", href: "/drill", icon: Compass },
    { label: "Chat AI", href: "/realmulator", icon: MessageSquare },
    { label: "Lite", href: "/lite", icon: Zap },
    { label: "Soul", href: "/soul", icon: ShieldCheck },
    { label: "Docs", href: "/docs", icon: BookOpen },
  ];

  return (
    <nav className="fixed inset-x-2 bottom-3 z-40 max-w-md mx-auto aero-glass rounded-full px-2 py-1.5 md:hidden shadow-[0_16px_40px_rgba(2,44,84,0.7)] border-t border-white/60">
      <div className="grid grid-cols-5 gap-1 text-center font-mono text-[9px]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1.5 px-0.5 rounded-full transition-all duration-200",
                isActive
                  ? "bg-gradient-to-b from-sky-400/30 to-emerald-400/20 text-white font-bold border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4 transition-transform", isActive && "scale-110 text-cyan-300")} />
              <span className="tracking-tight truncate w-full">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
