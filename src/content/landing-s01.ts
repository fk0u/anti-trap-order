/**
 * Teks landing S-01 (mobile), disalin persis dari Figma "06 | Prototype",
 * node 56:6727. Jangan mengubah kalimat tanpa perubahan di Figma.
 *
 * Catatan privasi: kalimat `hero.trust` dan `footer.lines` sudah dikonfirmasi
 * sesuai fakta K12 (keputusan Syafar, 10 Nov 2026). Jawaban FAQ belum ada di Figma.
 */

export interface LandingLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FaqItem {
  question: string;
  /** Kosong = belum ada di Figma; item tidak bisa dibuka. Jangan diisi teks karangan. */
  answer: string;
}

export const landingS01 = {
  header: {
    logoMark: "A→Ω",
    brand: "ATO",
  },

  hero: {
    eyebrow: "A20 CULTURE TECHNOLOGY",
    title: "Jangan hanya waspada. Jadilah penjaganya.",
    body: "Saat ada pesan yang terasa janggal, berpikirlah seperti pelakunya — dan temukan celahnya sendiri.",
    ctaLite: { label: "Coba A20 Lite — 3 menit, tanpa login", href: "/lite" },
    ctaSoul: { label: "Mulai A20 Soul — jaga seseorang lewat cerita", href: "/soul" },
    trust: "Tanpa login · Tanpa data pribadi · Bukan deteksi pasti",
  },

  /** Kartu pratinjau Lite di hero desktop (Figma 06 node "Preview card Lite", frame 56:8549). Ilustrasi statis. */
  preview: {
    progress: "LITE · 1/3",
    mode: "MODE PELAKU",
    message: "Dicari admin input data, Rp500rb/hari, daftar & bayar seragam Rp150rb",
    question: "Kalau kamu yang menipu, apa yang kamu manfaatkan darinya?",
    options: ["Dia butuh uang cepat", "Dia tidak sempat mengecek", "Dia takut ketinggalan kesempatan"],
    found: "Celah ditemukan: Urgensi",
  },

  path: {
    label: "JALUR ALPHA → OMEGA",
    caption: "Dari ragu, lewat tiga pertanyaan, sampai insting penjaga.",
  },

  howItWorks: {
    label: "CARA KERJA",
    title: "Tiga langkah, tanpa ribet",
    steps: [
      { number: "01", text: "Pilih atau tempel situasi" },
      { number: "02", text: "Jadi pelakunya selama 30 detik" },
      { number: "03", text: "Dapat celah + Action Card siap pakai" },
    ],
  },

  example: {
    label: "CONTOH (FIKTIF)",
    /** Hanya desktop (node "Sebelum" / "Sesudah"). */
    before: "SEBELUM",
    after: "SESUDAH",
    message: "Dicari admin input data, Rp500rb/hari, daftar & bayar seragam Rp150rb",
    badges: [
      { icon: "trending-up", label: "Imbalan terlalu besar" },
      { icon: "wallet", label: "Bayar di depan" },
    ],
    note: "Kamu yang menemukan celahnya — bukan skor bahaya.",
  },

  modes: {
    label: "DUA MODE",
    lite: {
      label: "A20 LITE · THE REFLEX",
      body: "Lagi ragu sama sebuah pesan? Cari tahu kenapa terasa janggal, lalu dapatkan langkah dan kalimat peringatannya.",
      cta: { label: "Mulai A20 Lite", href: "/lite" },
    },
    soul: {
      label: "A20 SOUL · THE GUARDIAN ARC",
      body: "Pilih seseorang yang ingin kamu jaga. Setiap keputusanmu berdampak padanya.",
      cta: { label: "Mulai A20 Soul", href: "/soul" },
    },
  },

  faq: {
    label: "PERTANYAAN UMUM",
    items: [
      {
        question: "Kenapa bukan skor bahaya?",
        answer:
          "Manipulasi itu bermain di perasaan dan situasi, jadi tidak bisa dirangkum jadi satu angka. ATO melatih kamu menemukan celahnya sendiri, supaya kamu bisa mengenalinya lagi di pesan berikutnya.",
      },
      {
        question: "Apakah tulisanku disimpan?",
        answer:
          "Tidak. Teks yang kamu tempel disamarkan dulu di perangkatmu (nomor, email, tautan, rekening), lalu dikirim ke server untuk dianalisis dan langsung dibuang. Di mode terbatas, semuanya diproses di perangkatmu. Pilihan jawabanmu hanya dikirim sebagai kode, dan nama panggilan di A20 Soul tidak pernah dikirim.",
      },
      {
        question: "Apakah ini bisa memastikan sebuah pesan penipuan?",
        answer:
          "Tidak. Ini alat bantu berpikir, bukan deteksi pasti. Analisisnya hanya mengenali pola kata untuk memilih skenario latihan, jadi bisa keliru. Kalau ragu, cek lewat kanal resmi dan jangan transfer apa pun dulu.",
      },
      {
        question: "Siapa yang membuat ini?",
        answer: "Tim CALON CEO, untuk MIT-Week UNMUL 2026 dengan tema Guardians of the Digital Space.",
      },
    ] satisfies readonly FaqItem[],
  },

  footer: {
    lines: ["Kami tidak menyimpan apa yang kamu tulis.", "Ini alat bantu berpikir, bukan deteksi pasti."],
    links: [
      { label: "Tentang", href: "/tentang" },
      { label: "Batasan & Privasi", href: "/privasi" },
      // TODO(GitHub): link "GitHub" (Figma 06) disembunyikan — repo masih privat (404 untuk publik).
      // Tampilkan lagi saat repo publik: { label: "GitHub", href: "https://github.com/fk0u/anti-trap-order", external: true }
    ] satisfies readonly LandingLink[],
  },
} as const;
