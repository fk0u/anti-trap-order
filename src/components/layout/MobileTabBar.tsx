"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES_WITH_TAB_BAR } from "@/lib/routes";
import { Compass, MessageSquare, Zap, ShieldCheck, BookOpen } from "lucide-react";

export function MobileTabBar() {
  const pathname = usePathname();

  // Hanya route lama yang terdaftar di src/lib/routes.ts yang memakai tab bar.
  if (!ROUTES_WITH_TAB_BAR.includes(pathname)) return null;

  const tabs = [
    { label: "Latihan", href: "/drill", icon: Compass },
    { label: "Chat AI", href: "/realmulator", icon: MessageSquare },
    { label: "Lite", href: "/lite", icon: Zap },
    { label: "Soul", href: "/soul", icon: ShieldCheck },
    { label: "Docs", href: "/docs", icon: BookOpen },
  ];

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 max-w-md mx-auto aero-glass rounded-full px-2 py-1.5 md:hidden shadow-[0_12px_32px_rgba(14,165,233,0.18)] border-t-2 border-white">
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
                  ? "bg-sky-100/90 text-sky-900 font-bold border border-sky-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]"
                  : "text-slate-500 hover:text-slate-900 hover:bg-sky-50/60"
              )}
            >
              <Icon className={cn("w-4 h-4 transition-transform", isActive ? "scale-110 text-sky-600" : "text-slate-400")} />
              <span className="tracking-tight truncate w-full font-bold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
