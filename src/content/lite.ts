/**
 * Teks statis alur A20 Lite (S-03–S-09, S-07 Error, S-19, S-20), disalin
 * persis dari Figma "06 | Prototype". Konten skenario (pertanyaan, opsi,
 * celah, checklist, kalimat peringatan) datang dari API v1, bukan dari sini.
 */
export const liteCopy = {
  header: {
    home: "Beranda",
    back: "Kembali",
    result: "Hasil",
  },
  progress: {
    situation: "LITE · 0/3",
    question: (step: 1 | 2 | 3) => `LITE · ${step}/3`,
    result: "LITE · HASIL",
    action: "LITE · AKSI",
  },
  disclaimer: "Alat bantu berpikir, bukan deteksi pasti.",

  // S-03 (node 56:6842 / 56:6933)
  situation: {
    title: "Situasi apa yang kamu hadapi?",
    divider: "atau",
    textLabel: "Tempel / ceritakan situasinya",
    exampleButton: "Contoh fiktif ↻",
    placeholder: "Tempel atau ceritakan situasinya… (boleh fiktif)",
    maskedChip: (n: number) => `${n} data disamarkan`,
    helper:
      "Pakai contoh atau ceritakan ulang tanpa data asli. Nomor, email, dan rekening akan disamarkan di perangkatmu. Tidak ada yang disimpan.",
    tooShort: "Tambahkan sedikit lagi, atau pilih kategori di atas.",
    next: "Lanjut →",
  },

  // S-04–S-06 (node 56:7089) + OtherOption 02 (node 52:59)
  question: {
    messageLabel: "PESAN (FIKTIF)",
    modeLabel: "MODE PELAKU",
    hint: "Pilih 1–2",
    otherLabel: "Lainnya (singkat, tanpa data pribadi)",
    otherPlaceholder: "Tulis singkat, tanpa data pribadi…",
    back: "Kembali",
    next: "Lanjut →",
    finish: "Lihat hasil →",
  },

  // S-07 (node 56:7268 / 56:8425)
  loading: {
    /** Figma: "Menyusun celah yang kamu temukan…" — elipsis diganti tiga titik beranimasi (LoadingScreen). */
    title: "Menyusun celah yang kamu temukan",
    /** Tips pertama; tips berikutnya = `explanation` taktik dari GET /lite/tactics. */
    body: "Pelaku suka membuatmu merasa sempat tapi terburu-buru.",
    /** Juga dipakai di S-03 saat "Lanjut" menunggu lebih dari 3 dtk (keputusan desain mandiri). */
    slow: "Agak lama? Kami siapkan mode terbatas.",
  },

  // S-07 Error (node 56:8446) dan S-19 (node 56:8512)
  offline: {
    title: "Koneksi ke server terputus.",
    body: "Kamu tetap bisa lanjut dengan mode terbatas — hasilnya dibuat di perangkatmu.",
    limited: "Lanjut mode terbatas",
    retry: "Coba lagi",
  },

  // S-08 (node 56:7287)
  result: {
    label: "CELAH YANG KAMU TEMUKAN",
    title: (n: number) => `Kamu menemukan ${n} celah.`,
    foundLabel: "KAMU MENYEBUT",
    quote: (q: string) => `Kamu menyebut: ‘${q}’`,
    missedLabel: "YANG MUNGKIN BELUM KEPIKIRAN",
    missedNote: "Yang mungkin belum kepikiran",
    counterLabel: "PENANGKAL",
    whyLabel: "KENAPA CARA INI BEKERJA",
    next: "Lihat Action Card →",
  },

  // S-09 (node 56:7367)
  action: {
    label: (category: string) => `ACTION CARD · ${category}`,
    title: "Bawa ini bersamamu",
    secureLabel: "1 · AMANKAN DIRI",
    warnLabel: "2 · PERINGATKAN TEMANMU",
    tones: [
      { value: "santai", label: "Santai" },
      { value: "tegas", label: "Tegas" },
    ] as const,
    copy: "Salin kalimat",
    copied: "Tersalin ✓",
    /** Tidak ada di 06 — keputusan desain mandiri (CLAUDE.md). */
    copyFailed: "Gagal menyalin",
    reportLabel: "3 · LAPORKAN",
    pending: "Menunggu verifikasi",
    disclaimer: "Ini alat bantu berpikir, bukan deteksi pasti.",
    helpful: "Membantu?",
    soul: "Coba A20 Soul →",
    saveImage: "Simpan gambar",
    again: "Coba situasi lain",
  },

  // S-20 (node 56:8532)
  rateLimited: {
    title: (seconds: number) => `Pelan-pelan dulu ya. Coba lagi ${seconds} detik lagi.`,
    ok: "OK",
  },
} as const;
