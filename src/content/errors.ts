/**
 * Teks layar error global, disalin persis dari Figma "06 | Prototype".
 * S-17 = node 56:8468 (404), S-18 = node 56:8489 (500).
 */
export const errorCopy = {
  notFound: {
    code: "404",
    title: "Halaman ini hilang — tapi kamu tetap di jalur penjaga.",
    home: "Kembali ke Awal",
  },
  server: {
    code: "500",
    title: "Ada yang macet di sisi kami. Coba lagi sebentar.",
    retry: "Coba Lagi",
    home: "Beranda",
  },
} as const;
