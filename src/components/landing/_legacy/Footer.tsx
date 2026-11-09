import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { landingContent } from "@/content/landing";

export function Footer() {
  const { footer } = landingContent;

  return (
    <footer className="w-full bg-white/70 border-t border-sky-200 text-slate-600 py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand Info */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-100 text-sky-700 border border-sky-300">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm tracking-wide text-slate-900">
                {footer.brandName}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {footer.tagline}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold">
            {footer.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-600 hover:text-sky-900 transition-colors flex items-center gap-1.5"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-sky-100 text-sky-800 border border-sky-200 font-bold">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer & Credit */}
        <div className="pt-8 border-t border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] font-mono text-slate-500 font-medium">
          <p className="max-w-2xl leading-relaxed">
            {footer.disclaimer}
          </p>

          <span className="text-sky-700 font-bold shrink-0">
            {footer.credit}
          </span>
        </div>
      </div>
    </footer>
  );
}
