/**
 * Teks statis A20 Soul (S-10 – S-14), disalin persis dari Figma
 * "06 | Prototype". Cerita, pilihan, konsekuensi, peringkat, dan insight
 * datang dari API v1 (`/api/v1/soul/*`), bukan dari sini.
 */
export const soulCopy = {
  meters: {
    kepercayaan: "Kepercayaan",
    kewaspadaan: "Kewaspadaan",
    keamanan: "Keamanan",
  },

  // S-10 (node 56:7441)
  character: {
    back: "Beranda",
    progress: "SOUL · MISI",
    kicker: "A20 SOUL · THE GUARDIAN ARC",
    title: "Siapa yang ingin kamu jaga?",
    body: "Boleh fiktif. Jangan pakai nama lengkap atau data asli.",
    custom: "Buat sendiri",
    nickname: "Nama panggilan",
    counter: (n: number, max: number) => `${n}/${max}`,
    relation: "Relasi",
    nicknameError: "Pakai nama panggilan saja ya, tanpa nomor atau email.",
    start: "Mulai Misi 1",
    /** Disembunyikan: belum ada halaman yang menjelaskan cara main Soul (TODO di CharacterScreen). */
    howTo: "Lihat cara mainnya",
  },

  // S-11 (node 56:7512 / 56:7576)
  mission: {
    back: "Karakter",
    progress: (i: number, total: number) => `SOUL · MISI ${i}/${total}`,
    title: (i: number, total: number) => `Misi ${i} dari ${total}`,
    storyLabel: "CERITA",
    choose: "Pilih →",
    /** Hanya di desktop 06 (node 58:3909). */
    choicesLabel: "APA YANG KAMU LAKUKAN?",
  },

  // Konfirmasi "Karakter" saat misi berjalan — keputusan desain mandiri (tidak ada di 06).
  changeCharacter: {
    title: "Ganti karakter? Progres misi akan hilang.",
    confirm: "Ganti",
    cancel: "Lanjut misi",
  },

  // S-13 (node 56:7640 / 56:7700 / 60:2684 / 56:8008)
  consequence: {
    back: (i: number) => `Misi ${i}`,
    progress: "SOUL · KONSEKUENSI",
    kicker: (i: number, total: number) => `MISI ${i} DARI ${total}`,
    /** Desktop 06 (node 58:3974) menambahkan akhiran ini pada kicker ("MISI 1 DARI 3 · KONSEKUENSI"). */
    desktopKickerSuffix: " · KONSEKUENSI",
    title: (choice: string) => `Keputusanmu: ${choice}`,
    whatLabel: "APA YANG TERJADI",
    whyLabel: "KENAPA BEGINI?",
    next: (i: number) => `Lanjut ke Misi ${i} →`,
    finish: "Lihat Status Penjagaan →",
  },

  // S-14 (node 56:8128 / 61:5908 / 61:5991)
  summary: {
    back: "Beranda",
    progress: "SOUL · SELESAI",
    title: "Status Penjagaan",
    insightLabel: "INSIGHT",
    lite: "Jalankan Lite untuk situasi serupa →",
    again: "Ulangi dengan karakter lain",
    disclaimer: "Ini alat bantu berpikir, bukan deteksi pasti.",
  },
} as const;
