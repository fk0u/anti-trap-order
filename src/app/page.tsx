import { atoFontVariables } from "@/app/fonts";
import { AlphaOmegaPath } from "@/components/landing/AlphaOmegaPath";
import { ExampleSection } from "@/components/landing/ExampleSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { ModesSection } from "@/components/landing/ModesSection";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { landingS01 } from "@/content/landing-s01";
import { cn } from "@/lib/utils";

/**
 * S-01 Landing (mobile) — Figma "06 | Prototype", node 56:6727.
 * Desktop belum dikerjakan.
 */
export default function Home() {
  return (
    <div className={cn(atoFontVariables, "relative min-h-screen overflow-x-clip bg-ato-bg-0 font-ato-ui text-ato-text-1")}>
      {/* "Aero sky" — node 75:8204 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-ato-sky to-[rgba(0,218,251,0)]"
      />

      <LandingHeader />

      <main className="relative flex flex-col gap-ato-32 px-ato-16 pt-ato-8">
        <HeroSection />
        <AlphaOmegaPath />
        <HowItWorks />
        <ExampleSection />
        <ModesSection />
        <FaqSection />
      </main>

      <SiteFooter className="relative" lines={landingS01.footer.lines} links={landingS01.footer.links} />
    </div>
  );
}
