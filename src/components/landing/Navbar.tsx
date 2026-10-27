"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Menu, X, ShieldCheck } from "lucide-react";
import { landingContent, type NavLink } from "@/content/landing";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { nav } = landingContent;
  const [activeSection, setActiveSection] = useState<string>("masalah");
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle compact / scrolled background
      setIsScrolled(window.scrollY > 80);

      // Section tracking for active tab
      const sections = nav.links.map((link) => link.id);
      for (const sectionId of [...sections].reverse()) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [nav.links]);

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const target = document.getElementById("reverse-reflex");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="fixed top-4 md:top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-6xl flex items-center justify-between gap-3">
        {/* Left Pill: Custom Logo Mark + Brand */}
        <Link
          href="/"
          className={cn(
            "pointer-events-auto group flex items-center gap-2.5 px-3.5 py-2 md:px-4 md:py-2.5 rounded-full transition-all duration-300",
            "border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-lg shadow-black/20",
            "hover:bg-white/[0.1] hover:border-white/20"
          )}
          aria-label="Anti Trap Order Home"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-brand-teal/20 to-brand-cyan/20 border border-brand-teal/40 group-hover:border-brand-cyan/60 transition-colors">
            {/* Minimal Shield + Dot Custom SVG */}
            <svg
              className="w-4 h-4 text-brand-teal transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_6px_#22D3EE]" />
          </div>
          <span className="font-semibold text-sm tracking-wide text-text-primary">
            {nav.brandName}
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-brand-teal">
            {nav.badge}
          </span>
        </Link>

        {/* Center Pill: Desktop Navigation with Framer Motion layoutId indicator */}
        <nav
          className={cn(
            "hidden md:flex pointer-events-auto items-center p-1 rounded-full",
            "border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-lg shadow-black/20",
            isScrolled && "border-white/15 bg-white/[0.09]"
          )}
          aria-label="Navigasi Utama"
        >
          {nav.links.map((link: NavLink) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                className={cn(
                  "relative px-4 py-1.5 text-xs font-medium transition-colors duration-200 rounded-full",
                  isActive ? "text-text-primary" : "text-text-muted hover:text-text-primary"
                )}
                onClick={() => setActiveSection(link.id)}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 rounded-full bg-white/10 border border-white/15 shadow-inner"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Right Pill: Desktop CTA with Kbd hint */}
        <div className="hidden md:flex pointer-events-auto items-center gap-2">
          <a
            href={nav.cta.href}
            className={cn(
              "group inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold",
              "bg-gradient-to-r from-text-primary to-slate-200 text-surface-base shadow-md shadow-white/5",
              "hover:brightness-105 active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            )}
          >
            <span>{nav.cta.label}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <Kbd size="sm" className="hidden lg:inline-flex bg-black/10 border-black/10 text-surface-base">
              {nav.cta.kbdShortcut}
            </Kbd>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden pointer-events-auto">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-xl text-text-primary hover:bg-white/10 transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-label="Buka menu navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Fullscreen Sheet with Staggered Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-20 z-50 pointer-events-auto rounded-3xl border border-white/15 bg-surface-card/95 backdrop-blur-2xl p-6 shadow-2xl md:hidden"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
                  Menu ATO
                </span>
                <span className="text-xs font-mono text-brand-teal">
                  MIT-Week 2026
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {nav.links.map((link: NavLink, index: number) => (
                  <motion.a
                    key={link.id}
                    href={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-medium text-text-primary hover:bg-white/5 active:bg-white/10 transition-colors"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-text-muted" />
                  </motion.a>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10">
                <a
                  href={nav.cta.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold bg-text-primary text-surface-base shadow-lg"
                >
                  <span>{nav.cta.label}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
