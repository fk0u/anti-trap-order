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

export interface ProblemCard {
  id: string;
  size: "large" | "small";
  category: string;
  title: string;
  chatBubble: {
    sender: string;
    message: string;
    suspiciousHighlight: string;
  };
  theDoubtQuestion: string;
  explanation: string;
}

export interface A20Step {
  number: string;
  codeName: string;
  stage: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  badge?: string;
}

export interface TrustCard {
  title: string;
  tagline: string;
  description: string;
  iconType: "shield" | "database" | "help";
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
    cards: ProblemCard[];
    closingHeadline: string;
  };
  a20System: {
    sectionNumber: string;
    tag: string;
    title: string;
    subtitle: string;
    description: string;
    inversionCallout: {
      title: string;
      description: string;
      nodeUser: string;
      nodeAttacker: string;
      reverseActionText: string;
    };
    steps: A20Step[];
  };
  trust: {
    sectionNumber: string;
    tag: string;
    title: string;
    description: string;
    cards: TrustCard[];
    limitations: {
      title: string;
      description: string;
      points: string[];
    };
  };
  finalCta: {
    tag: string;
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
      { id: "cara-kerja", label: "A20 System", href: "#cara-kerja" },
      { id: "reverse-reflex", label: "Simulator", href: "#reverse-reflex" },
      { id: "drill", label: "Latihan", href: "/drill" },
      { id: "lite", label: "A20 Lite", href: "/lite" },
      { id: "soul", label: "A20 Soul", href: "/soul" },
      { id: "tentang", label: "Tentang", href: "/tentang" },
      { id: "docs", label: "Docs", href: "/docs" },
    ],
    cta: {
      label: "Mulai Latihan",
      href: "/drill",
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
      "Halo kak, ada lowongan admin online, gaji Rp500rb/hari, cukup bayar Rp150rb buat seragam kerja.",
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
    cards: [
      {
        id: "p1",
        size: "large",
        category: "Lowongan Kerja Palsu",
        title: "Keserakahan Ditutup Rasa Butuh",
        chatBubble: {
          sender: "HRD Rekrutmen Fiktif",
          message: "Gaji 450rb/hari cukup input data 2 jam. Transfer 125rb buat ID card & seragam ya, nanti di-refund.",
          suspiciousHighlight: "Transfer 125rb buat ID card & seragam",
        },
        theDoubtQuestion: "Ada yang aneh: kenapa kerjaan enteng gajinya segede ini, tapi disuruh bayar duluan?",
        explanation: "Pelaku memanfaatkan impian kerja fleksibel mahasiswa. Nominal 125rb sengaja dibuat kecil agar korban merasa risikonya sepele.",
      },
      {
        id: "p2",
        size: "small",
        category: "Impersonasi Kontak",
        title: "Empati yang Disandera",
        chatBubble: {
          sender: "Nomor Asing",
          message: "Halo, HP-ku jatuh layarnya retak. Ini nomor baruku, boleh pinjem 300rb buat bayar bengkel?",
          suspiciousHighlight: "Ini nomor baruku, boleh pinjem 300rb",
        },
        theDoubtQuestion: "Ada yang aneh: beneran teman dekat atau orang lain yang nyomot foto profil?",
        explanation: "Pelaku menyandera rasa sungkan kita untuk menolak bantuan kerabat yang sedang terkena musibah mendadak.",
      },
      {
        id: "p3",
        size: "small",
        category: "Rekayasa Teror",
        title: "Kepanikan Melumpuhkan Nalar",
        chatBubble: {
          sender: "Notifikasi Sistem Palsu",
          message: "Aktivitas mencurigakan terdeteksi! Akses m-banking akan DIBEKUKAN dalam 1x24 jam. Klik tautan:",
          suspiciousHighlight: "DIBEKUKAN dalam 1x24 jam",
        },
        theDoubtQuestion: "Ada yang aneh: bank resmi mana yang ngasih ancaman blokir lewat nomor SMS biasa?",
        explanation: "Ancaman pembekuan rekening menciptakan adrenalin tinggi, memicu korban mengklik link phishing sebelum sempat berpikir jernih.",
      },
      {
        id: "p4",
        size: "large",
        category: "Giveaway Berkedok Tebus Hadiah",
        title: "Euforia Menang yang Menjebak",
        chatBubble: {
          sender: "Kreator Akun Tiruan",
          message: "Selamat! Kamu menang iPhone 16 Pro Max. Cukup bayar ongkir asuransi resmi 75rb dalam 30 menit.",
          suspiciousHighlight: "Cukup bayar ongkir asuransi resmi 75rb",
        },
        theDoubtQuestion: "Ada yang aneh: masa menang hadiah jutaan tapi pemenang masih dimintai duit ongkir?",
        explanation: "Akun peniru dibuat sangat mirip dengan kreator asli. Batas 30 menit dirancang agar korban takut hadiah hangus.",
      },
    ],
    closingHeadline:
      "Masalahnya bukan kamu kurang pintar. Kamu belum punya cara mikir-nya.",
  },
  a20System: {
    sectionNumber: "02 / SISTEM A20",
    tag: "Culture Technology for Guardians",
    title: "Dua Lapisan Pembentukan: Dari Refleks Menuju Identitas",
    subtitle: "Alpha to Omega",
    description:
      "Terinspirasi dari pendekatan Culture Technology Lee Soo-man: manusia bukan korban pasif yang perlu dikasihani, melainkan agen yang dilatih instingnya hingga matang.",
    inversionCallout: {
      title: "Prinsip Utama: Perspective Inversion",
      description: "Jangan memposisikan dirimu sebagai korban yang pasif menebak. Masuklah ke kepala pelaku dalam 30 detik: celah apa yang ingin kamu mangsa?",
      nodeUser: "Kamu (Calon Penjaga)",
      nodeAttacker: "Pelaku Manipulasi",
      reverseActionText: "Balik Sudut Pandang 180°",
    },
    steps: [
      {
        number: "01",
        codeName: "A20 Lite",
        stage: "Alpha (The Reflex)",
        title: "The Reflex — Deteksi & Pembedahan Cepat",
        tagline: "Dipakai saat sedang ragu di situasi nyata.",
        description:
          "Masukkan situasi mencurigakan. Sistem memaksamu menjawab 3 pertanyaan taktis dari kacamata pelaku. Celah terkuak, Action Card keluar, pesan peringatan siap kirim ke grup keluarga.",
        features: [
          "Selesai dalam < 90 detik",
          "Membongkar teknik urgensi & rekayasa sosial",
          "Menghasilkan Action Card checklist & kalimat siap copy",
          "Tanpa login & tanpa simpan riwayat chat",
        ],
      },
      {
        number: "02",
        codeName: "A20 Soul",
        stage: "Omega (The Guardian Arc)",
        title: "The Guardian Arc — Simulasi Tanggung Jawab Nyata",
        tagline: "Dipakai saat santai untuk membentuk mental pelindung.",
        description:
          "Pilih orang terdekat yang ingin kamu lindungi (adik kandung, teman kuliah, orang tua). Jalankan misi cerita interaktif di mana setiap responsmu berdampak langsung pada nasib finansial dan rasa percaya mereka.",
        features: [
          "Cerita bersambung dengan konsekuensi nyata",
          "Membentuk empati dan insting diplomasi penjaga",
          "Graf narasi bercabang tanpa jalur generik",
          "Refleksi filosofi kepenjagaan di akhir misi",
        ],
        badge: "Segera Hadir",
      },
    ],
  },
  trust: {
    sectionNumber: "03 / PRINSIP & BATASAN",
    tag: "Kejujuran Radikal",
    title: "Dibangun untuk Melindungi, Bukan Menghisap Privasi",
    description:
      "Kami percaya alat edukasi siber yang kredibel harus berani jujur atas apa yang bisa dan tidak bisa ia lakukan.",
    cards: [
      {
        title: "Tanpa Registrasi & Login",
        tagline: "Zero Credential Barrier",
        description:
          "Gunakan seluruh fitur inti ATO secara langsung tanpa membuat akun, tanpa nomor telepon, dan tanpa login pihak ketiga.",
        iconType: "shield",
      },
      {
        title: "Tidak Menyimpan Data Pribadi",
        tagline: "Stateless Privacy by Design",
        description:
          "Input teks situasi hanya diproses di memori runtime browser dan server tanpa database persisten atau body logging.",
        iconType: "database",
      },
      {
        title: "Bukan Deteksi Kepastian 100%",
        tagline: "Decision Support, Not Magic",
        description:
          "ATO adalah instrumen pelatihan nalar kritis (alat bantu berpikir), bukan jaminan deteksi mutlak. Konfirmasi resmi tetap nomor satu.",
        iconType: "help",
      },
    ],
    limitations: {
      title: "Yang ATO Tidak Bisa (dan Tidak Boleh) Lakukan",
      description: "Kami menolak klaim palsu keamanan yang membodohi publik:",
      points: [
        "ATO TIDAK BISA memulihkan uang yang sudah terlanjur kamu transfer ke penipu.",
        "ATO TIDAK BISA menggantikan verifikasi resmi call center bank atau kontak resmi OJK.",
        "ATO TIDAK MENGELUARKAN skor angka seperti '89% aman' karena manipulasi psikologis manusia dinamis dan tidak bisa direduksi jadi angka tebakan.",
        "ATO TIDAK MENJUAL atau membagikan rekaman teks situasi ke pihak pengiklan mana pun.",
      ],
    },
  },
  finalCta: {
    tag: "Langkah Pertama Seorang Penjaga",
    title: "Sedang dapat pesan atau tawaran yang bikin kamu ragu?",
    description:
      "Uji situasimu sekarang dalam 90 detik. Balik sudut pandangnya ke kepala pelaku, temukan celahnya sendiri, dan amankan langkahmu.",
    ctaLabel: "Coba dengan situasi yang bikin ragu",
    ctaHref: "#reverse-reflex",
  },
  footer: {
    brandName: "Anti Trap Order (ATO)",
    tagline: "Culture Technology for Digital Guardians — Menjadikan kewaspadaan digital sebagai refleks dan identitas anak muda Indonesia.",
    disclaimer:
      "ATO adalah alat bantu simulasi dan kerangka berpikir mandiri (decision support), bukan jaminan deteksi penipuan 100%. Tetap utamakan verifikasi pada institusi resmi.",
    credit: "MIT-Week 2026 · Guardians of the Digital Space",
    links: [
      { label: "Latihan Harian (Daily Drill)", href: "/drill" },
      { label: "A20 Lite (The Reflex)", href: "/lite" },
      { label: "A20 Soul (The Guardian Arc)", href: "/soul" },
      { label: "Filosofi & Batasan", href: "/tentang" },
      { label: "Dokumentasi & Codebase", href: "/docs" },
    ],
  },
};
