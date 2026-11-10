# CLAUDE.md — Anti Trap Order (ATO)

## Aturan Git (wajib)

- JANGAN push ke remote dan JANGAN membuat PR ke main tanpa perintah eksplisit dari Syafar.
- Semua kerja di branch lokal. Commit lokal boleh.
- Sebelum push atau membuat PR, tanya dulu dan tunggu jawaban "ya".

Proyek lomba MIT-Week UNMUL 2026 (tema *Guardians of the Digital Space*). Next.js 16 (frontend) + Go (backend), sedang disesuaikan ke wireframe final untuk MVP 3 hari.

## Baca ini dulu, berurutan

1. `docs/handoff/KEPUTUSAN.md` — semua keputusan arsitektur, privasi, dan pembagian tugas yang sudah disepakati. **Mengalahkan** isi `CONTEXT.md`, `RUAS_CONTEXT.md`, `your-prompts.md`, dan `docs/*.md` lama jika bertentangan.
2. `docs/openapi.yaml` + `docs/api-v1.md` — kontrak API v1 (sumber kebenaran antara Go dan TS).
3. `docs/handoff/ML-SPEC.md` — spesifikasi model ML (Go), jika tugasmu menyentuh `internal/ml/` atau `src/lib/ml/`.

## Aturan yang tidak boleh dilanggar

- **UI/UX tidak boleh diubah.** Acuan UI adalah Figma file key `ZYHNsUzibVBzF0PzCfH3rv`, halaman **`06 | Prototype`** (node `14:8`, layar S-01 s.d. S-20). Halaman `03 | Wireframes`, `04 | Mobile`, dan `05 | Desktop` adalah desain lama, abaikan. Halaman `01 | Pondasi` dan `02 | Components` hanya dipakai jika sama dengan 06; jika berbeda, ikuti 06 dan catat di bagian "Keputusan desain mandiri". Jika kode atau kontrak berbeda dari 06, kode/kontrak yang menyesuaikan.
- **Teks S-03 hanya boleh masuk ke `POST /api/v1/lite/analyze`** (K12), sudah dimasking di browser. Go memasking ulang, tidak mencatat/menyimpan teks. Endpoint lain hanya menerima ID. Model ML utama di Go (`internal/ml`); model cadangan di browser milik tim FE.
- **Tidak ada LLM saat aplikasi berjalan.** Jangan menambah panggilan ke Gemini, Groq, OpenAI, atau sejenisnya. `services/gemini-web2api` akan dihapus.
- **Tanpa skor, persen, atau "tingkat bahaya"** di layar mana pun. Selalu sertakan disclaimer "Ini alat bantu berpikir, bukan deteksi pasti."
- Label taktik dan kategori hanya dari `src/types/api-v1.ts` (`TacticId`, `CategoryId`). Go memakai nilai string yang sama persis.
- Semua contoh pesan, nama, nomor, dan merek di data harus fiktif.

## Perintah

```bash
npm run dev                                          # frontend
go run ./cmd/server                                  # backend (port 8080)
go test ./...                                        # test Go
npx @stoplight/prism-cli@5 mock docs/openapi.yaml -p 4010   # mock API v1
go run ./cmd/ml-gendata && go run ./cmd/ml-train   # bangun dataset + latih model ML
```

### Test e2e (Playwright)

Script di `e2e/`, memakai backend Go asli; error (500/502/429/JSON rusak/timeout) dipicu lewat route Playwright. Playwright **tidak** ada di `package.json` — selalu lewat npx (versi dikunci 1.49.1); `e2e/_setup.cjs` mencari modulnya dari folder npx di PATH.

```bash
npx -y playwright@1.49.1 install chromium            # sekali saja

# Terminal 1 — CORS_ORIGIN harus sama persis dengan origin frontend
PORT=8080 CORS_ORIGIN=http://localhost:3000 go run ./cmd/server
# Terminal 2 — build produksi (timing lebih stabil daripada npm run dev)
NEXT_PUBLIC_API_URL=http://localhost:8080 npm run build && npx next start -p 3000

# Terminal 3
npx -y -p playwright@1.49.1 node e2e/lite.cjs          # alur Lite S-03–S-09, privasi request, 429, timeout
npx -y -p playwright@1.49.1 node e2e/errors.cjs        # S-17/S-18/S-19/S-20, validasi respons, Back/refresh
npx -y -p playwright@1.49.1 node e2e/loading-anim.cjs  # animasi S-07 + reduced motion
npx -y -p playwright@1.49.1 node e2e/soul.cjs          # alur Soul S-10–S-14, aturan nama, privasi, riwayat, error
npx -y -p playwright@1.49.1 node e2e/info.cjs          # S-15 /tentang dan S-16 /privasi
npx -y -p playwright@1.49.1 node e2e/offline.cjs       # mode terbatas Lite (semua request API diputus; tanpa backend)
```

- `E2E_BASE_URL` (default `http://localhost:3000`) jika frontend di port lain; samakan dengan `CORS_ORIGIN`.
- Screenshot ke argumen pertama, `E2E_OUT`, atau `<temp>/ato-e2e`.
- `E2E_VIEWPORT` = `390` (default), `768`, `1024`, `1440` (atau `LEBARxTINGGI`). Semua suite harus lolos di keempatnya.
- **Regresi visual mobile (wajib sebelum commit yang menyentuh UI):** tampilan 390px tidak boleh berubah.

```bash
npx -y -p playwright@1.49.1 node e2e/visual.cjs capture <folder-baseline>   # sebelum mengubah kode
npx -y -p playwright@1.49.1 node e2e/visual.cjs capture <folder-baru>       # sesudah build ulang
npx -y -p playwright@1.49.1 node e2e/visual.cjs compare <folder-baseline> <folder-baru>   # harus "32 state identik"
```

  Pembandingan byte per byte (PNG Chromium yang sama identik jika pikselnya identik); animasi dimatikan.
  **Selalu build bersih (`rm -rf .next`) sebelum memotret** — cache Turbopack bisa menyimpan file font lama dan menyembunyikan perubahan rendering.
- `lite.cjs` dan `errors.cjs` masing-masing ±1–2 menit (ada uji timeout 10 dtk). Jalankan ulang setelah mengubah alur Lite.

## Cara kerja

- Kerjakan di branch baru, bukan `main`. Commit kecil per tugas dengan pesan bahasa Indonesia.
- Sebelum mengubah `docs/openapi.yaml`, jelaskan alasannya ke user; perubahan kontrak harus disetujui backend dan frontend.
- Jika menemukan konflik antara wireframe dan dokumen ini, berhenti dan tanyakan ke user.

## Token desain

**Breakpoint (keputusan Syafar, 10 Nov 2026), konstanta di `src/lib/layout.ts`:**

- `< 768` — mobile Figma 06. **Tidak boleh berubah** (cek dengan `e2e/visual.cjs`).
- `768–1023` — tablet tanpa desain: layout mobile, kolom maks. 560px di tengah (`TABLET_COLUMN`).
- `≥ 1024` (`lg:`) — desktop: tata letak **dan gaya visual** frame BROWSER 1440 Figma 06 (diperbarui desainer 10 Nov 2026: sebagian besar sudah gaya Aero mobile), teks tetap versi mobile terbaru. Container 1120 di tengah (`DESKTOP_CONTAINER`). Header desktop `src/components/ui/DesktopHeader.tsx`.
- Gaya desktop hanya lewat kelas `lg:` (dan `md:max-lg:` untuk tablet). Pembungkus grid desktop memakai `display: contents` di bawah lg supaya urutan mobile tetap.
- ⚠️ `cn()` (tailwind-merge) **tidak** mengenal skala spasi `ato-*`: dua kelas spasi `ato-*` yang bentrok pada varian yang sama tidak digabung, pemenangnya ditentukan urutan CSS. Jangan menumpuk kelas spasi bentrok; mendaftarkan skala spasi ke `cn()` sempat mengubah 4 state mobile (dibatalkan).

Token dari Figma 06 ada di `src/app/globals.css` (variabel `--ato-*`) dan `tailwind.config.ts` (awalan `ato-`, mis. `bg-ato-bg-0`, `text-ato-m-body`, `rounded-ato-lg`, `shadow-ato-gloss`). Font di `src/app/fonts.ts`; pasang `atoFontVariables` di wrapper halaman (layout root tidak dipakai untuk font ATO). JetBrains Mono di-host sendiri (`src/app/fonts/`, lisensi OFL) karena versi Google Fonts tidak punya glyph "→". Begitu juga glyph "→"/"↻" Plus Jakarta Sans (subset ±0,7 KB, `atoUiArrows`, ditaruh sebelum `atoUi` di stack font). Token dan class lama (`surface`, `brand`, `aero-*`, dll.) masih dipakai halaman lama, jangan dihapus.

Komponen UI reusable sesuai 06 ada di `src/components/ui/` (`Button`, `TacticBadge`, `StepperAlphaOmega`, `IconButton`, `SiteHeader`, `SiteFooter`, `BottomSheet`, `ConsoleLabel`, `BackButton`, `DisclaimerBanner`, `CategoryChip`, `OptionCard`, `OtherOption`, `BottomActionBar`, `GapCard`, `ChecklistItem`, `Segmented`, `ChannelItem`). Teks layar disimpan di `src/content/` (mis. `landing-s01.ts`, `mode-sheet.ts`, `lite.ts`), disalin persis dari Figma.

Alur Lite: `src/app/lite/page.tsx` → `src/components/lite/LiteFlow.tsx` (state, panggilan API v1 lewat `src/lib/api-v1.ts`). Setiap langkah = satu entri riwayat (`pushState`): Back browser dan tombol "Kembali"/"Hasil" mundur satu langkah; S-07 tidak tersisa di riwayat (Back dari S-08 → Q3). `replaceState` hanya sekali saat `/lite` dimuat. Refresh kembali ke S-03, dan Back dari situ langsung keluar dari `/lite` (entri dari sebelum refresh dilompati lewat `liteSession`/`liteIdx`). Tombol "Simulasi uji" dari prototype S-07 tidak dibangun (dihapus, keputusan Syafar 10 Nov 2026).

Alur Soul: `src/app/soul/page.tsx` → `src/components/soul/SoulFlow.tsx` (pola riwayat sama dengan Lite: `pushState` per langkah, refresh → S-10). Klien `listCharacters`/`startSoul`/`stepSoul` di `src/lib/api-v1.ts`; aturan nama panggilan dan segmen meter di `src/lib/soul/rules.ts`. **Nama panggilan dan relasi tidak pernah dikirim** — hanya dipakai `fillStory()` di browser; server hanya menerima `arc_id`, `mission_id`, `choice_id`, `meters`. Teks layar di `src/content/soul.ts`, avatar di `public/icons/ato/soul/`.

S-15 `/tentang` dan S-16 `/privasi`: `src/app/tentang/page.tsx`, `src/app/privasi/page.tsx`, bagian bersama di `src/components/info/InfoParts.tsx` (header = `LandingHeader` + sheet Pilih Mode), teks di `src/content/info-pages.ts`.

MobileTabBar hanya tampil di route lama yang terdaftar di `ROUTES_WITH_TAB_BAR` (`src/lib/routes.ts`: `/drill`, `/realmulator`, `/docs`). Layar 06 (`/`, `/lite`, `/soul`, `/tentang`, `/privasi`) dan 404 tidak memakainya.

Error API v1 (`errorScreen()` di `src/lib/api-v1.ts`): jaringan/timeout → S-19 sheet (atau S-07 Error saat menunggu hasil); 5xx, 400, 404, JSON rusak, bentuk data salah, ID kategori/taktik tak dikenal → S-18; 429 → S-20. Bentuk respons divalidasi tanpa library di `src/lib/api-v1-validate.ts`. Layar error global: `src/app/not-found.tsx` (S-17), `src/app/error.tsx` dan `src/app/global-error.tsx` (S-18), komponen di `src/components/errors/ErrorScreens.tsx`, teks di `src/content/errors.ts`.

## Menunggu keputusan

- **`src/components/landing/_legacy/`** — komponen landing lama (Navbar, Hero, HeroConsole, Marquee, Problem, A20System, ReverseReflexDemo, Trust, FinalCTA, Footer) yang sudah tidak dipakai S-01. Menunggu keputusan hapus dari lead; jangan dipakai di layar baru. `src/content/landing.ts` masih di-import oleh komponen ini.
- **"Lihat di GitHub" (S-15)** disembunyikan — repo `fk0u/anti-trap-order` masih privat (404 untuk publik). Disetujui Syafar (10 Nov 2026); tampilkan lagi saat repo publik. TODO di `src/app/tentang/page.tsx`.
- **Jawaban FAQ S-01** tidak ada di Figma; ditulis agen atas permintaan Syafar (10 Nov 2026) di `landing-s01.ts`, hanya memakai fakta yang sudah ada di aplikasi (K12, S-16, disclaimer, tim). Jangan menambah klaim baru tanpa konfirmasi.
- **Batas waktu S-07 — menunggu keputusan lead (K9).** Sementara: chip "Agak lama?" di detik 3 (`SLOW_HINT_MS`), request tetap ditunggu, batas total 10 detik (`REQUEST_TIMEOUT_MS`) lalu S-07 Error dengan pilihan user. Kedua konstanta di `src/lib/api-v1.ts`.
- **Mode terbatas Lite (selesai).** "Lanjut mode terbatas" (S-07 Error, S-19) aktif: `src/lib/lite/engine.ts` memilih API v1 atau mesin lokal `src/lib/offline/` (port TS dari `internal/ml` dan `internal/lite/reflect.go`, data `internal/data/v1` + `internal/ml/model.json` diimpor langsung, dimuat lewat dynamic import). Tidak pernah beralih sendiri; hanya setelah user menekan tombolnya. Dijaga `npx -y tsx scripts/verify-offline.ts` (fixture Go, harus 51/51) dan `e2e/offline.cjs`. Setelah mengubah model/konten/aturan Go, jalankan keduanya. Tombol aktif membuat state S-07 Error/S-19 berbeda dari baseline visual lama (tombol tidak lagi redup 40%).
- **Mode terbatas Soul.** S-19 di Soul memakai sheet yang sama dengan Lite; "Lanjut mode terbatas" nonaktif (jawaban Syafar no. 12).
- **Kanvas Figma 06: 9 foto ("image 1–9")** di atas frame, bukan elemen UI. Tidak dipakai (aturan data fiktif); minta desainer menghapusnya.
- **"Lihat cara mainnya" (S-10)** disembunyikan — `/tentang` belum menjelaskan cara main Soul. TODO di `CharacterScreen.tsx` (jawaban no. 6).
- **Untuk tim konten (Soul) — data API dipakai apa adanya (jawaban no. 2 dan 3):**
  - S-10 06: kartu "Nadia, 17 / Adik", "Teman Kuliah / Teman", "Ibu / Orang tua", "Adik Tingkat / Adik tingkat". API: nama `default_name` (Nadia, Ibu, Raka, Salsa) + label relasi (Adik, Ibu, Teman Kuliah, Adik Tingkat). Avatar Ibu di API `2-tumpuk` (di 06 bentuk segitiga).
  - Cerita, pilihan, konsekuensi, deskripsi peringkat, dan insight di API berbeda kata dengan contoh di 06.
  - Template "Ibu" + cerita `{{nama}}, {{relasi}} kamu` menghasilkan "Ibu, ibu kamu". Dibiarkan; perlu diperbaiki di konten.
- **"Simpan gambar" (ekspor 4:5) di S-09** disembunyikan — belum ada desain gambar di 06. TODO di `ActionCardScreen.tsx`; jangan tambah library.

## Belum dikerjakan

- Tidak ada layar 06 yang tersisa: S-01 – S-20 sudah dibangun untuk mobile, tablet (layout mobile 560), dan desktop. Yang masih tertunda ada di "Menunggu keputusan".

## Keputusan desain mandiri

Desainer tidak tersedia. Bagian ini mencatat (1) perbedaan antara `01 | Pondasi` / `02 | Components` dan `06 | Prototype` — kode mengikuti 06 persis — dan (2) semua bagian yang tidak ada desainnya di 06 dan dibuat sendiri dengan token `ato-*`, komponen yang ada, dan pola layar error yang ada. Teks berisi klaim fakta (privasi, penyimpanan data, hukum) tidak boleh dikarang; tandai dan tanyakan ke Syafar. Tanda ⚠️ = berisiko (kontras/aturan desain sendiri).

**S-01 Landing (mobile)**

| Elemen | 01 / 02 | 06 (dipakai) |
|---|---|---|
| Judul hero | `ATO/Mobile/Display` = Plus Jakarta Sans ExtraBold 32/35, gelap | Alice Regular 32/35.2, tracking −0.64, putih, `text-shadow 1px 1px 0 #000` |
| Tombol CTA Lite | `#0E7490` solid, teks putih, sheen putih | Gradien pucat: `#00AAD9` 60% di atas putih → putih, border hitam 0.5px, Gloss shadow. Kode ekspor Figma menyebut `#00AAD9 58% → #FFF 98%` (cyan pekat) tetapi render-nya pucat; kode mengikuti render (diukur dari piksel) |
| Tombol CTA Soul | `#B45309` solid | Gradien pucat: `#FFDA37` 72% → putih, border hitam 0.5px, tanpa bayangan (ekspor: `21% → 98%`, sama seperti di atas) |
| Teks tombol CTA | Putih di atas aksen gelap | 06: putih bergaris luar gelap di atas gradien terang (sulit dibaca). **Kode menyimpang atas keputusan Syafar (10 Nov 2026):** label hitam tanpa garis luar, sama dengan tombol alur Lite 06 (varian `aqua`). Berlaku untuk semua tombol `Button` varian `lite`/`soul`: CTA hero, kartu Dua Mode, dan "Coba A20 Soul →" S-09 — mobile dan desktop (desktop 06 terbaru juga putih bergaris luar). Gradien dan border tetap. Mohon desainer memperbarui 06 |
| Tombol di kartu Dua Mode | Sama dengan Button | Lite sama dengan CTA hero; Soul lebih pekat: `#FFDA37` 85% → 27% (tidak sampai putih). Diukur dari render |
| ⚠️ Garis luar teks putih | — | Judul hero dan "Tiga langkah" memakai text stroke gelap (tidak ada di kode ekspor, terlihat di render). Ditiru dengan `.ato-text-outline` (2px). Label tombol tidak lagi bergaris luar (lihat "Teks tombol CTA") |
| Hover / pressed / focus | 02 punya 6 state | 06 tidak menggambar state interaksi. Kode hanya menambah cincin fokus keyboard (aksesibilitas) |
| Header: logo | Tanpa bayangan | `shadow 2px 2px 0 #000` |
| Header: tombol menu | `bg/1`, border `border/subtle` | Gradien `#FFF → #97DCF0`, border hitam 0.5px, `shadow 2px 4px 0 #000` |
| Stepper A→Ω | Lingkaran `lite/accent` solid | Lingkaran gradien (`#33BADF`/`#4CC2E3`/`#67CBE7` → putih), border hitam 0.3px, garis gradien `#7DE3FF → #0E7490` |
| Kartu "Jalur Alpha → Omega" | Glass | Putih, border hitam 0.5px, `shadow 4px 4px 0 #000` |
| Kartu "Cara kerja" | Glass putih | Gradien `#FFF → #97DCEF`, border hitam 0.5px, tinggi 100px |
| ⚠️ Judul "Tiga langkah, tanpa ribet" | Gelap | Putih (H2 22px) di atas latar terang; kontras rendah |
| ⚠️ Gelembung pesan contoh | Netral | Gradien `#FFF → #58FF2A`; bertentangan dengan aturan 01 "Hindari: hijau ala hacker, gradien neon" |
| Latar atas "Aero sky" | Ellipse `aero/sky-*` dengan blur | Linear `rgba(95,227,247,.95) → transparan`, tinggi 560px |
| Footer | Tanpa latar | Gradien `#FFF → #68E4F8` |
| TacticBadge, item FAQ, kartu Dua Mode | — | Sama dengan 02 |
| Stepper step selain 2 | — | 06 S-01 hanya menampilkan step 2; step lain mengikuti pola yang sama dan belum dicek |
| FAQ terbuka | — | State terbuka tidak digambar di 06; kode menampilkan jawaban di bawah pertanyaan dan tanda "−" |

**S-02 Pilih Mode (sheet dari tombol menu)**

| Elemen | 01 / 02 | 06 (dipakai) |
|---|---|---|
| Scrim | — | 06: `text/1` pekat penuh, halaman di belakang tidak terlihat. **Kode menyimpang atas keputusan Syafar (9 Nov 2026):** scrim `text/1` 50% + sheet meluncur dari bawah, supaya tidak terasa seperti pindah halaman. Mohon desainer memperbarui 06 |
| Kartu mode | — | Lite: gradien `#78E8F9 → putih` (ke atas); Soul: `putih → #FFDA3F`; border hitam 0.5px |
| Ikon kartu | Ikon Lucide warna aksen | Stroke gradien (`#7CE9F9`, `#FFDA42`); dipakai SVG asli dari Figma |
| ⚠️ Link "Pelajari konsepnya di Tentang" | — | Warna `#82E9F9` di atas putih; kontras sangat rendah |

**A20 Lite (S-03 – S-09, S-19, S-20)**

| Elemen | 01 / 02 | 06 (dipakai) |
|---|---|---|
| ⚠️ Tampilan masking di TextArea S-03 | — | 06 menampilkan isi kotak sudah tersamar (`••••••••123`, `••••@mail.com`). **Kode belum mengubah isi kotak** (kursor bisa melompat saat mengetik) — hanya chip "N data disamarkan". Yang dikirim ke server tetap token `<NOMOR>`/`<EMAIL>`. Format tampilan menunggu keputusan desainer (keputusan Syafar, 10 Nov 2026) |
| ⚠️ "Contoh fiktif ↻" | — | Di 06 label 250px + tombol melebihi baris sehingga "↻" terpotong tepi frame. Kode meniru (label satu baris, sisa terpotong); area sentuh diperluas ke ±45px |
| Stepper A→Ω per langkah | Satu gaya | Warna titik/garis berbeda per layar (S-03 abu `#B1C7D5`, S-04–S-08 `#4FC3E3`, titik 2 selalu 16px). Diikuti per langkah di `StepperAlphaOmega` varian `flow` |
| Border 0.3px stepper | — | Browser menggambar min. 1 piksel pekat; ditiru dengan 0.5px hitam 60% agar setipis render 06 (juga di landing) |
| ChannelItem (S-09) | `warning` | Kode ekspor menulis `warning` pekat tanpa opacity; render 06 peach. Diukur dari piksel: latar 8%, garis 40%, badge 21% `warning` di atas putih |
| OtherOption terbuka/terisi | 02 (node 52:66/52:73) | Tidak ada di 06 → memakai 02 |
| Opsi ke-3 saat sudah pilih 2 | — | Tidak digambar di 06; kode menolak pilihan ke-3 tanpa perubahan visual (aria-disabled) |
| "Lanjut mode terbatas" nonaktif | 02 Disabled = opacity 40% | Mode terbatas belum ada; tombol tampil dengan opacity 40% |
| Kotak "PESAN (FIKTIF)" dilipat | — | State tertutup tidak digambar; kode menyembunyikan isi dan memutar "▾" |
| Kartu "PESAN (FIKTIF)" saat user menempel teks sendiri | — | Kode menampilkan `example_message` skenario (sesuai label "FIKTIF"), bukan teks user |

**S-07 Loading — keputusan desain mandiri (tidak ada di Figma 06; keputusan Syafar, 10 Nov 2026)**

| Elemen | Figma 06 | Kode (`src/components/lite/LoadingScreen.tsx`) |
|---|---|---|
| Titik di judul | Teks statis "Menyusun celah yang kamu temukan…" (elipsis) | Elipsis diganti 3 titik beranimasi `""` → `.` → `..` → `...` setiap 400 ms (`DOT_STEP_MS`), berulang sampai hasil diterima. Ruang 3 titik selalu ada (titik belum muncul transparan) agar teks rata tengah tidak bergeser; `aria-hidden` |
| Tips di bawah judul | Satu kalimat statis | Bergantian setiap 3 dtk (`TIP_INTERVAL_MS`) dengan fade keluar lalu masuk 300 ms (`TIP_FADE_MS`). Isi: kalimat Figma dulu, lalu `explanation` dari `GET /lite/tactics` (diambil sekali saat `/lite` dibuka; gagal → hanya kalimat Figma, tanpa sheet error). Tidak ada kalimat karangan. Tinggi area = tips terpanjang (semua tips ditumpuk di satu sel grid); `aria-live="off"` |
| `prefers-reduced-motion` | — | Titik tetap `...`; tips berganti tanpa fade (`transition-none`) |
| Satu tampilan loading | Dua frame: Default (judul gradien pudar + cahaya bawah) dan Lambat 3s (judul `text/1` solid, tanpa cahaya bawah) | Hanya desain **Lambat** yang dipakai sejak awal; chip "Agak lama?" tetap muncul setelah 3 dtk. Keputusan Syafar, 10 Nov 2026 |
| Link "Simulasi uji" di bawah S-07 | 4 link alat uji prototype | Dihapus dari kode |
| Tidak berubah | — | Alur, timer 3/10 dtk, chip "Agak lama?", state Error |

**Error dan state yang tidak digambar di 06 (PR 0, keputusan Syafar 10 Nov 2026)**

| Elemen | Figma 06 | Kode |
|---|---|---|
| S-17 (404) | Node 56:8468 | Diikuti persis. Tombol "Kembali ke Awal" tanpa Gloss shadow (sesuai render) |
| S-18 (500) | Node 56:8489 | Diikuti persis. "Beranda": ekspor `178.5deg #FFDA37 14.459% → putih 116.88%`, render lebih pucat; diukur dari piksel = `BUTTON_GRADIENTS.soulMode` (#FFDA37 85% → 27%) |
| S-18 di alur Lite | 06 hanya punya halaman penuh | Ditampilkan sebagai overlay penuh (`alertdialog`) di atas layar alur; "Coba Lagi" mengulang request yang gagal, "Beranda" ke `/` |
| Pemetaan error | 06 hanya menggambar layarnya | 500 tidak lagi tampil sebagai "Koneksi ke server terputus." (S-19); lihat pemetaan di "Token desain" → Error API v1 |
| ID kategori/taktik tak dikenal | — | Diperlakukan sebagai data tidak ditemukan → S-18 |
| S-19: ketuk area gelap | 06: scrim pekat, perilaku tidak digambar | Area gelap tidak menutup sheet (`dismissOnScrim={false}` di `BottomSheet`); Esc tetap menutup |
| S-03 setelah S-19 ditutup dengan Esc saat kategori gagal dimuat | — | Tombol ghost "Coba lagi" (teks dari S-07 Error) di tempat chip kategori |
| 429 saat memuat kategori | — | S-20; setelah "OK", kategori dimuat ulang |
| 429 saat menunggu hasil (S-07) | — | S-20; setelah "OK", kembali ke Q3 |
| S-03 "Lanjut →" sedang memproses | 06 tidak menggambar; 02 punya state Loading | `Button` prop `loading`: spinner `LoaderCircle` 18px di depan label (berputar hanya jika `motion-safe`), klik diabaikan, `aria-busy`, tanpa redup 40% |
| S-03 menunggu > 3 dtk | — | Chip "Agak lama? Kami siapkan mode terbatas." (sama dengan S-07, `SLOW_HINT_MS`) melayang di atas BottomActionBar, tanpa menggeser layout |
| S-09 salin gagal | 06 hanya "Tersalin ✓" | Label tombol menjadi "Gagal menyalin" selama 2 dtk, lalu kembali ke "Salin kalimat" |
| Back browser setelah refresh di tengah alur | — | Refresh → S-03; Back langsung keluar dari `/lite`, entri lama dilompati (lihat "Token desain" → Alur Lite) |

**A20 Soul (S-10 – S-14) — keputusan Syafar 10 Nov 2026 + keputusan desain mandiri**

| Elemen | Figma 06 | Kode |
|---|---|---|
| Avatar | 02 (node 29:39): oranye/pink | 06 S-10: kuning/merah — dipakai SVG dari 06. "1 Lingkar" di 06 hanya ada versi isi pucat (`#F2FF93`); dipakai untuk semua state |
| Avatar karakter buatan sendiri | Tidak digambar | Mengikuti relasi (avatar template dengan relasi sama). Belum ada tempat tampil di 06, jadi belum ditampilkan |
| Ikon panah/centang | SVG Lucide | Memakai `lucide-react` (sama dengan Lite); `BackButton` prop `tone="soul"` (gradien `#ffb628`) |
| "Buat sendiri" | Form selalu terbuka, tidak ada state terpilih | Mengetik/fokus di form = memilih karakter sendiri (kartu template tidak terpilih). Pesan error 06 hanya untuk isi berangka/email/URL; kosong → tombol nonaktif tanpa pesan |
| Aturan nama | "tanpa nomor atau email" | Tolak angka APA PUN + email/URL (`maskText`), maks. 20, spasi dirapikan (jawaban no. 4) |
| Relasi | Input dengan "▾" | `<select>` asli bergaya input 06 |
| Tombol "Mulai Misi 1" | Ekspor `178.57deg #FFDA37 14.459% → putih 116.88%`, render pucat | `BUTTON_GRADIENTS.soulMode` (sama dengan S-18 "Beranda"), tanpa bayangan |
| Warna label progres + ProgressDots S-11 | Frame "Selected" `#ffda37` (hampir tak terlihat di latar kuning); frame "None selected" `soul/accent` | Dipakai `soul/accent` di semua state |
| ⚠️ Kartu konsekuensi S-13 | Ketiga varian (positif/negatif/campuran) memakai gradien hijau `#7aff55` yang sama | Diikuti; beda varian hanya dari badge dan warna meter |
| Warna meter S-13/S-14 | Naik/tetap hijau `#1fc814`, turun merah `#bf0003` | Diikuti per meter dari `deltas`; S-14 memakai selisih `final_meters` − meter awal |
| Segmen meter | 5 segmen | `round(nilai/20)` dijepit 0–5 (jawaban no. 9) |
| Pilihan terkunci saat mengirim (S-12) | Tidak ada di 06 (S-12 hanya di 03 lama) | Pilihan lain redup memakai ChoiceCard "Locked" 02 (opacity 55%), tombol "Pilih →" loading (jawaban no. 7) |
| Misi yang sudah dijawab (Back) | — | Hanya-baca: pilihan tetap, semua kartu terkunci; "Pilih →" membuka lagi S-13 tanpa request baru (jawaban no. 8b) |
| "Karakter" saat misi berjalan | — | BottomSheet "Ganti karakter? Progres misi akan hilang." — "Lanjut misi" (utama, kuning) dan "Ganti" (sekunder) (jawaban no. 11) |
| S-14 "Jalankan Lite…" | — | Link ke `/lite` (jawaban no. 10) |
| ⚠️ S-14 "Ulangi dengan karakter lain" | Teks gradien `#0e7490 → putih` | Diikuti; kontras rendah di bagian bawah huruf |
| Error Soul | Tidak digambar khusus Soul | Memakai S-18/S-19/S-20 yang sama dengan Lite (warna aqua) |
| BottomActionBar | Tidak menempel di 06 (frame panjang) | Menempel di bawah layar (sticky), sama dengan Lite |

**S-15 Tentang / S-16 Batasan & Privasi**

| Elemen | Figma 06 | Kode |
|---|---|---|
| Judul Alice | Ekspor: putih + `text-shadow 1px 1px 0 #000` | Render 06 bergaris luar seperti judul hero S-01 → `.ato-text-outline` + bayangan |
| Avatar tim S-15 | SVG kuning `#FFDA37` (beda dari avatar S-10 `#FFCF00`) | Disimpan terpisah di `public/icons/ato/tentang/` |
| Ikon S-16 | SVG Lucide 22px `lite/accent` | `lucide-react` |
| Footer | Tidak ada di S-15/S-16 | Tidak ditambahkan |
| S-16 butir pertama "Yang diproses sementara" | "Teks yang kamu tempel atau tulis — hanya di perangkatmu, selama sesi." (bertentangan dengan K12) | "Teks yang kamu tempel atau tulis disamarkan dulu di perangkatmu, lalu dikirim ke server untuk dianalisis dan langsung dibuang." (keputusan Syafar, 10 Nov 2026) |
| S-15 "Cara hasil dibuat" | "tanpa model AI" (judul dan isi) | "tanpa AI generatif" — analisis memakai Naive Bayes di server (K12) |
| S-15 Atribusi | Tanpa Alice | Ditambah "Alice (SIL Open Font License)" |

**Desktop (≥ 1024) — frame BROWSER 1440 Figma 06; keputusan Syafar 10 Nov 2026: tata letak dan gaya ikut desktop 06, teks ikut mobile terbaru**

Desainer memperbarui frame desktop 06 pada 10 Nov 2026 (gaya Aero mobile). Kode mengikuti versi terbaru; keputusan Syafar a–g (10 Nov 2026) dicatat di tabel ini.

| Elemen | Figma 06 desktop | Kode |
|---|---|---|
| Gaya visual | Terbaru: gaya Aero mobile (tombol gradien pucat, judul putih bergaris luar, langit kuning) di semua layar desktop | Diikuti di `lg:` (`Button desktop="aero"`); gaya tombol solid 02 desktop dihapus dari kode |
| 3 frame Soul desktop gaya 02 | S-11 Misi 1 "Selected" (58:3890), S-13 Misi 1 "Positif" (58:3966), S-14 "Default" (58:4508) masih cokelat; 21 frame Soul desktop lainnya Aero | Ketiganya **diabaikan karena tidak konsisten**; dipakai versi Aero dari frame sejenis — S-11 "Misi 1 A" (58:4595), S-13 "Negatif" (58:4031), S-14 "Pemula Waspada" (61:6074). Keputusan Syafar, 10 Nov 2026 |
| Teks | Sebagian masih teks lama (mis. "Mulai Misi 1 →", "tanpa model AI") | Teks mobile terbaru dipakai di semua ukuran (termasuk koreksi K12) |
| Teks khusus desktop | Panel S-03, "Langkah berikutnya" S-08, "APA YANG KAMU LAKUKAN?" S-11, "MISI n DARI 3 · KONSEKUENSI" S-13, kartu pratinjau S-01, "SEBELUM/SESUDAH" S-01, stepper vertikal | Dipakai (disalin dari Figma; tidak ada yang menyebut data/privasi) |
| S-02 Pilih Mode | Tidak ada | Tidak dipakai di desktop — perannya diganti link nav header |
| Header (semua layar) | Terbaru (node 214:4934): logo berbayangan keras, link pucat bergaris luar (ekspor menulis putih), CTA gradien `#67e4f7 → putih` (Soul `#ffda37 → putih`) berlabel `text/1`; link aktif tidak dibedakan | `DesktopHeader` satu gaya untuk semua layar; warna link `lite/accent` (Lite, Tentang) dan `soul/accent` (Soul) supaya kontras lolos AA (±5:1) — keputusan Syafar (a), 10 Nov 2026. Halaman aktif hanya `aria-current` |
| Label CTA desktop (S-01 hero, Dua Mode, "Coba A20 Soul →" S-09) | Putih bergaris luar di atas gradien pucat | Hitam / tinta gelap (Dua Mode: `#04222a` / `#2a1a05` sesuai ekspor) — keputusan Syafar (b), sama dengan mobile |
| Badge "Menunggu verifikasi" S-16 | Terbaru: peach dengan teks (dulu render rusak) | Tetap badge mobile S-16 (kuning) — keputusan Syafar (d), 10 Nov 2026 |
| Tombol S-10 | Terbaru: "Mulai A20 Soul" (gradien `#ffda37 → putih`, label `text/1`) | Gaya diikuti; teks tetap "Mulai Misi 1" dari mobile — keputusan Syafar (c) |
| S-14 desktop | Default: langit peach, jalur cokelat; Teguh: campuran; Pemula Waspada: Aero penuh | Mengikuti Pemula Waspada (61:6074): langit kuning, jalur `#f6c900`, judul bergaris luar, "Jalankan Lite" gradien `#78d2eb → putih`, "Ulangi" teks gradien, keduanya 336px. Menggantikan keputusan (f) sebelumnya (ikut Default) |
| Soul S-11 / S-13 desktop | Aero (58:4595 / 58:4031): kartu cerita gradien hijau bergaris hitam, pilihan terpilih `putih → #ffda37` dengan huruf di lingkaran `#ffda37`, meter hijau/merah, "Pilih →" / "Lanjut" gradien `#ffda37 → putih` label `#191919`; kartu "Apa yang terjadi" tetap `soul/surface` bergaris `soul/accent` | Diikuti |
| S-06 desktop | Tombol berlabel "Lanjut →" | Tetap "Lihat hasil →" (teks mobile) |
| "Coba situasi lain" S-09 | Teks aksen dengan bayangan teks `0 4px 4px rgba(0,0,0,.5)` (node 56:9352) | Diikuti |
| Langit Soul desktop | Terbaru: kuning `#ffda37` (S-10 – S-14) | `SoulScreen` kuning di semua layar Soul |
| "Lihat cara mainnya" (S-10), "Simpan gambar" (S-09), "Lihat di GitHub" (S-15) | Ada di desktop | Tetap disembunyikan (keputusan sebelumnya berlaku untuk semua ukuran) |
| Footer S-01 | Link Tentang · Batasan & Privasi · GitHub | Link GitHub disembunyikan di mobile dan desktop — repo masih privat (404 untuk publik); TODO di `src/content/landing-s01.ts` (keputusan Syafar, 10 Nov 2026) |
| Stepper vertikal (panel Lite) | Terbaru: S-03 Alpha gradien `#78e7f7 → putih` bergaris hitam; S-05/S-06 langkah selesai `#78e7f7`; S-04 masih aksen pekat lama | Semua langkah memakai warna S-05/S-06 (`#78e7f7`, "A" `#04222a`); Ω tercapai (S-07/S-08) juga `#78e7f7` (keputusan desain mandiri) |
| Perataan stepper vertikal | Komponen 02 (node 55:167): kolom titik selebar titiknya (28 / 12px), jadi titik kecil, garis, dan label bergeser ke kiri dari A/Ω | Semua titik di kolom 28px yang sama (pusat x 14), label mulai x 40, titik rata tengah dengan labelnya, garis menyambung pusat ke pusat; tinggi total tetap 188px (permintaan Syafar, 10 Nov 2026) |
| Meter Soul (S-11/S-13/S-14 desktop) | Aero: naik/tetap hijau `#1fc814`, turun merah `#bf0003` | Sama dengan mobile |
| S-07 Loading desktop | Tidak ada frame | Panel konteks (progres, stepper di "Hasil", disclaimer) + animasi di kolom kanan maks. 480 |
| S-17 / S-18 / S-20 desktop | Tidak ada frame | Isi di tengah maks. 480 (tablet 560), tanpa header desktop |
| S-19 dan "Ganti karakter?" desktop | Tidak ada frame | Modal 02 (node 52:312) 560px di tengah; tombol gaya Aero (sama dengan mobile, lebar penuh modal); aturan scrim/Esc sama dengan mobile |
| S-09 desktop tanpa tombol "Hasil" | Desain desktop tidak punya tombol kembali | Kembali ke S-08 lewat Back browser |
| BottomActionBar desktop | Tombol di akhir kolom, tidak menempel | Bar menjadi baris tombol biasa (`lg:relative`), rata kanan/kiri sesuai frame |

**Tablet (768–1023) — tanpa desain**

| Elemen | Kode |
|---|---|
| Semua layar | Layout mobile, kolom konten maks. 560px di tengah; latar tetap selebar layar |
| BottomActionBar | Tetap menempel di bawah selebar layar, isinya ikut kolom 560 |
| Sheet (S-02, S-19, "Ganti karakter?") | Sheet bawah selebar 560 di tengah |

**Token**

- Token 01 yang belum terlihat dipakai di 06 dan karena itu belum ditambahkan ke kode: `danger`, `focus/ring`, `aero/sky-*`.
- Token desktop dari frame BROWSER 06 (ditambahkan): text style `ato-d-display` (Alice 56/61.6, tracking −1.12 — judul hero desktop 06 terbaru; Plus Jakarta Sans 800 tidak dipakai lagi dan fontnya dihapus. Catatan: menambah bobot ke `atoUi` mengubah file font variabel dan menggeser rendering teks mobile), `ato-d-h1`, `ato-d-h2`, `ato-d-h3`, `ato-d-body-l`, `ato-d-body`; spasi `ato-40`, `ato-56`, `ato-80`.
- Nilai mentah di 06 yang bukan Variable Figma (ditambahkan sebagai token kode): `#000` (border/bayangan keras), `#00AAD9`, `#FFDA37`, `#97DCF0`, `#58FF2A`, `rgba(95,227,247,.95)`, `#68E4F8`.
