import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anti Trap Order (ATO) — Digital Guardian",
    short_name: "ATO Guardian",
    description:
      "Jangan hanya waspada. Jadilah penjaganya. Ini alat bantu berpikir, bukan deteksi pasti.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#E0F2FE",
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
