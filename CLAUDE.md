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

- **UI/UX tidak boleh diubah.** Acuan UI adalah Figma file key `ZYHNsUzibVBzF0PzCfH3rv`, halaman **`06 | Prototype`** (node `14:8`, layar S-01 s.d. S-20). Halaman `03 | Wireframes`, `04 | Mobile`, dan `05 | Desktop` adalah desain lama, abaikan. Halaman `01 | Pondasi` dan `02 | Components` hanya dipakai jika sama dengan 06; jika berbeda, ikuti 06 dan catat di bagian "Untuk desainer". Jika kode atau kontrak berbeda dari 06, kode/kontrak yang menyesuaikan.
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

## Cara kerja

- Kerjakan di branch baru, bukan `main`. Commit kecil per tugas dengan pesan bahasa Indonesia.
- Sebelum mengubah `docs/openapi.yaml`, jelaskan alasannya ke user; perubahan kontrak harus disetujui backend dan frontend.
- Jika menemukan konflik antara wireframe dan dokumen ini, berhenti dan tanyakan ke user.

## Token desain

Token dari Figma 06 ada di `src/app/globals.css` (variabel `--ato-*`) dan `tailwind.config.ts` (awalan `ato-`, mis. `bg-ato-bg-0`, `text-ato-m-body`, `rounded-ato-lg`, `shadow-ato-gloss`). Font di `src/app/fonts.ts`; pasang `atoFontVariables` di wrapper halaman (layout root tidak dipakai untuk font ATO). JetBrains Mono di-host sendiri (`src/app/fonts/`, lisensi OFL) karena versi Google Fonts tidak punya glyph "→". Begitu juga glyph "→"/"↻" Plus Jakarta Sans (subset ±0,7 KB, `atoUiArrows`, ditaruh sebelum `atoUi` di stack font). Token dan class lama (`surface`, `brand`, `aero-*`, dll.) masih dipakai halaman lama, jangan dihapus.

Komponen UI reusable sesuai 06 ada di `src/components/ui/` (`Button`, `TacticBadge`, `StepperAlphaOmega`, `IconButton`, `SiteHeader`, `SiteFooter`, `BottomSheet`, `ConsoleLabel`, `BackButton`, `DisclaimerBanner`, `CategoryChip`, `OptionCard`, `OtherOption`, `BottomActionBar`, `GapCard`, `ChecklistItem`, `Segmented`, `ChannelItem`). Teks layar disimpan di `src/content/` (mis. `landing-s01.ts`, `mode-sheet.ts`, `lite.ts`), disalin persis dari Figma.

Alur Lite: `src/app/lite/page.tsx` → `src/components/lite/LiteFlow.tsx` (state, panggilan API v1 lewat `src/lib/api-v1.ts`, sinkron riwayat browser; refresh kembali ke S-03). Route tanpa MobileTabBar didaftar di `src/lib/routes.ts`. Tombol "Simulasi uji" dari prototype S-07 tidak dibangun (dihapus, keputusan Syafar 10 Nov 2026).

## Menunggu keputusan

- **`src/components/landing/_legacy/`** — komponen landing lama (Navbar, Hero, HeroConsole, Marquee, Problem, A20System, ReverseReflexDemo, Trust, FinalCTA, Footer) yang sudah tidak dipakai S-01. Menunggu keputusan hapus dari lead; jangan dipakai di layar baru. `src/content/landing.ts` masih di-import oleh komponen ini.
- **Teks privasi S-01 — menunggu konfirmasi K12.** Dipakai apa adanya sesuai 06: "Tanpa login · Tanpa data pribadi · Bukan deteksi pasti", "Kami tidak menyimpan apa yang kamu tulis.", dan FAQ "Apakah tulisanku disimpan?". Terkait konflik S-16 ("hanya di perangkatmu") vs K12 (teks S-03 terkirim ke `/api/v1/lite/analyze`).
- **Jawaban FAQ S-01** belum ada di Figma; `answer` di `landing-s01.ts` sengaja kosong (item tidak bisa dibuka). Jangan diisi teks karangan.
- **Batas waktu S-07 — menunggu keputusan lead (K9).** Sementara: chip "Agak lama?" di detik 3 (`SLOW_HINT_MS`), request tetap ditunggu, batas total 10 detik (`REQUEST_TIMEOUT_MS`) lalu S-07 Error dengan pilihan user. Kedua konstanta di `src/lib/api-v1.ts`.
- **Mode terbatas (PR 5).** "Lanjut mode terbatas" (S-07 Error, S-19) tampil sesuai Figma tetapi nonaktif — TODO di `src/components/lite/OfflineActions.tsx`. "Coba lagi" berfungsi.
- **"Simpan gambar" (ekspor 4:5) di S-09** disembunyikan — belum ada desain gambar di 06. TODO di `ActionCardScreen.tsx`; jangan tambah library.
- **Error 500 → S-18** belum dibangun; sementara error server di Lite ditampilkan sebagai S-07 Error / S-19.

## Untuk desainer

Perbedaan antara `01 | Pondasi` / `02 | Components` dan `06 | Prototype`. Kode mengikuti 06 persis; daftar ini menunggu keputusan desainer. Tanda ⚠️ = berisiko (kontras/aturan desain sendiri).

**S-01 Landing (mobile)**

| Elemen | 01 / 02 | 06 (dipakai) |
|---|---|---|
| Judul hero | `ATO/Mobile/Display` = Plus Jakarta Sans ExtraBold 32/35, gelap | Alice Regular 32/35.2, tracking −0.64, putih, `text-shadow 1px 1px 0 #000` |
| Tombol CTA Lite | `#0E7490` solid, teks putih, sheen putih | Gradien pucat: `#00AAD9` 60% di atas putih → putih, border hitam 0.5px, Gloss shadow. Kode ekspor Figma menyebut `#00AAD9 58% → #FFF 98%` (cyan pekat) tetapi render-nya pucat; kode mengikuti render (diukur dari piksel) |
| Tombol CTA Soul | `#B45309` solid | Gradien pucat: `#FFDA37` 72% → putih, border hitam 0.5px, tanpa bayangan (ekspor: `21% → 98%`, sama seperti di atas) |
| ⚠️ Teks tombol CTA | Putih di atas aksen gelap | Putih (dengan garis luar gelap) di atas gradien terang; kontras kemungkinan tidak lolos AA |
| Tombol di kartu Dua Mode | Sama dengan Button | Lite sama dengan CTA hero; Soul lebih pekat: `#FFDA37` 85% → 27% (tidak sampai putih). Diukur dari render |
| ⚠️ Garis luar teks putih | — | Label tombol, judul hero, dan "Tiga langkah" memakai text stroke gelap (tidak ada di kode ekspor, terlihat di render). Ditiru dengan `.ato-text-outline` (2px judul, 1px tombol) |
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

**Token**

- Token 01 yang belum terlihat dipakai di 06 dan karena itu belum ditambahkan ke kode: `danger`, `focus/ring`, `aero/sky-*`, `space/40`, `space/56`, `space/80`, semua text style desktop.
- Nilai mentah di 06 yang bukan Variable Figma (ditambahkan sebagai token kode): `#000` (border/bayangan keras), `#00AAD9`, `#FFDA37`, `#97DCF0`, `#58FF2A`, `rgba(95,227,247,.95)`, `#68E4F8`.
