# Keputusan & Konteks MVP — Anti Trap Order

Ringkasan hasil diskusi perancangan (6–8 November 2026) antara Muhammad dan Claude. Dokumen ini ditulis untuk agen coding (Claude Code) dan anggota tim yang tidak ikut diskusi.

## 1. Kondisi awal

- Lomba: MIT-Week UNMUL 2026, tema *Guardians of the Digital Space*. Syarat: minimal satu fitur interaktif yang hasilnya bergantung pada input user, sudah di-deploy, menghormati privasi, jujur soal keterbatasan.
- Waktu pengerjaan MVP: **3 hari**.
- Pemilik proyek **awam soal ML**; seluruh bagian ML diserahkan ke agen, dengan penjelasan yang bisa dipahami pemula.
- **UI/UX final sudah ada dan tidak boleh diubah**: Figma `Anti Trap Order - DESIGN`, file key `ZYHNsUzibVBzF0PzCfH3rv`.
  - Halaman `03 | Wireframes` (sitemap, alur, matriks state), `04 | Mobile` (20 layar), `05 | Desktop`, `02 | Components`.
- Diagram alur proyek di FigJam: board `b4htkYQFSlJQ1rvIfEOIcw` (7 diagram; sebagian masih memuat Realmulator dan LLM, yang kini **sudah dibatalkan**, lihat §3).

## 2. Layar di wireframe (acuan fitur)

| Layar | Isi penting |
|---|---|
| S-01 Landing | Hero, CTA ke Lite/Soul |
| S-02 Pilih Mode | Sheet: A20 Lite atau A20 Soul |
| S-03 Situasi | 5 CategoryChip **atau** TextArea "tempel/ceritakan"; state Empty/Focus/Filled/Error ("Tambahkan sedikit lagi…")/**Masked** (chip "N data disamarkan di perangkatmu"); tombol "Contoh fiktif ↻" |
| S-04/05/06 Lite Q1–Q3 | Stepper A→Ω, kotak PESAN yang bisa dilipat, **5 OptionCard, pilih 1–2**, OtherOption "Lainnya" maks. 80 karakter |
| S-07 Loading | Default, "Agak lama?" setelah **3 detik**, Error → tombol mode terbatas |
| S-08 Hasil | "Kamu menemukan N celah." Bagian **KAMU MENYEBUT** (GapCard found: TacticBadge, "Kamu menyebut: '…'", penjelasan, blok PENANGKAL) dan **YANG MUNGKIN BELUM KEPIKIRAN** (GapCard missed). Kotak "Kenapa cara ini bekerja", disclaimer |
| S-09 Action Card | ChecklistItem, Segmented **Santai/Tegas** + PhraseCard salin, ChannelItem (placeholder "Menunggu verifikasi"), 👍👎, ekspor gambar 4:5 |
| S-10 Soul Karakter | Template atau buat sendiri: nama panggilan maks. 20 karakter (tolak angka/email), relasi, avatar geometris |
| S-11/S-12 Misi | "MISI n DARI 3", StoryCard, ChoiceCard **A/B/C** (Default/Selected/Locked) |
| S-13 Konsekuensi | Varian Positif/Negatif/Campuran: "APA YANG TERJADI", Meter **Kepercayaan, Kewaspadaan, Keamanan** (5 segmen, badge +5▲/−10▼), "KENAPA BEGINI?" |
| S-14 Ringkasan | Status Penjagaan: **Pemula Waspada / Penjaga Siaga / Penjaga Teguh**, insight, ke Lite |
| S-15 Tentang, S-16 Batasan & Privasi | S-16 menjanjikan: teks yang ditempel/ditulis **hanya di perangkatmu**, **tidak ada data ke pihak ketiga**, pilihan jawaban diproses sementara |
| S-17 404, S-18 500, S-19 API down (sheet, mode terbatas), S-20 Rate limited (hitung mundur 20 detik) | |

Tidak ada layar untuk **Realmulator** maupun **Drill**.

## 3. Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| K1 | **Tidak ada LLM saat runtime.** Tidak memanggil Gemini/Groq/dll. | S-16 menjanjikan teks tidak keluar perangkat dan tidak ke pihak ketiga; UI tidak bisa diubah untuk menambah persetujuan |
| K2 | **ML = Naive Bayes ditulis sendiri di TypeScript, berjalan di browser.** Training juga di TS (`npx tsx`), tanpa Python. | Satu bahasa untuk training dan inferensi (tidak ada beda hasil), tanpa stack tambahan, bisa dijelaskan ke juri |
| K3 | **Arsitektur "Go dan TS terpisah"** (melanjutkan prototipe): Go menyajikan konten dan menghitung hasil Lite/Soul; TS punya salinan logika untuk mode terbatas (S-07 Error, S-19). | Prototipe sudah memakai pola ini; lebih cepat dilanjutkan daripada ditulis ulang |
| K4 | Kesamaan hasil Go vs TS dijaga dengan **fixture bersama** di `testdata/fixtures/` yang dipakai test Go dan test TS. | Prototipe sekarang sudah berbeda hasil antara `reflect-local.ts` dan engine Go |
| K5 | **Server hanya menerima ID**: `scenario_id`, ID opsi, `arc_id`, ID pilihan, nilai meter. Isi "Lainnya" tidak dikirim (`other_filled: true` saja). Nama karakter Soul tidak dikirim; narasi memakai `{{nama}}`/`{{relasi}}` yang diganti di frontend. Body request ditolak jika ada field tak dikenal. | Janji privasi S-16 |
| K6 | **Hasil model ML tidak dikirim ke server.** Server mengirim semua `missed_candidates`; frontend memilih maks. 2 dengan mendahulukan taktik yang terdeteksi model. | Janji privasi; spec tidak perlu field hasil model |
| K7 | **Masking (nomor HP, email, rekening, URL) memakai regex di browser**, bukan model. Go boleh memasking ulang sebagai lapisan kedua, tapi teks memang tidak dikirim. | Masking butuh ketepatan 100% |
| K8 | **Realmulator dikeluarkan dari MVP**; hapus `services/gemini-web2api` (memakai cookie akun Gemini web, berisiko dan melanggar K1) dan route `src/app/api/realmulator/chat`. **Drill** disembunyikan dari navigasi. | Tidak ada di wireframe/sitemap |
| K9 | Batas waktu klien API **3 detik**, lalu mode terbatas. `429` membawa `Retry-After: 20`. | Matriks state UI |
| K10 | 👍👎 di S-09 tidak dikirim ke server; ekspor gambar 4:5 dibuat di browser. | Privasi; tanpa database |
| K11 | Dataset latih ML berupa **data sintetis buatan AI** (ditulis agen), diperiksa sampel oleh tim, dan **diuji dengan 30–50 pesan yang ditulis tim sendiri**. Disampaikan terbuka ke juri. | Tim awam ML dan waktu 3 hari; gaya data sintetis seragam sehingga butuh uji jujur |

Kalimat untuk juri: *"Model Naive Bayes berjalan di perangkat pengguna dan dilatih dengan data sintetis yang dibuat dengan bantuan AI lalu diperiksa tim; diuji dengan pesan yang ditulis tim sendiri. Teks pengguna tidak pernah dikirim ke mana pun."*

## 4. Label bersama

- **Kategori (5)**: `tawaran_kerja`, `giveaway`, `akun_menyamar`, `pinjaman_investasi`, `lainnya`.
- **Taktik (8)**: `urgency` (Urgensi), `upfront_fee` (Biaya di Depan), `impersonation` (Menyamar), `isolation` (Minta Dirahasiakan), `too_good` (Terlalu Bagus), `credential_request` (Minta Kode/Data), `link_or_apk` (Tautan/Aplikasi), `authority` (Klaim Resmi). Nama tampilan final mengikuti TacticBadge di Figma; ID tidak berubah.
- Pemetaan kategori lama → baru: `job_scam` → tawaran_kerja; `giveaway` → giveaway; `impersonation` & phishing CS bank → akun_menyamar; `loan` & investasi kripto → pinjaman_investasi; APK undangan, kurir COD, `generic` → lainnya.

## 5. Selisih prototipe vs wireframe (yang harus diperbaiki)

| Prototipe sekarang | Wireframe |
|---|---|
| Lite menampilkan "Tingkat Bahaya Kritis/Sedang/Ringan" | Tanpa skor atau tingkat bahaya |
| Lite mengirim `free_text` ke server | Teks hanya di perangkat |
| 3 opsi per pertanyaan, pilih satu | 5 opsi, pilih 1–2, + "Lainnya" |
| Hasil top-3 celah campur | found / missed + penangkal + badge taktik |
| Tidak ada masking di UI | Chip "N data disamarkan" |
| Soul: tokoh tetap (Dian, Ayah, Sahabat), meter Trust/Awareness/**Empathy**, 5 node, node ke-2 hanya 2 pilihan, ending Jeda yang Terlambat/Pelindung Sepihak/Penjaga yang Setara (ambang 55) | Tokoh dibuat user, meter Kepercayaan/Kewaspadaan/**Keamanan**, 3 misi A/B/C, ending Pemula Waspada/Penjaga Siaga/Penjaga Teguh |
| Default skenario Lite `job_scam_wfh` (ID tidak ada; yang ada `wfh_admin_fee`) | Bug |
| `scripts/deploy.sh` memuat detail akses server | Pindah ke secret hosting |
| CORS `*` dengan pencocokan substring | Allowlist persis dari env |

Yang dipertahankan: struktur Go (`net/http`, middleware, test), pola fallback lokal, rumus ranking celah `10 × tag cocok + 2 × severity`, template peringatan casual/firm (→ Santai/Tegas), data 10 skenario sebagai dasar konten.

## 6. Pembagian tugas

Dokumen tim lengkap ada di Claude Docs "Pembagian Tugas Tim — Anti Trap Order MVP" (milik Muhammad). Ringkasnya:

- **Backend (Go):** tipe v1, 9 endpoint `/api/v1/*` sesuai `docs/openapi.yaml` dengan validasi ketat, reflect found/missed, Soul 3 misi + peringkat, CORS allowlist, 429 + Retry-After 20, tidak log body, hapus `gemini-web2api`, secret deploy, test + fixture bersama. Endpoint lama dibiarkan sampai frontend pindah.
- **Frontend (TS):** komponen dari halaman Components Figma, klien API v1 (timeout 3 dtk → mode terbatas), 20 layar, hapus "Tingkat Bahaya", sembunyikan Realmulator/Drill, `reflect-local.ts`/`soul-local.ts` ditulis ulang agar lolos fixture bersama, memakai `analyzeText()` dari `src/lib/ml`.
- **ML (agen):** lihat `docs/handoff/ML-SPEC.md`.
- **Konten (tim, agen boleh membuat draf):** 60 opsi baru (jadi 5 per pertanyaan, masing-masing dengan `tags`), `tactic` + `counter` untuk 40 celah, katalog 8 taktik, pemetaan kategori, arc Soul (min. 1, ideal 3) 3 misi × A/B/C dengan konsekuensi dan `deltas`, 3 peringkat + ambang. Semua di folder `content/` sebagai satu sumber untuk Go dan Next.js.

## 7. Keputusan yang masih terbuka

- Siapa menulis dataset ML: agen (default, K11) atau tim. **Tanyakan ke user sebelum membuat dataset.**
- Ambang peringkat Soul untuk meter baru (disepakati tim konten + backend).
- Nama tampilan final 8 badge taktik (cek komponen TacticBadge di Figma).
- Apakah folder `content/` menggantikan `internal/data/*.json` dan `src/data/*.json` sekaligus dalam MVP.
