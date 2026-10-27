import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
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
