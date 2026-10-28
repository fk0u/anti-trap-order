import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anti Trap Order (ATO) — Digital Guardian",
    short_name: "ATO Guardian",
    description:
      "A20 Culture Technology for Digital Guardians — Latihan Refleks Kritis Melawan Rekayasa Sosial & Penipuan Digital",
    start_url: "/drill",
    display: "standalone",
    orientation: "portrait",
    background_color: "#07090D",
    theme_color: "#07090D",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    categories: ["education", "security", "utilities"],
  };
}
