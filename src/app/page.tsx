import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-surface-base text-text-primary selection:bg-brand-teal/20 selection:text-brand-cyan">
      {/* Floating 3-Pill Navbar */}
      <Navbar />

      {/* Hero Shell with Aurora, Spotlight, HeroConsole, and Marquee */}
      <Hero />

      {/* Target anchor points for Fase 2 & Fase 3 sections */}
      <div id="masalah" className="scroll-mt-28" />
      <div id="cara-kerja" className="scroll-mt-28" />
      <div id="reverse-reflex" className="scroll-mt-28" />
      <div id="tentang" className="scroll-mt-28" />
    </main>
  );
}
