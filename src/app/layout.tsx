import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#E0F2FE",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ato.kousozo.tech"),
  title: {
    default: "Anti Trap Order (ATO) — Culture Technology for Digital Guardians",
    template: "%s | Anti Trap Order (ATO)",
  },
  description:
    "Melatih refleks kritis masyarakat Indonesia membedah rekayasa sosial dan penipuan digital melalui pembalikan sudut pandang (Perspective Inversion).",
  applicationName: "Anti Trap Order",
  keywords: [
    "Anti Trap Order",
    "ATO",
    "A20 Culture Technology",
    "Digital Guardian",
    "Perspective Inversion",
    "Reverse Reflex",
    "Anti Penipuan Online",
    "Keamanan Siber Indonesia",
    "Social Engineering",
    "MIT-Week 2026",
  ],
  authors: [{ name: "Anti Trap Order Team", url: "https://ato.kousozo.tech" }],
  creator: "Anti Trap Order",
  publisher: "Culture Technology Digital Guardians",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://ato.kousozo.tech",
    siteName: "Anti Trap Order (ATO)",
    title: "Anti Trap Order (ATO) — Culture Technology for Digital Guardians",
    description:
      "Melatih refleks kritis masyarakat Indonesia membedah rekayasa sosial dan penipuan digital melalui pembalikan sudut pandang (Perspective Inversion).",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anti Trap Order (ATO) — Culture Technology for Digital Guardians",
    description:
      "Latih insting curiga menjadi refleks penjaga digital. Simulasi Perspective Inversion membedah manipulasi siber.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ATO Guardian",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-surface-base font-sans text-slate-900 antialiased selection:bg-sky-500/20 selection:text-sky-900">
        {children}
        <MobileTabBar />
      </body>
    </html>
  );
}
