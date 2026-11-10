# plan.md — Menuju demo lomba MIT-Week UNMUL 2026

Branch kerja: `feat/mode-terbatas-dan-demo` (lokal; tidak di-push, sesuai aturan di CLAUDE.md).
Dibuat 10 Nov 2026 dari audit frontend. Centang `[x]` saat selesai dan terverifikasi.

## Prinsip

- Demo tidak boleh macet. Server mati, jaringan putus, atau 429 harus tetap berujung hasil yang bisa dipresentasikan.
- UI mobile 390px tidak berubah (cek `e2e/visual.cjs`). Semua teks fiktif. Tanpa skor, persen, atau LLM.
- Teks S-03 hanya boleh keluar dari browser lewat `POST /api/v1/lite/analyze`. Mode terbatas menjaga teks 100% di perangkat.

## Fase 0 — Peralatan (blokir semuanya)

- [x] Pasang Node, Go, Rust lewat Homebrew (`~/homebrew`), disetujui Syafar.
- [ ] `npm ci`, `go test ./...`, `npm run build` hijau di branch ini sebagai garis dasar.
- [ ] Ambil baseline visual: `e2e/visual.cjs capture` sebelum menyentuh UI.

## Fase 1 — Mode terbatas (celah terbesar untuk demo)

Tujuan: tombol "Lanjut mode terbatas" (S-07 Error dan S-19) berfungsi dan Lite berjalan penuh tanpa server.

- [ ] `src/lib/offline/` — port TypeScript dari Go, memakai data yang sama (tanpa salinan, tanpa drift):
  - tokenizer + slang + masking + Naive Bayes dari `internal/ml/` (model: `internal/ml/model.json`)
  - pemilihan skenario dan logika `reflect` dari `internal/lite/reflect.go`
  - kategori, taktik, skenario dari `internal/data/v1/*.json`
- [ ] Lolos fixture `testdata/fixtures/ml-tokenize.json`, `ml-analyze.json`, `reflect-v1.json` (acuan Go).
- [ ] `LiteFlow`: setelah "Lanjut mode terbatas", semua panggilan beralih ke mesin lokal; aksi yang gagal diulang otomatis.
- [ ] Muat lazy (dynamic import) supaya bundel awal tidak membengkak.
- [ ] Aktifkan tombol di `OfflineActions.tsx`; hapus TODO.
- [ ] E2E: server diputus lewat route Playwright → "Lanjut mode terbatas" → S-03 sampai S-09 selesai; tidak ada request ke `/analyze`.
- [ ] Soul tetap nonaktif (jawaban Syafar no. 12).

## Fase 2 — Bersihkan sisa versi lama

- [ ] Putuskan nasib `/drill`, `/realmulator`, `/docs`, `api/realmulator/chat`, `src/components/landing/_legacy/`, `src/lib/api.ts`, `reflect-local.ts`, `soul-local.ts`. Hapus bila tidak dipakai layar 06 (butuh persetujuan Syafar: ini penghapusan).
- [ ] `MobileTabBar` dan font Geist di `layout.tsx` hanya jika masih ada route yang memakainya.
- [ ] `manifest.ts`: `start_url` ke `/`, warna dan nama sesuai 06.
- [ ] Metadata dan OG (`layout.tsx`, `opengraph-image.tsx`): teks selaras layar 06; tanpa klaim "pembalikan sudut pandang" yang sudah tidak ada di UI.
- [ ] `src/content/landing.ts` hapus bersama `_legacy` (berisi kalimat "89% aman" dan "Kepastian 100%").

## Fase 3 — Kualitas dan bukti

- [ ] CI hijau: `go vet`, `go test -race`, `npm run build` (+ tambahkan `tsc --noEmit` dan lint jika belum).
- [ ] Semua suite e2e lolos di 390, 768, 1024, 1440. Regresi visual mobile "32 state identik".
- [ ] Cek kontras ⚠️ yang tercatat; ajukan keputusan ke Syafar, bukan diubah sendiri.
- [ ] Deploy preview terbaru dicek di HP sungguhan (Lite end-to-end, mode pesawat untuk mode terbatas).

## Fase 4 — Video demo (fframes)

Format: animasi SVG + cuplikan layar asli, subtitle Indonesia, tanpa suara (narasi diisi Syafar). Folder: `demo/video/`.

- [ ] `demo/NASKAH.md` — naskah per detik dan daftar shot (±2:30–3:00).
- [ ] Ambil screenshot layar asli (Playwright, 390px, data fiktif) → `demo/video/assets/`.
- [ ] Proyek fframes (`cargo fframes new`) dengan token warna/font ATO; adegan: masalah → Lite (S-03 → S-09) → Soul → privasi (teks disamarkan, tidak disimpan) → mode terbatas → penutup.
- [ ] Render MP4 1080p, cek hasil, serahkan ke Syafar.

Urutan kerja: Fase 0 → 1 → 4 (video butuh fitur final) → 2 → 3. Fase 3 dijalankan ulang sebelum merekam/merender.

## Butuh keputusan Syafar (tidak dikerjakan sepihak)

- Hapus route lama (`/drill`, `/realmulator`, `/docs`) atau biarkan tersembunyi?
- Jawaban FAQ S-01 (sengaja kosong, tidak boleh dikarang).
- Nama tim, narasi, dan musik/suara video.
- Perbaikan kontras ⚠️ (butuh keputusan desain).
