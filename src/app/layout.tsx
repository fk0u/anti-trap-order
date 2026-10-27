import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Anti Trap Order (ATO) — Culture Technology for Digital Guardians",
  description:
    "Latih insting curiga menjadi refleks penjaga digital. Simulasi Perspective Inversion untuk membongkar trik manipulasi di ruang siber.",
  keywords: [
    "Anti Trap Order",
    "ATO",
    "A20",
    "Digital Guardian",
    "Reverse Reflex",
    "Keamanan Siber",
    "MIT-Week 2026",
  ],
  authors: [{ name: "Hipster — Web Development Lead" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-surface-base font-sans text-text-primary antialiased selection:bg-brand-teal/20 selection:text-brand-cyan">
        {children}
      </body>
    </html>
  );
}
