# CLAUDE.md — Anti Trap Order (ATO)

Proyek lomba MIT-Week UNMUL 2026 (tema *Guardians of the Digital Space*). Next.js 16 (frontend) + Go (backend), sedang disesuaikan ke wireframe final untuk MVP 3 hari.

## Baca ini dulu, berurutan

1. `docs/handoff/KEPUTUSAN.md` — semua keputusan arsitektur, privasi, dan pembagian tugas yang sudah disepakati. **Mengalahkan** isi `CONTEXT.md`, `RUAS_CONTEXT.md`, `your-prompts.md`, dan `docs/*.md` lama jika bertentangan.
2. `docs/openapi.yaml` + `docs/api-v1.md` — kontrak API v1 (sumber kebenaran antara Go dan TS).
3. `docs/handoff/ML-SPEC.md` — spesifikasi model ML (Go), jika tugasmu menyentuh `internal/ml/` atau `src/lib/ml/`.

## Aturan yang tidak boleh dilanggar

- **UI/UX tidak boleh diubah.** Wireframe Figma (file key `ZYHNsUzibVBzF0PzCfH3rv`, halaman `04 | Mobile`, layar S-01 s.d. S-20) adalah acuan. Jika kode atau kontrak berbeda dari wireframe, kode/kontrak yang menyesuaikan.
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
