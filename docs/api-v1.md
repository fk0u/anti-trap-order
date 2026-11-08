# API v1 — panduan singkat untuk tim

Sumber kebenaran kontrak: [`openapi.yaml`](openapi.yaml). Tipe TypeScript: [`src/types/api-v1.ts`](../src/types/api-v1.ts). Kontrak modul analisis teks di browser: [`src/lib/ml/contract.ts`](../src/lib/ml/contract.ts).

## Aturan utama

- **Teks S-03 hanya dikirim ke `POST /api/v1/lite/analyze`, dan wajib sudah dimasking di browser** (K12). Server tidak mencatat/menyimpan teks. Isi "Lainnya" di S-04–06 dan nama panggilan karakter di S-10 tetap hanya di browser. Server menolak field tambahan (`additionalProperties: false`), jadi request yang berisi teks akan dibalas `400`.
- Server stateless: tanpa login, tanpa database.
- `429` selalu membawa `Retry-After: 20` (hitung mundur S-20).
- Jika API mati atau lebih dari 3 detik, frontend beralih ke mode terbatas (S-07 Error, S-19) dengan struktur data yang sama.

## Peta layar → endpoint

| Layar | Panggilan |
|---|---|
| S-03 Situasi | `GET /api/v1/lite/categories`, `GET /api/v1/lite/scenarios` ("Contoh fiktif"), `maskText()` di browser lalu `POST /api/v1/lite/analyze`; mode terbatas: model cadangan di browser |
| S-04–06 Pertanyaan | `GET /api/v1/lite/scenarios/{id}` |
| S-07 Loading → S-08 Hasil → S-09 Action Card | `POST /api/v1/lite/reflect`, `GET /api/v1/lite/tactics` (kartu taktik tambahan dari model) |
| S-10 Pilih karakter | `GET /api/v1/soul/characters` |
| S-11 Misi 1 | `POST /api/v1/soul/start` |
| S-13 Konsekuensi → S-11 berikutnya / S-14 Ringkasan | `POST /api/v1/soul/step` |
| S-18, S-19, S-20 | Semua endpoint: `500`, gagal jaringan/timeout, `429` |

## Menjalankan mock server (frontend bisa mulai sekarang)

```bash
npx @stoplight/prism-cli@5 mock docs/openapi.yaml -p 4010
# lalu set NEXT_PUBLIC_API_URL=http://localhost:4010
```

Mock membalas dengan contoh di `openapi.yaml` dan memvalidasi body request. Sampai model ML siap, pakai `mockAnalyzeText()` dari `src/lib/ml/contract.ts`.

## Endpoint lama

`/api/reflect`, `/api/soul/*`, dan `/api/realmulator/chat` diganti oleh v1 dan akan dihapus setelah frontend pindah.
