/**
 * Teks sheet S-02 "Pilih Mode", disalin persis dari Figma "06 | Prototype",
 * node 56:8395. Dibuka dari tombol menu (hamburger) di header.
 */
export const modeSheet = {
  title: "Mau mulai dari mana?",
  options: [
    { id: "lite", title: "A20 Lite — Lagi ragu sekarang", meta: "±3 MENIT", href: "/lite" },
    { id: "soul", title: "A20 Soul — Latihan lewat cerita", meta: "±8 MENIT", href: "/soul" },
  ],
  aboutLink: { label: "Pelajari konsepnya di Tentang", href: "/tentang" },
} as const;
