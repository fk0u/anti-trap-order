# Spesifikasi ML di Browser — Anti Trap Order

Model ini membaca teks yang ditempel atau diceritakan user di layar S-03, lalu (1) menebak **kategori** situasi untuk memilih skenario, dan (2) mendeteksi **taktik** manipulasi untuk menyorot kartu "Yang mungkin belum kepikiran" di S-08. Semuanya berjalan di browser; teks tidak pernah dikirim ke server. Baca `docs/handoff/KEPUTUSAN.md` dulu.

## 1. Batasan teknis

- **Naive Bayes ditulis sendiri** di TypeScript. Tanpa library ML, tanpa Python, tanpa LLM, tanpa panggilan jaringan.
- Training dan inferensi memakai **modul yang sama** (`src/lib/ml/naive-bayes.ts`), sehingga hasil di laptop dan di browser identik.
- Implementasi mengikuti kontrak yang sudah ada di `src/lib/ml/contract.ts` (`AnalyzeText`, `AnalyzeResult`, `maskText`, `MIN_WORDS`). Jangan mengubah bentuk kontrak tanpa persetujuan user.
- Label hanya dari `src/types/api-v1.ts`. Tambahkan array runtime di file itu agar bisa diimpor skrip training:
  ```ts
  export const CATEGORY_IDS = ["tawaran_kerja", "giveaway", "akun_menyamar", "pinjaman_investasi", "lainnya"] as const;
  export type CategoryId = (typeof CATEGORY_IDS)[number];
  export const TACTIC_IDS = ["urgency", "upfront_fee", "impersonation", "isolation", "too_good", "credential_request", "link_or_apk", "authority"] as const;
  export type TacticId = (typeof TACTIC_IDS)[number];
  ```

## 2. Struktur file

```text
src/lib/ml/
├── contract.ts        # sudah ada: tipe + maskText + mockAnalyzeText
├── slang.ts           # kamus slang (pindahan IndonesianSlangMap dari internal/reflect/nlp.go)
├── tokenize.ts        # normalisasi → token unigram + bigram
├── naive-bayes.ts     # train() dan predict(), murni, tanpa I/O
├── analyze.ts         # analyzeText(): implementasi AnalyzeText memakai model.json
├── scenario-index.ts  # salinan ringkas skenario (id, category, keywords, is_fallback) untuk mode terbatas
├── model.json         # hasil training (di-commit)
├── *.test.ts          # test (node:test via tsx)
└── README.md          # penjelasan untuk pemula dan untuk juri
scripts/ml/
├── generate-dataset.ts  # membangun data/ml/train.csv dari data tulisan tangan + fragmen (seed tetap)
└── train.ts             # baca CSV → latih → tulis model.json + data/ml/report.md
data/ml/
├── handwritten.csv      # contoh utuh tulisan agen (natural)
├── fragments.json       # potongan kalimat per kategori/taktik/gaya untuk generator
├── train.csv            # hasil generator (di-commit agar bisa diperiksa tim)
├── test-agen.csv        # uji: ditulis terpisah, TIDAK lewat generator, tidak dipakai training
├── test-tim.csv         # template kosong + 3 contoh, diisi tim (30–50 baris)
└── report.md            # laporan akurasi terakhir
```

## 3. Dataset

Format CSV (UTF-8, header wajib):

| Kolom | Isi |
|---|---|
| `id` | unik, mis. `tr-0001` |
| `text` | pesan atau cerita, 5–80 kata |
| `style` | `tempel` (bunyi pelaku: "Selamat! Anda terpilih…") / `cerita` (bunyi korban: "tadi ada yang DM ngaku HRD, katanya…") / `normal` (pesan wajar) |
| `category` | salah satu dari 5 `CategoryId`; pesan normal → `lainnya` |
| `tactics` | ID taktik dipisah `|`, kosong untuk pesan normal |
| `source` | `sintetis` atau `tim` |

Target `train.csv`: **≥ 800 baris**; komposisi ±50% tempel, ±35% cerita, 15–30% normal; minimal 100 baris per kategori dan 80 contoh positif per taktik.

Variasi wajib agar model tidak hanya hafal satu gaya: singkatan WA (yg, gk, tf, bgt, kak, min), typo ringan, huruf kapital semua, banyak tanda seru, emoji, tanpa tanda baca, angka uang ("150rb", "Rp150.000", "1,5jt"), token hasil masking (`<NOMOR>`, `<URL>`, `<REKENING>`, `<EMAIL>`). Pesan normal harus mencakup yang **mirip penipuan tapi wajar**: promo resmi, info lowongan dari kampus, teman pinjam uang secara wajar, kurir asli, info beasiswa.

Cara membuat: tulis ±150–250 contoh utuh di `handwritten.csv`, lalu `generate-dataset.ts` menambah variasi dari `fragments.json` (konteks kategori + 1–3 frasa taktik + bingkai cerita + transformasi gaya) dengan **seed tetap** supaya bisa diulang. Label hasil generator otomatis benar karena berasal dari fragmen berlabel.

`test-agen.csv`: ±60 baris ditulis terpisah dengan kalimat baru, tidak lewat generator, tidak pernah dipakai training. Semua nama, nomor, link, dan merek **fiktif**.

> Sebelum membuat dataset, **tanyakan ke user** apakah dataset dibuat agen (default) atau tim. Jika tim, buat hanya template + 10 contoh.

## 4. Tokenisasi (`tokenize.ts`)

1. NFKC + huruf kecil.
2. Pertahankan token masking (`<nomor>`, `<url>`, …) sebagai satu token.
3. Uang (`150rb`, `rp150.000`, `1,5jt`) → `<uang>`; angka lain → `<angka>`.
4. Huruf berulang 3+ → 1 (`buruaaan` → `buruan`); tanda seru berulang → token `<seru>`.
5. Buang tanda baca lain, pecah per spasi, ekspansi slang dari `slang.ts`.
6. Hasil: unigram + bigram (`biaya_seragam`). Tanpa stopword list di versi pertama.

## 5. Model (`naive-bayes.ts`)

- **Kategori**: multinomial Naive Bayes 5 kelas, Laplace α = 1, log-prior dari frekuensi kelas. Keyakinan = softmax dari skor log. Jika keyakinan < 0,5 → `lainnya`.
- **Taktik**: 8 model biner terpisah (ya/tidak) dengan rumus yang sama. Ambang per taktik dipilih di validasi (split 80/20 berstrata dari `train.csv`): F1 tertinggi dengan presisi ≥ 0,8 diutamakan, karena salah menuduh pesan wajar lebih merugikan daripada melewatkan taktik.
- **topTokens**: 3 token yang ada di teks dengan kontribusi log-rasio terbesar untuk taktik itu (untuk penjelasan).
- Pangkas token yang muncul < 2 kali. Target `model.json` < 300 KB.
- Format `model.json`: `{ version, trained_at, tokenizer_version, labels: {categories, tactics}, category: {priors, likelihoods, totals}, tactics: {[id]: {threshold, priors, likelihoods, totals}}, vocab_size }`. Kemungkinan disimpan sebagai log, dibulatkan 4 desimal.
- Training deterministik: dua kali training dengan data sama menghasilkan `model.json` identik.

## 6. `analyzeText()` (`analyze.ts`)

Urutan: `maskText()` → hitung kata (< `MIN_WORDS` → `tooShort: true`, tetap kembalikan hasil masking) → tokenisasi → prediksi kategori → pilih skenario → prediksi taktik.

Pemilihan skenario: di dalam kategori terpilih, skor = jumlah keyword skenario (dinormalisasi dengan tokenizer yang sama) yang muncul di token teks; ambil skor tertinggi (seri → urutan data). Jika tidak ada yang > 0, pakai skenario `is_fallback` di kategori itu, atau `generic_emergency`. Daftar skenario dari `GET /api/v1/lite/scenarios` saat online, atau `scenario-index.ts` saat mode terbatas (fungsi menerima daftar skenario sebagai parameter opsional).

Jika tidak ada taktik melewati ambang, `tactics: []`. Jangan mengarang taktik untuk mengisi kartu.

Kinerja: < 10 ms untuk teks 500 karakter di laptop biasa; sinkron; tanpa efek samping.

## 7. Laporan dan uji

`train.ts` menulis `data/ml/report.md` berisi, untuk `test-agen.csv` dan `test-tim.csv` (jika sudah diisi):

- akurasi kategori + confusion matrix 5×5,
- precision / recall / F1 per taktik,
- persentase pesan normal yang salah diberi taktik,
- 10 contoh salah prediksi beserta teksnya.

Target awal (laporkan apa adanya walau belum tercapai): akurasi kategori ≥ 0,80 di `test-agen`; precision `upfront_fee` dan `credential_request` ≥ 0,75; pesan normal salah ditandai ≤ 15%. Angka dari `test-tim` lebih jujur daripada `test-agen` karena ditulis orang lain.

Test (`npx tsx --test src/lib/ml/*.test.ts`): kasus tokenizer, kasus masking, determinisme training, `analyzeText` pada 5 contoh tetap (kerja, giveaway, akun menyamar, investasi, pesan normal).

## 8. README untuk pemula

`src/lib/ml/README.md` menjelaskan dengan bahasa sederhana: apa itu Naive Bayes (menghitung kata per kategori, bukan "berpikir"), cara melatih ulang (satu perintah), cara menambah data, cara membaca `report.md`, batasan (tidak paham makna/sindiran, bergantung pada data, data sintetis), dan kalimat penjelasan untuk juri dari `KEPUTUSAN.md`.

## 9. Integrasi ke frontend (untuk tim frontend)

- Panggil `analyzeText()` dengan debounce ±300 ms saat user mengetik di S-03; hasil masking mengisi chip "N data disamarkan".
- Simpan `AnalyzeResult` di state alur Lite; kotak PESAN di S-04–06 menampilkan `masked`.
- Di S-08, urutkan `missed_candidates` dengan mendahulukan yang `tactic.id` ada di `tactics`; tampilkan maks. 2. Jika model mendeteksi taktik yang tidak ada di kandidat, boleh tampilkan kartu dari `GET /api/v1/lite/tactics`.
- Ganti `mockAnalyzeText` dengan `analyzeText` setelah `model.json` ada.
