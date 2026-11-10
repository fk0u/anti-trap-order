import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // Konstanta kelas layout bersama (mis. src/lib/layout.ts).
    "./src/lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#07090D",
          base: "#07090D",
          card: "#0D1117",
          elevated: "#161B22",
          border: "rgba(255,255,255,0.08)",
        },
        brand: {
          teal: "#10B981",
          cyan: "#22D3EE",
        },
        alert: {
          amber: "#F59E0B",
        },
        light: {
          surface: "#F7F8FA",
          card: "#FFFFFF",
          text: "#0D1117",
          muted: "#64748B",
          border: "#E2E8F0",
        },
        text: {
          primary: "#F5F7FA",
          muted: "#8B95A5",
        },
        // Token ATO dari Figma "06 | Prototype". Nilai ada di globals.css (--ato-*).
        ato: {
          "bg-0": "var(--ato-bg-0)",
          "bg-1": "var(--ato-bg-1)",
          "bg-2": "var(--ato-bg-2)",
          "border-subtle": "var(--ato-border-subtle)",
          "border-strong": "var(--ato-border-strong)",
          "text-1": "var(--ato-text-1)",
          "text-2": "var(--ato-text-2)",
          "text-3": "var(--ato-text-3)",
          "lite-accent": "var(--ato-lite-accent)",
          "lite-accent-ink": "var(--ato-lite-accent-ink)",
          "lite-accent-soft": "var(--ato-lite-accent-soft)",
          "soul-accent": "var(--ato-soul-accent)",
          "soul-accent-ink": "var(--ato-soul-accent-ink)",
          "soul-surface": "var(--ato-soul-surface)",
          "soul-rose": "var(--ato-soul-rose)",
          success: "var(--ato-success)",
          warning: "var(--ato-warning)",
          ink: "var(--ato-ink)",
          "cta-lite": "var(--ato-cta-lite)",
          "cta-soul": "var(--ato-cta-soul)",
          glow: "var(--ato-glow)",
          bubble: "var(--ato-bubble)",
          sky: "var(--ato-sky)",
          "footer-glow": "var(--ato-footer-glow)",
        },
      },
      spacing: {
        "ato-0": "var(--ato-space-0)",
        "ato-4": "var(--ato-space-4)",
        "ato-8": "var(--ato-space-8)",
        "ato-12": "var(--ato-space-12)",
        "ato-16": "var(--ato-space-16)",
        "ato-20": "var(--ato-space-20)",
        "ato-24": "var(--ato-space-24)",
        "ato-32": "var(--ato-space-32)",
        "ato-40": "var(--ato-space-40)",
        "ato-56": "var(--ato-space-56)",
        "ato-80": "var(--ato-space-80)",
      },
      borderRadius: {
        "ato-sm": "var(--ato-radius-sm)",
        "ato-md": "var(--ato-radius-md)",
        "ato-lg": "var(--ato-radius-lg)",
        "ato-full": "var(--ato-radius-full)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        // Variabel font diisi oleh src/app/fonts.ts (next/font) pada wrapper halaman.
        // ato-ui-arrows hanya berisi "→" dan "↻" (lihat src/app/fonts.ts).
        "ato-ui": ["var(--font-ato-ui-arrows)", "var(--font-ato-ui)", "system-ui", "sans-serif"],
        // Plus Jakarta Sans 800 terpisah (Desktop/Display) — lihat src/app/fonts.ts.
        "ato-ui-heavy": ["var(--font-ato-ui-arrows)", "var(--font-ato-ui-heavy)", "system-ui", "sans-serif"],
        "ato-console": ["var(--font-ato-console)", "ui-monospace", "monospace"],
        "ato-display": ["var(--font-ato-display)", "Georgia", "serif"],
      },
      // Text style Figma (mobile). Weight disertakan sesuai style.
      fontSize: {
        "ato-m-display": ["32px", { lineHeight: "35.2px", letterSpacing: "-0.64px", fontWeight: "400" }],
        "ato-m-h1": ["28px", { lineHeight: "33.6px", letterSpacing: "0px", fontWeight: "700" }],
        "ato-m-h2": ["22px", { lineHeight: "28.6px", letterSpacing: "0px", fontWeight: "700" }],
        "ato-m-h3": ["18px", { lineHeight: "25.2px", letterSpacing: "0px", fontWeight: "600" }],
        "ato-m-body-l": ["17px", { lineHeight: "26.35px", letterSpacing: "0px", fontWeight: "400" }],
        "ato-m-body": ["15px", { lineHeight: "23.25px", letterSpacing: "0px", fontWeight: "400" }],
        "ato-caption": ["13px", { lineHeight: "20px", letterSpacing: "0px", fontWeight: "500" }],
        "ato-console": ["12px", { lineHeight: "18px", letterSpacing: "0.96px", fontWeight: "500" }],
        "ato-button": ["15px", { lineHeight: "20px", letterSpacing: "0px", fontWeight: "600" }],
        // Text style Figma desktop (frame BROWSER 1440, dipakai mulai breakpoint lg).
        "ato-d-display": ["56px", { lineHeight: "61.6px", letterSpacing: "-1.12px", fontWeight: "800" }],
        "ato-d-h1": ["40px", { lineHeight: "48px", letterSpacing: "0px", fontWeight: "700" }],
        "ato-d-h2": ["28px", { lineHeight: "36.4px", letterSpacing: "0px", fontWeight: "700" }],
        "ato-d-h3": ["20px", { lineHeight: "28px", letterSpacing: "0px", fontWeight: "600" }],
        "ato-d-body-l": ["18px", { lineHeight: "27.9px", letterSpacing: "0px", fontWeight: "400" }],
        "ato-d-body": ["16px", { lineHeight: "24.8px", letterSpacing: "0px", fontWeight: "400" }],
      },
      boxShadow: {
        // Efek style Figma
        "ato-glass": "inset 0 1px 0 0 rgba(255,255,255,0.9), 0 12px 32px -8px rgba(13,23,33,0.08)",
        "ato-glass-strong": "inset 0 1px 0 0 #ffffff, 0 20px 48px -12px rgba(13,23,33,0.12)",
        "ato-gloss":
          "inset 0 1px 0 0 rgba(255,255,255,0.45), inset 0 -2px 4px 0 rgba(13,23,33,0.14), 0 6px 14px -4px rgba(13,23,33,0.2)",
        // Bayangan keras hitam yang berulang di 06 (bukan style Figma)
        "ato-hard-sm": "2px 2px 0 0 var(--ato-ink)",
        "ato-hard-md": "2px 4px 0 0 var(--ato-ink)",
        "ato-hard-lg": "4px 4px 0 0 var(--ato-ink)",
      },
      backdropBlur: {
        "ato-glass": "24px",
        "ato-glass-strong": "40px",
      },
      animation: {
        "marquee": "marquee 35s linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "aurora-1": "aurora-drift-1 24s ease-in-out infinite alternate",
        "aurora-2": "aurora-drift-2 28s ease-in-out infinite alternate",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        "aurora-drift-1": {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(40px, -30px) scale(1.12)" },
          "100%": { transform: "translate(-30px, 20px) scale(0.95)" },
        },
        "aurora-drift-2": {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(-50px, 40px) scale(1.1)" },
          "100%": { transform: "translate(30px, -20px) scale(0.92)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
