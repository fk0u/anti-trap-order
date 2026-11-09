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

Token dari Figma 06 ada di `src/app/globals.css` (variabel `--ato-*`) dan `tailwind.config.ts` (awalan `ato-`, mis. `bg-ato-bg-0`, `text-ato-m-body`, `rounded-ato-lg`, `shadow-ato-gloss`). Font di `src/app/fonts.ts`; pasang `atoFontVariables` di wrapper halaman (layout root tidak dipakai untuk font ATO). Token dan class lama (`surface`, `brand`, `aero-*`, dll.) masih dipakai halaman lama, jangan dihapus.

## Untuk desainer

Perbedaan antara `01 | Pondasi` / `02 | Components` dan `06 | Prototype`. Kode mengikuti 06 persis; daftar ini menunggu keputusan desainer. Tanda ⚠️ = berisiko (kontras/aturan desain sendiri).

**S-01 Landing (mobile)**

| Elemen | 01 / 02 | 06 (dipakai) |
|---|---|---|
| Judul hero | `ATO/Mobile/Display` = Plus Jakarta Sans ExtraBold 32/35, gelap | Alice Regular 32/35.2, tracking −0.64, putih, `text-shadow 1px 1px 0 #000` |
| Tombol CTA Lite | `#0E7490` solid, teks putih, sheen putih | Gradien `#00AAD9 58% → #FFF 98%`, border hitam 0.5px, Gloss shadow |
| Tombol CTA Soul | `#B45309` solid | Gradien `#FFDA37 21% → #FFF 98%`, border hitam 0.5px, tanpa bayangan |
| ⚠️ Teks tombol CTA | Putih di atas aksen gelap | Putih (dengan garis luar gelap) di atas gradien terang; kontras kemungkinan tidak lolos AA |
| Tombol di kartu Dua Mode | Sama dengan Button | Titik gradien beda dari CTA hero (Lite `#00AAD9 62.5% → #FFF 105.8%`, Soul `#FFDA37 14.5% → #FFF 116.9%`) |
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

**Token**

- Token 01 yang belum terlihat dipakai di 06 dan karena itu belum ditambahkan ke kode: `danger`, `focus/ring`, `aero/sky-*`, `space/40`, `space/56`, `space/80`, semua text style desktop.
- Nilai mentah di 06 yang bukan Variable Figma (ditambahkan sebagai token kode): `#000` (border/bayangan keras), `#00AAD9`, `#FFDA37`, `#97DCF0`, `#58FF2A`, `rgba(95,227,247,.95)`, `#68E4F8`.
