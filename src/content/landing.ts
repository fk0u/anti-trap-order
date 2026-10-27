export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface MarqueeChip {
  id: string;
  text: string;
  category: "phishing" | "impersonasi" | "urgensi" | "lowongan" | "finansial";
}

export interface ScamHighlight {
  phrase: string;
  label: string;
  note: string;
}

export interface HeroConsoleContent {
  chatSender: string;
  chatTime: string;
  chatMessage: string;
  typingText: string;
  victimModeLabel: string;
  attackerModeLabel: string;
  attackerInsight: string;
  highlights: ScamHighlight[];
  actionCard: {
    badge: string;
    vulnerabilitiesCount: number;
    title: string;
    vulnerabilities: string[];
    safeSteps: string[];
    warningCopyText: string;
    copyButtonLabel: string;
    copiedButtonLabel: string;
  };
}

export interface LandingContent {
  nav: {
    brandName: string;
    badge: string;
    links: NavLink[];
    cta: {
      label: string;
      href: string;
      kbdShortcut: string;
    };
  };
  hero: {
    announcement: {
      tag: string;
      text: string;
      href: string;
    };
    headline: {
      line1: string;
      line2Part1: string;
      line2Highlight: string;
      line2Part2: string;
    };
    headlineAlternative: string;
    subheadline: string;
    primaryCta: {
      label: string;
      href: string;
    };
    secondaryCta: {
      label: string;
      targetId: string;
    };
    microcopy: string[];
  };
  marqueeChips: MarqueeChip[];
  heroConsole: HeroConsoleContent;
  problem: {
    sectionNumber: string;
    tag: string;
    title: string;
    description: string;
    closingHeadline: string;
  };
  a20System: {
    sectionNumber: string;
    tag: string;
    title: string;
    description: string;
  };
  trust: {
    sectionNumber: string;
    tag: string;
    title: string;
    description: string;
  };
  finalCta: {
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
  footer: {
    brandName: string;
    tagline: string;
    disclaimer: string;
    credit: string;
    links: { label: string; href: string; badge?: string }[];
  };
}

export const landingContent: LandingContent = {
  nav: {
    brandName: "ATO",
    badge: "A20 Engine",
    links: [
      { id: "masalah", label: "Masalah", href: "#masalah" },
      { id: "cara-kerja", label: "Cara Kerja", href: "#cara-kerja" },
      { id: "reverse-reflex", label: "Reverse Reflex", href: "#reverse-reflex" },
      { id: "tentang", label: "Tentang", href: "#tentang" },
    ],
    cta: {
      label: "Coba Reverse Reflex",
      href: "#reverse-reflex",
      kbdShortcut: "⌘K",
    },
  },
  hero: {
    announcement: {
      tag: "MIT-Week 2026",
      text: "Guardians of the Digital Space",
      href: "https://mitweek.id",
    },
    headline: {
      line1: "Curiga itu insting.",
      line2Part1: "Latih jadi ",
      line2Highlight: "refleks penjaga.",
      line2Part2: "",
    },
    headlineAlternative: "Jangan tebak penipu. Berpikirlah seperti mereka.",
    subheadline:
      "Bukan alat cek skor bahaya. Ini ruang latihan membalik sudut pandang ke kepala pelaku agar kamu tahu persis di mana jebakannya sebelum melangkah.",
    primaryCta: {
      label: "Coba Reverse Reflex",
      href: "#reverse-reflex",
    },
    secondaryCta: {
      label: "Lihat cara kerjanya",
      targetId: "cara-kerja",
    },
    microcopy: [
      "Tanpa login",
      "Tanpa simpan data",
      "Alat bantu berpikir, bukan detektor pasti",
    ],
  },
  marqueeChips: [
    { id: "chip-1", text: "Tawaran kerja WFH Rp500rb/hari", category: "lowongan" },
    { id: "chip-2", text: "Giveaway centang biru palsu", category: "urgensi" },
    { id: "chip-3", text: "Nomor baru, ini aku ganti HP", category: "impersonasi" },
    { id: "chip-4", text: "Link verifikasi akun dibekukan", category: "phishing" },
    { id: "chip-5", text: "Pinjol kilat tanpa BI checking", category: "finansial" },
    { id: "chip-6", text: "Top-up game diskon 80%", category: "finansial" },
    { id: "chip-7", text: "Tugas review map bayar instan", category: "lowongan" },
    { id: "chip-8", text: "Undangan digital paket .apk", category: "phishing" },
  ],
  heroConsole: {
    chatSender: "Admin HR Rekrutmen (Fiktif)",
    chatTime: "14:02",
    chatMessage:
      "Halo kak, ada lowongan admin online, gaji Rp500rb/hari, cukup bayar Rp150rb buat seragam kerja 🙏",
    typingText: "mengetik pesan...",
    victimModeLabel: "Mode: Sasaran",
    attackerModeLabel: "Mode: Pelaku",
    attackerInsight:
      "Trik pelaku: Pasang iming-iming imbalan tinggi tak masuk akal, lalu minta setoran awal kecil saat target sedang tergiur.",
    highlights: [
      {
        phrase: "Rp500rb/hari",
        label: "umpan imbalan palsu",
        note: "Gaji tidak proporsional untuk memicu keserakahan & menurunkan skeptisisme.",
      },
      {
        phrase: "cukup bayar Rp150rb",
        label: "pungutan di depan",
        note: "Pekerjaan legal tidak memungut biaya seragam atau registrasi sebelum kerja.",
      },
    ],
    actionCard: {
      badge: "Reverse Reflex Result",
      vulnerabilitiesCount: 2,
      title: "2 Celah Manipulasi Ditemukan Sendiri",
      vulnerabilities: [
        "Umpan nominal instan tanpa kualifikasi riil",
        "Biaya registrasi berkedok seragam/administrasi",
      ],
      safeSteps: [
        "Hentikan chat, jangan transfer dengan alasan apa pun",
        "Cari nama entitas resmi di kanal komunikasi resmi perusahaan",
      ],
      warningCopyText:
        "Hati-hati, tawaran kerja ini minta biaya di depan sebesar Rp150rb dengan iming-iming Rp500rb/hari. Perusahaan resmi tidak pernah minta uang pendaftaran/seragam kepada pelamar.",
      copyButtonLabel: "Salin Peringatan",
      copiedButtonLabel: "Tersalin ke Clipboard!",
    },
  },
  problem: {
    sectionNumber: "01 / MASALAH",
    tag: "Blind Spot Realita",
    title: "Mengapa Informasi Keamanan Saja Tidak Pernah Cukup?",
    description:
      "Sebagian besar anak muda sudah tahu bahwa penipuan itu ada. Namun saat pesan masuk di jam sibuk dengan nada meyakinkan, otak manusia bekerja dengan bias cepat.",
    closingHeadline:
      "Masalahnya bukan kamu kurang pintar. Kamu belum punya cara mikir-nya.",
  },
  a20System: {
    sectionNumber: "02 / SISTEM A20",
    tag: "Culture Technology for Guardians",
    title: "Dua Lapisan Pembentukan: Dari Refleks Menuju Identitas",
    description:
      "Terinspirasi dari pendekatan sistematis Culture Technology Lee Soo-man: manusia bukan korban pasif yang perlu dikasihani, melainkan agen yang dilatih instingnya hingga matang.",
  },
  trust: {
    sectionNumber: "03 / PRINSIP & BATASAN",
    tag: "Kejujuran Radikal",
    title: "Dibangun untuk Melindungi, Bukan Menghisap Privasi",
    description:
      "Kami percaya alat edukasi yang kredibel harus berani transparan atas apa yang bisa dan tidak bisa ia lakukan.",
  },
  finalCta: {
    title: "Sedang dapat pesan atau tawaran yang bikin ragu?",
    description:
      "Uji situasimu sekarang dalam 2 menit. Balik sudut pandangnya, temukan celahnya, dan amankan langkahmu.",
    ctaLabel: "Coba dengan situasi yang lagi bikin kamu ragu",
    ctaHref: "#reverse-reflex",
  },
  footer: {
    brandName: "Anti Trap Order (ATO)",
    tagline: "Culture Technology for Digital Guardians — Menjadikan kewaspadaan digital sebagai refleks dan identitas anak muda Indonesia.",
    disclaimer:
      "ATO adalah alat bantu simulasi dan kerangka berpikir mandiri (decision support), bukan jaminan deteksi penipuan 100%. Tetap utamakan verifikasi pada institusi resmi.",
    credit: "MIT-Week 2026 · Guardians of the Digital Space",
    links: [
      { label: "Reverse Reflex (Lite)", href: "#reverse-reflex" },
      { label: "Guardian Arc (Soul)", href: "#a20-system", badge: "Segera Hadir" },
      { label: "Batasan & Privasi", href: "#trust" },
      { label: "Tentang A20", href: "#a20-system" },
    ],
  },
};
