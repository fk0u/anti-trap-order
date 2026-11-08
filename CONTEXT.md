# Anti Trap Order (ATO) — Comprehensive System Context

> **A20 Culture Technology for Digital Guardians**  
> *"Melatih refleks kritis masyarakat Indonesia menghadapi rekayasa sosial digital melalui pembalikan sudut pandang (Perspective Inversion)."*

---

## 1. Executive Summary & Core Philosophy

**Anti Trap Order (ATO)** adalah sistem perlindungan dan pelatihan refleks digital berbasis konsep **Culture Technology (A20 — Alpha to Omega)** yang dirintis oleh Lee Soo-man. Proyek ini dibangun bukan sebagai pendeteksi pasif berbasis skor kecerdasan buatan hitam (*black-box score*), melainkan sebagai **alat bantu berpikir mandiri (decision support & reflex trainer)**.

### Invarian Pedagogis: Perspective Inversion (Reverse Reflex)
1. **Bukan Skor Persentase:** Aplikasi detektor konvensional sering menampilkan *"87% penipuan"*, yang membuat pengguna pasif dan tidak memahami alasan manipulasi. ATO menolak model ini.
2. **Kacamata Pelaku:** Pengguna dilatih untuk membedah situasi dari sudut pandang penipu:
   - *Apa celah yang sedang dieksploitasi pelaku?*
   - *Mengapa pelaku menciptakan ilusi waktu terdesak (urgensi palsu)?*
   - *Apa yang terjadi jika korban memverifikasi melalui saluran luar?*
3. **Guardian Arc:** Menumbuhkan tanggung jawab moral untuk melindungi keluarga dan orang terdekat melalui skrip peringatan praktis (*casual* untuk grup WhatsApp keluarga, *firm* untuk pelaporan resmi).

---

## 2. Arsitektur Teknologi & Batasan Sistem

### 2.1 Tech Stack
- **Frontend:**
  - Next.js 16.4.3 (App Router + Turbopack)
  - React 19 + TypeScript 5
  - Tailwind CSS + Framer Motion (micro-animations)
  - Lucide React (standar baku seluruh indikator ikon visual; **bebas emoji mentah**)
  - Web Audio API bawaan untuk sintesis chime tombol tactile tanpa ketergantungan file MP3/WAV eksternal.
- **Backend:**
  - Go 1.22 (Standard Library + Chi HTTP Router)
  - Memory-safe, concurrency-ready, zero-database architecture
  - Advanced Rule-Based Indonesian Social Engineering Tokenizer (`internal/reflect/nlp.go`)
- **Infrastructure & Deployment:**
  - AWS EC2 Singapore (alamat di secret deploy `DEPLOY_HOST`), Ubuntu 24.04 LTS
  - Nginx Reverse Proxy with Let's Encrypt SSL (`https://ato.kousozo.tech`)
  - PM2 Cluster Management (`anti-trap-order` on port 3120, `ato-backend` on port 8080)
  - `rsync`-based automated deployment pipeline (`scripts/deploy.sh`)

### 2.2 Batasan Desain (Design Constraints & Invariants)
1. **Stateless by Design (Zero-Login / Zero-DB):**
   - Tidak ada database pengguna di backend (tidak ada PostgreSQL/MySQL/MongoDB).
   - Streak harian, perolehan XP, dan status modul diselesaikan tersimpan murni di `localStorage` peramban klien (`ato_duolingo_drill_v1`).
   - Tidak ada pengumpulan data pribadi (PII), nomor telepon, atau riwayat pesan obrolan.
2. **Micro-NLP vs. Local LLM:**
   - Spesifikasi hardware VPS memiliki RAM 1.9 GB tanpa GPU. Menjalankan LLM lokal (Ollama / Llama.cpp / Gemma) akan memicu Linux OOM Killer.
   - Go tokenizer mengeksekusi normalisasi bahasa gaul chat Indonesia (`tf`, `rek`, `loker`, `pinjol`, `cair`, `dpt`, `skrg`, `apk`, `wa`) dan ekstraksi 5 vektor manipulasi dalam `< 5ms` dengan konsumsi RAM `< 5MB`.
3. **Konsistensi Visual Antarmuka (No Raw Emojis):**
   - Seluruh status, level, dan kategori di antarmuka web wajib dirender menggunakan komponen ikon vektor Lucide (`Clock`, `Briefcase`, `UserX`, `Package`, `Truck`, `Smartphone`, `HeartCrack`, `Crown`, `Trophy`, `Compass`, `Zap`, `ShieldCheck`, `BookOpen`), bukan emoji unicode yang tidak konsisten antar OS.

---

## 3. Peta Rute & Modul Aplikasi

| Rute | Deskripsi Modul | Fitur Kunci |
|---|---|---|
| `/` | Landing Page Utama | Hero console interaktif, Problem Bento Grid, A20 System, Reverse Reflex Simulator, Guardian Arc, Trust metrics |
| `/drill` | Latihan Refleks Harian (Daily Drill) | Desain mobile ala Duolingo: 8 level pohon keterampilan (Alpha-Beta-Omega), tombol 3D empuk, audio synthesis, streak harian, XP counter |
| `/lite` | A20 Lite (The Fast Reflex) | Simulator kilat 3 langkah untuk analisis situasi mencurigakan dengan template peringatan instan |
| `/soul` | A20 Soul (The Guardian Arc) | Simulator narasi percabangan dengan konsekuensi emosional saat melindungi anggota keluarga |
| `/tentang` | Filosofi & Batasan Sistem | Visi Culture Technology Lee Soo-man, makna sosiologis istilah "Order", batasan kemampuan ATO, serta komitmen privasi |
| `/docs` | Dokumentasi Resmi & Repo Explorer | Pembaca interaktif 13 bab isi naskah asli Project Outline Draft + tautan unduh DOCX asli |

---

## 4. 10 Skenario Nyata Rekayasa Sosial Indonesia

1. `wfh_admin_fee`: Lowongan Kerja Admin WFH Bayar Seragam
2. `impersonate_blue_badge`: Giveaway Akun Centang Biru Palsu di Medsos
3. `impersonate_new_number`: Pesan Kerabat Ganti Nomor HP & Minta Tolong
4. `phishing_bank_account_freeze`: Notifikasi Rekening Dibekukan / Pembaruan Tarif
5. `loan_shark_no_bi_checking`: Pinjol Kilat Tanpa Syarat & Tanpa BI Checking
6. `apk_wedding_invitation`: Surat Undangan Pernikahan Digital / Tilang .APK
7. `marketplace_cod_scam`: Kurir Paket COD Fiktif Tagihan di Rumah
8. `romance_investment_pigbutchering`: Kenalan Dating App Ajak Trading Crypto / Emas
9. `task_scam_review_maps`: Misi Like Video & Review Google Maps Berhadiah
10. `generic_emergency`: Deteksi Mandiri Situasi Janggal (Skenario Umum)

---

## 5. Struktur Direktori Proyek

```
prototype_ATO/
├── cmd/
│   └── server/
│       └── main.go                 # Entrypoint Go backend API server (:8080)
├── internal/
│   ├── data/
│   │   └── scenarios.json          # Embedded canonical scenarios untuk Go backend
│   ├── handler/
│   │   ├── handler.go              # Router Chi & REST endpoint controller
│   │   └── handler_test.go         # Unit tests handler HTTP
│   ├── model/
│   │   └── types.go                # Structs & contract types (Scenario, Flaw, SafeStep)
│   ├── reflect/
│   │   ├── engine.go               # Perspective Inversion processing engine
│   │   ├── nlp.go                  # Tokenizer & slang normalizer rekayasa sosial
│   │   └── nlp_test.go             # Unit tests NLP Go
│   └── soul/
│       └── engine.go               # Narrative decision tree engine
├── src/
│   ├── app/
│   │   ├── docs/page.tsx           # Dokumentasi 13 bab & DOCX downloader
│   │   ├── drill/page.tsx          # Duolingo-style daily reflex drill (8-stage skill tree)
│   │   ├── lite/page.tsx           # A20 Lite standalone fast simulator
│   │   ├── soul/page.tsx           # A20 Soul narrative consequence simulator
│   │   ├── tentang/page.tsx        # Halaman filosofi A20 & batasan sistem
│   │   ├── layout.tsx              # Root layout + MobileTabBar
│   │   └── page.tsx                # Landing page utama
│   ├── components/
│   │   ├── landing/                # Komponen modular landing page
│   │   └── layout/
│   │       └── MobileTabBar.tsx    # Bottom navigation bar khusus mobile viewport
│   ├── data/
│   │   └── scenarios.json          # Dataset JSON skenario untuk client-side Next.js
│   ├── lib/
│   │   ├── api.ts                  # Fetcher API ke Go backend dengan fallback lokal
│   │   └── reflect-local.ts        # Client-side reflection fallback engine
│   └── types/
│       └── api.ts                  # TypeScript types sinkron dengan Go structs
├── docs/
│   └── Anti Trap Order Project Outline Draft.docx # Naskah asli dokumen perancangan
├── scripts/
│   └── deploy.sh                   # Script otomatis rsync, build & reload PM2 di EC2
├── CONTEXT.md                      # Dokumentasi komprehensif sistem (file ini)
├── RUAS_CONTEXT.md                 # Context & vibe memory Ruas AI-native
├── package.json                    # Dependensi frontend Next.js 16
└── tsconfig.json                   # Konfigurasi TypeScript
```

---

## 6. Panduan Menjalankan & Menguji Proyek

### 6.1 Menjalankan Frontend Secara Lokal
```bash
npm install
npm run dev
# Buka http://localhost:3000
```

### 6.2 Membangun & Memvalidasi Build
```bash
npm run build
```

### 6.3 Menjalankan Go Backend (Opsional di Lingkungan Go)
```bash
go test -v ./...
go run cmd/server/main.go
# Server aktif di http://localhost:8080
```

### 6.4 Melakukan Deployment ke Server Produksi
```bash
./scripts/deploy.sh
# Melakukan rsync source code ke EC2, build Go & Next.js, dan reload PM2
```
