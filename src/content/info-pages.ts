/**
 * Teks S-15 Tentang dan S-16 Batasan & Privasi, disalin persis dari Figma
 * "06 | Prototype" (node 56:8211 dan 56:8292).
 *
 * ⚠️ MENUNGGU KONFIRMASI (klaim fakta — jangan diubah tanpa keputusan Syafar/lead):
 * - S-15 "Berbasis aturan, tanpa model AI" / "Hasil dibuat dengan aturan yang
 *   bisa dibaca, tanpa model AI": menurut K12, analisis teks S-03 memakai model
 *   Naive Bayes di server Go (bukan AI generatif).
 * - S-16 "Teks yang kamu tempel atau tulis — hanya di perangkatmu, selama sesi":
 *   menurut K12, teks S-03 (sudah dimasking) dikirim ke POST /api/v1/lite/analyze,
 *   diproses, lalu dibuang (tidak dicatat/disimpan).
 * - S-15 atribusi tidak menyebut font Alice (OFL) yang dipakai judul.
 * Lihat CLAUDE.md "Menunggu keputusan".
 */
export const aboutCopy = {
  kicker: "TENTANG",
  title: "Tentang ATO",
  a20: {
    label: "APA ITU A20?",
    title: "Dari ragu menuju naluri penjaga",
    paragraphs: [
      "A20 adalah cara kami memandang perjalanan dari Alpha ke Omega: dari ragu terhadap sebuah pesan, menuju naluri untuk menjaga diri dan orang lain.",
      "Idenya terinspirasi dari Culture Technology — teknologi yang tumbuh dari kebiasaan sehari-hari, bukan sekadar fitur.",
      "ATO masih sederhana dan terus belajar. Kami tidak mengklaim bisa mencegah semua penipuan; kami hanya ingin membantumu berpikir sedikit lebih tenang.",
    ],
    steps: [
      { badge: "A", label: "ALPHA", title: "Keraguan mentah", body: "Pesan terasa janggal, tapi belum tahu kenapa." },
      { badge: "↻", label: "LATIHAN", title: "Membalik sudut pandang", body: "Berpikir seperti pelaku selama beberapa menit." },
      { badge: "Ω", label: "OMEGA", title: "Naluri penjaga", body: "Celah dikenali lebih cepat, lalu dibagikan." },
    ],
  },
  how: {
    label: "CARA HASIL DIBUAT",
    title: "Berbasis aturan, tanpa model AI",
    body: "Hasil dibuat dengan aturan yang bisa dibaca, tanpa model AI. Masukan yang sama selalu menghasilkan keluaran yang sama, dan tidak ada tulisanmu yang disimpan.",
  },
  team: {
    label: "TIM",
    title: "Empat peran, satu tujuan",
    roles: [
      { avatar: "1-lingkar", name: "Ketua & Backend" },
      { avatar: "2-tumpuk", name: "Product & QA" },
      { avatar: "3-segitiga", name: "Front-End" },
      { avatar: "4-kotak", name: "UI/UX" },
    ],
  },
  attribution: {
    label: "ATRIBUSI",
    title: "Font dan ikon",
    body: "Font: Plus Jakarta Sans dan JetBrains Mono (SIL Open Font License). Ikon: Lucide (lisensi ISC).",
  },
  /** Disembunyikan: repo GitHub masih privat (404 untuk publik). TODO di halaman /tentang. */
  github: "Lihat di GitHub",
} as const;

export const privacyCopy = {
  kicker: "BATASAN & PRIVASI",
  title: "Batasan & Privasi",
  lead: "Ringkasnya: kami tidak butuh akunmu dan tidak menyimpan apa yang kamu tulis.",
  points: [
    { icon: "user-round-x", label: "Tanpa login" },
    { icon: "shield-check", label: "Tidak menyimpan tulisanmu" },
    { icon: "check", label: "Tidak ada data ke pihak ketiga" },
    { icon: "info", label: "Bukan deteksi pasti" },
  ],
  processed: {
    label: "YANG DIPROSES SEMENTARA",
    items: [
      "Teks yang kamu tempel atau tulis — hanya di perangkatmu, selama sesi.",
      "Pilihan jawabanmu di tiga pertanyaan.",
      "Hasil celah dan Action Card yang sedang ditampilkan.",
    ],
  },
  neverStored: {
    label: "YANG TIDAK PERNAH DISIMPAN",
    items: [
      "Teks aslimu, termasuk nomor, email, dan rekening yang disamarkan.",
      "Identitas atau akun apa pun.",
      "Riwayat sesi setelah halaman ditutup.",
    ],
  },
  limits: {
    label: "BATASAN",
    title: "Yang perlu kamu tahu",
    items: [
      "ATO tidak membuktikan sebuah pesan aman atau menipu.",
      "ATO bukan nasihat hukum atau keuangan.",
      "Kanal pelaporan belum diverifikasi; sementara, gunakan fitur lapor di platform tempat kejadian.",
    ],
  },
  contact: {
    label: "KONTAK",
    title: "Hubungi tim",
    badge: "Menunggu verifikasi",
    body: "Kontak resmi akan dicantumkan setelah diverifikasi tim.",
  },
} as const;
