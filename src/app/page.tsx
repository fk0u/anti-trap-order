import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { A20System } from "@/components/landing/A20System";
import { ReverseReflexDemo } from "@/components/landing/ReverseReflexDemo";
import { Trust } from "@/components/landing/Trust";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-surface-base text-slate-900 selection:bg-sky-500/20 selection:text-sky-900">
      {/* Floating 3-Pill Navbar */}
      <Navbar />

      {/* Hero Shell with Aurora, Spotlight, HeroConsole, and Marquee */}
      <Hero />

      {/* 01: Problem Bento Section (Light Surface) */}
      <Problem />

      {/* 02: A20 Culture Technology System (Dark Sticky Showcase) */}
      <A20System />

      {/* Core Interactive Demo: Reverse Reflex Simulator */}
      <ReverseReflexDemo />

      {/* 03: Trust, Privacy, & Radical Honesty (Light Surface) */}
      <Trust />

      {/* Final Bookend CTA */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}
