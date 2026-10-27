import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { landingContent } from "@/content/landing";

export function Footer() {
  const { footer } = landingContent;

  return (
    <footer className="w-full bg-[#05070A] border-t border-white/[0.06] text-text-muted py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand Info */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-teal/20 text-brand-teal border border-brand-teal/40">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-wide text-text-primary">
                {footer.brandName}
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              {footer.tagline}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium">
            {footer.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/10 text-white/70">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer & Credit */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] font-mono text-text-muted/60">
          <p className="max-w-2xl leading-relaxed">
            {footer.disclaimer}
          </p>

          <span className="text-brand-teal shrink-0">
            {footer.credit}
          </span>
        </div>
      </div>
    </footer>
  );
}
