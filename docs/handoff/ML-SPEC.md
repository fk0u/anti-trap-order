# Spesifikasi ML — Anti Trap Order (versi Go, K12)

Model membaca teks S-03 (sudah dimasking di browser), lalu (1) menebak **kategori**, (2) memilih **skenario** Lite, dan (3) mendeteksi **taktik** manipulasi untuk menyorot kartu "Yang mungkin belum kepikiran" di S-08. Model utama berjalan di **server Go** lewat `POST /api/v1/lite/analyze` (lihat `docs/openapi.yaml`). Frontend punya model cadangan untuk mode terbatas yang memakai `model.json` yang sama. Baca `docs/handoff/KEPUTUSAN.md` (K1, K7, K11, K12) dulu.

## 1. Batasan teknis

- **Naive Bayes ditulis sendiri di Go**, hanya standard library. Tanpa library ML, tanpa Python, tanpa LLM, tanpa panggilan jaringan keluar.
- Training dan inferensi memakai **paket yang sama** (`internal/ml`), sehingga hasilnya identik.
- Label hanya dari `src/types/api-v1.ts`/`openapi.yaml`: kategori `tawaran_kerja, giveaway, akun_menyamar, pinjaman_investasi, lainnya`; taktik `urgency, upfront_fee, impersonation, isolation, too_good, credential_request, link_or_apk, authority`. Simpan sebagai konstanta di `internal/ml/labels.go`.
- **Teks tidak pernah di-log, disimpan, atau dikembalikan di pesan error.** Tidak ada `log.Printf` berisi body atau teks di jalur analyze.
- Tidak mengubah kode Next.js (`src/`), `package.json`, atau `internal/data/*.json`.

## 2. Struktur file

```text
internal/ml/
├── labels.go           # CategoryIDs, TacticIDs
├── mask.go             # Mask(): regex sama persis dengan maskText() di src/lib/ml/contract.ts
├── slang.go            # kamus slang (salin dari src/lib/ml/slang.ts di branch feat/ml-browser)
├── tokenize.go         # Normalize() + Tokenize(); TokenizerVersion
├── naivebayes.go       # Train() dan Predict(), murni, tanpa I/O
├── model.go            # tipe Model + Load() dari model.json (go:embed)
├── analyze.go          # Analyze(text, scenarios) → Result
├── scenarios.go        # indeks skenario: pemetaan kategori lama→baru + fallback
├── model.json          # hasil training (di-commit, di-embed)
├── *_test.go
└── README.md           # penjelasan untuk pemula dan juri
cmd/ml-gendata/main.go  # bangun data/ml/train.csv dari handwritten + fragmen (seed tetap)
cmd/ml-train/main.go    # baca CSV → latih → tulis internal/ml/model.json + data/ml/report.md + fixture
data/ml/
├── handwritten.csv     # contoh utuh tulisan agen
├── fragments.json      # potongan kalimat per kategori/taktik/gaya
├── train.csv           # hasil generator (di-commit)
├── test-agen.csv       # uji: ditulis terpisah, TIDAK lewat generator, tidak dipakai training
├── test-tim.csv        # header + 3 contoh, diisi tim (30–50 baris)
└── report.md           # laporan akurasi terakhir
testdata/fixtures/
├── ml-tokenize.json    # [{text, tokens}] — acuan tokenizer cadangan FE
└── ml-analyze.json     # [{text, expected AnalyzeResponse}] — acuan model cadangan FE
```

## 3. Dataset

CSV UTF-8, header wajib: `id,text,style,category,tactics,source`.

| Kolom | Isi |
|---|---|
| `id` | unik, mis. `tr-0001` |
| `text` | pesan atau cerita, 5–80 kata |
| `style` | `tempel` (bunyi pelaku) / `cerita` (bunyi korban: "tadi ada yang DM ngaku HRD…") / `normal` (pesan wajar) |
| `category` | salah satu dari 5 kategori; pesan normal → `lainnya` |
| `tactics` | ID taktik dipisah `|`, kosong untuk pesan normal |
| `source` | `sintetis` atau `tim` |

Target `train.csv`: **≥ 800 baris**; ±50% tempel, ±35% cerita, 15–30% normal; ≥ 100 baris per kategori; ≥ 80 positif per taktik.

Variasi wajib: singkatan WA (yg, gk, tf, bgt, kak, min), typo ringan, huruf kapital semua, banyak tanda seru, emoji, tanpa tanda baca, angka uang ("150rb", "Rp150.000", "1,5jt"), token masking (`<NOMOR>`, `<URL>`, `<REKENING>`, `<EMAIL>`). Pesan normal harus mencakup yang **mirip penipuan tapi wajar**: promo resmi, info lowongan kampus, teman pinjam uang secara wajar, kurir asli, info beasiswa.

Cara membuat: ±150–250 contoh utuh di `handwritten.csv`, lalu `cmd/ml-gendata` menambah variasi dari `fragments.json` (konteks kategori + 1–3 frasa taktik + bingkai cerita + transformasi gaya) dengan **PRNG seed tetap** (`math/rand/v2` dengan `rand.NewPCG(seed, seed)`). Label generator otomatis benar karena berasal dari fragmen berlabel. Validasi semua label; keluar dengan error bila tidak valid.

`test-agen.csv`: ±60 baris kalimat baru, tidak lewat generator. Semua nama, nomor, link, dan merek **fiktif**.

## 4. Tokenisasi (`tokenize.go`) — harus sama dengan `src/lib/ml/tokenize.ts` (branch `feat/ml-browser`)

1. Huruf kecil (`strings.ToLower`). Go tidak memakai NFKC agar tanpa dependensi tambahan (TS memakai NFKC); bedanya hanya untuk huruf "fancy"/fullwidth, jadi fixture memakai teks biasa dan beda ini dicatat di README.
2. Uang → `<uang>`: regex `rp\.?\s?\d[\d.,]*(\s?(rb|ribu|k|jt|juta|jutaan|m|miliar))?\b` atau `\b\d[\d.,]*\s?(rb|ribu|k|jt|juta|jutaan|miliar)\b`.
3. Angka lain → `<angka>`; `!!`+ → `<seru>`.
4. Huruf berulang 3+ → 1 (`buruaaan` → `buruan`). (RE2 tidak mendukung backreference: lakukan dengan loop rune.)
5. Buang karakter selain huruf, `<`, `>`, spasi. Pecah per spasi. Token `<nomor> <url> <rekening> <email> <uang> <angka> <seru>` dipertahankan; token lain dibuang `<>`-nya lalu diekspansi lewat `slang.go`.
6. Hasil `Tokenize`: unigram + bigram (`a_b`). Tanpa stopword.

## 5. Model (`naivebayes.go`)

- **Kategori**: multinomial Naive Bayes 5 kelas, Laplace α = 1, log-prior dari frekuensi kelas. Keyakinan = softmax skor log. Keyakinan < 0,5 → `lainnya`.
- **Taktik**: 8 model biner terpisah (ya/tidak), rumus sama. Ambang per taktik dipilih di validasi (split 80/20 berstrata, seed tetap): F1 tertinggi dengan presisi ≥ 0,8; jika tidak ada, presisi tertinggi.
- **top_tokens**: maks. 3 token dari teks dengan log-rasio (ya vs tidak) terbesar untuk taktik itu.
- Pangkas token yang muncul < 2 kali. Target `model.json` < 300 KB.
- Format `model.json`: `{ version, tokenizer_version, labels: {categories, tactics}, category: {priors, likelihoods, totals}, tactics: {[id]: {threshold, priors, likelihoods, totals}}, vocab_size, unknown }` — `likelihoods[kelas][token]` berupa log, dibulatkan 4 desimal; `unknown[kelas]` = log-likelihood token yang tidak ada di vocab. Kunci map diurutkan (Go `encoding/json` sudah mengurutkan kunci map).
- **Deterministik**: dua kali training dengan data sama → `model.json` identik byte per byte. Tanpa timestamp jam sekarang.

## 6. `Analyze()` dan endpoint

Urutan: `Mask()` (lapisan kedua) → hitung kata (< 5 → `too_short: true`, kategori `lainnya` confidence 0, `generic_emergency`, `tactics: []`) → `Tokenize` → kategori → skenario → taktik (yang lewat ambang, urut skor desc).

Pemilihan skenario: di dalam kategori terpilih, skor = jumlah keyword skenario (dinormalisasi dengan `Normalize` yang sama, keyword multi-kata dicocokkan sebagai urutan kata) yang muncul di teks; ambil tertinggi (seri → urutan data). Jika 0 → skenario fallback kategori itu, atau `generic_emergency`. Sumber: skenario dari `data.Repository`, dengan pemetaan kategori lama → baru:

| Skenario | Kategori baru | Fallback |
|---|---|---|
| wfh_admin_fee, task_scam_review_maps | tawaran_kerja | wfh_admin_fee |
| giveaway_fake_verified | giveaway | ya |
| impersonate_new_number, phishing_bank_account_freeze | akun_menyamar | impersonate_new_number |
| loan_fast_no_check, romance_investment_pigbutchering | pinjaman_investasi | loan_fast_no_check |
| apk_wedding_invitation, marketplace_cod_scam, generic_emergency | lainnya | generic_emergency |

Endpoint `POST /api/v1/lite/analyze` (lihat `openapi.yaml` `AnalyzeRequest`/`AnalyzeResponse`):
- Decode dengan `DisallowUnknownFields`; batas body 8 KB; `text` 1–2000 karakter (rune), selain itu `400 VALIDATION_ERROR` dengan `field: text`. Pesan error tidak memuat teks.
- Respons memuat `model_version` dan `disclaimer: "Ini alat bantu berpikir, bukan deteksi pasti."`.
- Kinerja: < 10 ms untuk teks 500 karakter.

## 7. Laporan dan uji

`cmd/ml-train` menulis `data/ml/report.md` untuk `test-agen.csv` dan `test-tim.csv` (jika > 3 baris): akurasi kategori + confusion matrix 5×5, precision/recall/F1 per taktik, % pesan normal yang salah diberi taktik, 10 contoh salah prediksi beserta teksnya. Juga menulis `testdata/fixtures/ml-tokenize.json` dan `ml-analyze.json`.

Target awal (laporkan apa adanya walau belum tercapai): akurasi kategori ≥ 0,80 di `test-agen`; presisi `upfront_fee` dan `credential_request` ≥ 0,75; pesan normal salah ditandai ≤ 15%. Angka `test-tim` lebih jujur karena ditulis orang lain.

Test (`go test ./internal/ml/... ./internal/handler/...`): tokenizer (kasus sama dengan `tokenize.test.ts`), masking, determinisme training, `Analyze` pada 5 contoh tetap (kerja, giveaway, akun menyamar, investasi, normal), handler (200, field tak dikenal → 400, teks kosong/terlalu panjang → 400, teks tidak muncul di log).

## 8. README untuk pemula (`internal/ml/README.md`)

Bahasa sederhana: apa itu Naive Bayes (menghitung kata per kategori, bukan "berpikir"), cara melatih ulang (`go run ./cmd/ml-gendata && go run ./cmd/ml-train`), cara menambah data, cara membaca `report.md`, batasan (tidak paham makna/sindiran, bergantung data, data sintetis), dan kalimat juri dari `KEPUTUSAN.md` §3.

## 9. Untuk tim frontend (bukan tugas backend)

- Masking dengan `maskText()` sebelum `POST /api/v1/lite/analyze`; chip "N data disamarkan" dari hasil masking di browser.
- Timeout 3 detik / error → model cadangan di browser: muat `internal/ml/model.json` (salin ke `src/lib/ml/`), port tokenizer + `Predict`, dan pastikan lolos `testdata/fixtures/ml-*.json`.
- Di S-08, urutkan `missed_candidates` dengan mendahulukan `tactic.id` yang ada di `tactics`; tampilkan maks. 2.
- `score` dan `confidence` tidak ditampilkan.
