# Anti Trap Order (ATO)

> **A20 Culture Technology for Digital Guardians** — Web Development Competition MIT-Week 2026
> Tema: *Guardians of the Digital Space — Empowering Today's Generation Toward a Safer Cyber Ecosystem*
> Studi kasus: *The Trust Trap — Navigating Digital Deception*

[![CI](https://github.com/fk0u/anti-trap-order/actions/workflows/ci.yml/badge.svg)](https://github.com/fk0u/anti-trap-order/actions/workflows/ci.yml)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Go 1.22](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go)](https://go.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**Live:** https://antitraporder.web.id (alias lama: https://ato.kousozo.tech)

ATO adalah **alat bantu berpikir, bukan deteksi pasti**. Alih-alih memberi skor bahaya, ATO melatih pengguna berpikir dari sudut pelaku (*perspective inversion*): "kalau kamu yang menipu, celah apa yang kamu manfaatkan?" — sehingga pengguna menemukan sendiri tanda bahayanya.

---

## Fitur dan kaitannya dengan studi kasus

| Fitur | Halaman | Recognize | Learn | Act |
|---|---|:-:|:-:|:-:|
| **A20 Lite — Reverse Reflex**: tempel/ceritakan situasi (contoh fiktif) → kategori & taktik terdeteksi → 3 pertanyaan dari sudut pelaku → celah yang ditemukan/terlewat → *Action Card* | `/lite` | ✅ | ✅ | ✅ |
| **A20 Soul — Guardian Arc**: pilih sosok yang dijaga, jalani 3 misi cerita (pilihan A/B/C memengaruhi meter Kepercayaan/Kewaspadaan/Keamanan), dapat peringkat penjagaan | `/soul` | | ✅ | |
| **Realmulator**: simulasi chat dengan "pelaku" fiktif untuk latihan menolak/menguji | `/realmulator` | ✅ | ✅ | |
| **Drill**: latihan cepat mengenali pola | `/drill` | ✅ | ✅ | |

Hasil setiap fitur bergantung pada input/pilihan pengguna (syarat Fungsionalitas studi kasus).

**Action Card** berisi checklist pengamanan, kalimat peringatan siap salin (gaya santai/tegas) untuk memperingatkan teman/keluarga, dan kanal pelaporan.

---

## Privasi, keamanan, dan keterbatasan

- **Tanpa login, tanpa database, tanpa data pribadi.** Server bersifat stateless.
- **Teks bebas** diterima di `POST /api/v1/lite/analyze` dan, untuk UI Lite saat ini, di `POST /api/reflect`. Di kedua endpoint nomor HP, email, URL, dan rekening **dimasking di server sebelum diproses**; teks tidak dicatat ke log dan tidak disimpan.
- **Teks pengguna tidak dikirim ke layanan pihak ketiga / LLM.** Klasifikasi memakai model Naive Bayes kecil yang dilatih offline dan di-embed di binary Go; Realmulator memakai balasan berbasis aturan. (Satu-satunya aset eksternal: foto avatar Realmulator dari Unsplash, tanpa data pengguna.)
- **Nama tokoh, nomor, rekening, dan perusahaan pelaku fiktif.** Nama layanan umum (mis. dompet digital) hanya disebut sebagai konteks edukasi. Tidak ada konten berbahaya nyata (tautan/APK) yang dihosting.
- **Keterbatasan:** model dilatih dari data sintetis + tulisan tangan berbahasa Indonesia, bisa salah, tidak memberi skor/persen bahaya, dan **hasil tidak membuktikan suatu interaksi aman**. Selalu verifikasi lewat kanal resmi.
- Hardening backend: rate limit per IP (`429` + `Retry-After`), CORS allowlist persis, batas ukuran body, header keamanan (HSTS, `nosniff`, `DENY`), validasi JSON ketat (field asing ditolak).

---

## Arsitektur

```
Browser (Next.js 16, React 19, Tailwind, Framer Motion)
   │  ID pilihan + teks Lite (dimasking di server)
   ▼
Go API (net/http, stateless)  ── internal/middleware  (rate limit, CORS, security headers)
   ├─ internal/ml       Naive Bayes + tokenizer slang Indonesia (model.json di-embed)
   ├─ internal/lite     logika reflect v1 (celah ditemukan/terlewat, Action Card)
   ├─ internal/soulv1   mesin cerita Soul v1 (meter, peringkat)
   └─ internal/data     konten JSON di-embed, divalidasi fail-fast saat start
```

Kontrak API: [`docs/openapi.yaml`](docs/openapi.yaml) · ringkasan: [`docs/api-v1.md`](docs/api-v1.md) · keputusan desain: [`docs/handoff/KEPUTUSAN.md`](docs/handoff/KEPUTUSAN.md) · spesifikasi ML: [`docs/handoff/ML-SPEC.md`](docs/handoff/ML-SPEC.md) · laporan evaluasi model: [`data/ml/report.md`](data/ml/report.md)

### Endpoint API v1

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/v1/health` | status & versi konten |
| GET | `/api/v1/lite/categories`, `/api/v1/lite/tactics` | katalog kategori & taktik |
| GET | `/api/v1/lite/scenarios[?category=]`, `/api/v1/lite/scenarios/{id}` | skenario (tanpa kunci jawaban) |
| POST | `/api/v1/lite/analyze` | teks (≤ 2000 karakter) → kategori, skenario, taktik |
| POST | `/api/v1/lite/reflect` | jawaban 3 pertanyaan → celah + Action Card |
| GET | `/api/v1/soul/characters` | template karakter & relasi |
| POST | `/api/v1/soul/start`, `/api/v1/soul/step` | jalankan misi Soul |

---

## Menjalankan secara lokal

Prasyarat: **Node.js 20+** dan **Go 1.22+**.

```bash
git clone https://github.com/fk0u/anti-trap-order.git
cd anti-trap-order
cp .env.example .env        # sesuaikan bila perlu

# backend (port 8080)
go run ./cmd/server

# frontend (port 3000), di terminal lain
npm install
npm run dev
```

Buka http://localhost:3000.

| Variabel | Default | Keterangan |
|---|---|---|
| `PORT` | `8080` | port backend Go |
| `CORS_ORIGIN` | `http://localhost:3000` | origin frontend yang diizinkan, persis, dipisah koma |
| `NEXT_PUBLIC_API_URL` | kosong | URL backend untuk frontend |

### Test dan CI

```bash
go vet ./... && go test -race ./...   # backend
npm run build                          # frontend
go run ./cmd/ml-gendata && go run ./cmd/ml-train   # bangun ulang dataset + model ML (manual)
```

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) menjalankan `go vet`, `go test -race`, `go build`, dan `npm run build` pada setiap PR dan push ke `main`.

### Deploy

`scripts/deploy.sh` (rsync + build + PM2 di server). Akses server diambil dari environment, tidak disimpan di repo:

```bash
DEPLOY_HOST=user@host DEPLOY_KEY=~/.ssh/ato-deploy.pem npm run deploy
```

Path key sebaiknya tanpa spasi.

---

## Struktur direktori

```
cmd/            server, ml-gendata, ml-train
internal/       data, handler, lite, middleware, ml, model, soulv1 (+ reflect, soul untuk API lama)
src/            app (halaman Next.js), components, lib, types
data/ml/        dataset dan laporan evaluasi model
docs/           openapi, PRD/TRD, keputusan desain
testdata/       fixture kontrak Go ↔ TypeScript
```

---

## Tim

| Nama | Peran |
|---|---|
| Muhammad Shafly Putra Darmawan (Ketua) | Backend, data, AI, deployment |
| Al-Ghani Desta Setyawan | Product, riset ekosistem, QA, dokumentasi |
| Syafaruddin | Frontend |
| Widhi Nur Maulida | UI/UX & desain kreatif |

Dosen pendamping: Naufal Azmi Verdikha, S.Kom., M.Eng. — Teknik Informatika UMKT.

## Atribusi pihak ketiga

Next.js, React, Tailwind CSS, Framer Motion, Geist (font), Lucide (ikon), clsx, tailwind-merge — lihat `package.json`. Backend Go hanya memakai standard library. Alat bantu AI coding dipakai selama pengembangan; seluruh kode ditinjau dan dipertanggungjawabkan oleh tim.

## Lisensi

[MIT](LICENSE)
