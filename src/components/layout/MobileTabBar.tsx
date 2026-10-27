"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const pathname = usePathname();

  const tabs = [
    { label: "Latihan", href: "/drill", icon: "🧭" },
    { label: "A20 Lite", href: "/lite", icon: "⚡" },
    { label: "A20 Soul", href: "/soul", icon: "💜" },
    { label: "Docs", href: "/docs", icon: "📖" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-[#07090D]/95 border-t border-white/10 backdrop-blur-xl px-2 py-2 md:hidden">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all",
                isActive
                  ? "text-emerald-400 font-bold bg-white/[0.06] shadow-sm"
                  : "text-text-muted hover:text-white"
              )}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
