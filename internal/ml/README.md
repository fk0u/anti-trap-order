# Model ML Anti Trap Order (untuk pemula)

Folder ini berisi "otak" kecil yang menebak jenis pesan mencurigakan. Tidak perlu paham machine learning untuk membacanya. Semua kode ditulis dengan standard library Go, tanpa LLM, tanpa panggilan ke internet.

## 1. Apa itu Naive Bayes?

Naive Bayes **tidak berpikir dan tidak paham arti kalimat**. Ia hanya **menghitung kata**.

Saat latihan, program membaca ratusan pesan yang sudah diberi label, lalu menghitung: kata apa sering muncul di kategori apa.

Contoh kecil (angka rekaan):

| Kata | Muncul di `tawaran_kerja` | Muncul di `giveaway` |
|---|---|---|
| "seragam" | 40 kali | 0 kali |
| "hadiah" | 1 kali | 35 kali |
| "kak" | 20 kali | 20 kali |

Pesan baru: *"bayar biaya seragam dulu ya kak"*. Kata "seragam" jauh lebih sering ada di `tawaran_kerja`, jadi kategori itu dapat nilai lebih tinggi. Kata "kak" muncul sama sering di mana-mana, jadi tidak membantu. Kategori dengan nilai tertinggi menang.

Kata "naive" (lugu) karena tiap kata dianggap berdiri sendiri, urutan dan makna kalimat tidak dipikirkan. Karena itu hasilnya cepat dan mudah dijelaskan, tetapi bisa salah.

Kami memakai dua jenis tebakan:

- **Kategori**: satu dari lima (`tawaran_kerja`, `giveaway`, `akun_menyamar`, `pinjaman_investasi`, `lainnya`).
- **Taktik**: delapan pertanyaan ya/tidak, satu per taktik (`urgency`, `upfront_fee`, `impersonation`, `isolation`, `too_good`, `credential_request`, `link_or_apk`, `authority`). Satu pesan bisa kena banyak taktik.

## 2. Alur `POST /api/v1/lite/analyze`

```text
teks dari browser
  -> 1. Mask      samarkan nomor HP, email, rekening, URL (lapisan kedua, browser sudah melakukannya)
  -> 2. Tokenize  huruf kecil, uang jadi <uang>, angka jadi <angka>, singkatan WA diperluas, dipecah jadi kata + pasangan kata
  -> 3. Kategori  Naive Bayes 5 kelas; keyakinan < 0,5 dianggap "lainnya"
  -> 4. Skenario  di dalam kategori, pilih skenario dengan kata kunci paling banyak cocok; kalau nol, pakai skenario cadangan
  -> 5. Taktik    8 model ya/tidak; yang melewati ambang dikembalikan, diurutkan dari skor tertinggi
```

Jika teks kurang dari 5 kata: `too_short: true`, kategori `lainnya`, skenario `generic_emergency`, taktik kosong. Teks dibuang setelah dijawab; tidak di-log dan tidak disimpan.

## 3. Cara melatih ulang

```bash
go run ./cmd/ml-gendata   # bangun data/ml/train.csv dari handwritten.csv + fragments.json
go run ./cmd/ml-train     # latih, tulis model.json, report.md, dan fixture
go test ./...             # pastikan semua masih lolos
```

Hasilnya deterministik: data yang sama menghasilkan `model.json` yang sama persis. Jika `git diff` tidak kosong setelah dua kali jalan dengan data tak berubah, ada yang salah.

## 4. Cara menambah data

Semua CSV memakai header `id,text,style,category,tactics,source`.

- `style`: `tempel` (bunyi pelaku), `cerita` (bunyi korban), atau `normal` (pesan wajar).
- `category`: salah satu dari lima kategori di atas. Pesan normal selalu `lainnya`.
- `tactics`: ID taktik dipisah `|`, kosong untuk pesan normal. Contoh: `upfront_fee|urgency`.
- `source`: `sintetis` atau `tim`.

Tempat menambah:

1. `data/ml/handwritten.csv`: contoh utuh tulisan sendiri. Paling mudah.
2. `data/ml/fragments.json`: potongan kalimat per kategori/taktik/gaya yang digabung generator. Jaga agar potongan kategori **tidak** memuat isi taktik lain, supaya label otomatis tetap benar.
3. Lalu jalankan ulang perintah di bagian 3.

**`data/ml/test-tim.csv` khusus untuk uji.** Isi 30-50 pesan fiktif yang **ditulis anggota tim sendiri** (bukan disalin dari data latih, bukan hasil AI). Jangan pernah menyalinnya ke data latih, karena nilainya adalah sebagai ujian yang jujur. Semua nama, nomor, tautan, dan merek harus fiktif.

## 5. Cara membaca `data/ml/report.md`

- **Akurasi kategori**: dari 100 pesan, berapa yang kategorinya ditebak benar. 0,87 artinya sekitar 87 dari 100.
- **Confusion matrix**: tabel 5x5. Baris = kategori sebenarnya, kolom = tebakan. Angka di diagonal (kiri atas ke kanan bawah) adalah tebakan benar; angka di luar diagonal menunjukkan tertukar dengan kategori mana.
- **Presisi** (per taktik): dari semua pesan yang ditandai taktik X, berapa yang memang benar X. Presisi rendah = sering salah menuduh.
- **Recall**: dari semua pesan yang memang X, berapa yang berhasil ditemukan. Recall rendah = banyak yang lolos.
- **F1**: rata-rata gabungan presisi dan recall.
- **Pesan normal salah ditandai**: persen pesan wajar yang keliru diberi taktik (salah tuduh). Kami ingin ini kecil (target <= 15%).
- **Contoh salah prediksi**: sepuluh contoh yang meleset, berguna untuk memikirkan data apa yang perlu ditambah.

Angka dari `test-tim.csv` lebih jujur daripada `test-agen.csv`, karena ditulis orang yang berbeda dari pembuat data latih.

## 6. Peta file

| File | Isi |
|---|---|
| `labels.go` | Daftar kategori dan taktik |
| `mask.go` | Menyamarkan nomor, email, rekening, URL |
| `slang.go` | Kamus singkatan (yg, gk, tf, ...) |
| `tokenize.go` | Mengubah teks jadi daftar token |
| `naivebayes.go` | Rumus latihan dan prediksi (tanpa I/O) |
| `model.go` | Tipe model, `Load()`, tebak kategori dan taktik |
| `scenarios.go` | Daftar skenario dan pemetaan kategori lama ke baru |
| `analyze.go` | `Analyze()`: menyatukan seluruh alur |
| `model.json` | Hasil latihan (di-commit dan di-embed ke program) |
| `../../cmd/ml-gendata` | Pembuat `train.csv` |
| `../../cmd/ml-train` | Pelatih, penulis `model.json`, `report.md`, fixture |
| `../../data/ml/` | Data latih, data uji, laporan |
| `../../testdata/fixtures/ml-*.json` | Acuan hasil yang harus sama persis di model cadangan FE |

## 7. Batasan

- Tidak paham makna atau sindiran. "Jangan transfer ya, itu penipuan" bisa dianggap mirip penipuan karena memuat kata yang sama.
- Hanya sebaik datanya. Modus baru atau gaya bahasa yang belum ada di data akan sering meleset.
- Data latih **sintetis** (dibuat dengan bantuan AI lalu diperiksa tim), gayanya cenderung seragam.
- Set uji kecil (puluhan baris), jadi angka akurasi kasar, bukan jaminan.
- Tokenizer Go tidak memakai normalisasi NFKC seperti versi TypeScript (agar tanpa dependensi). Bedanya hanya pada huruf "fancy"/fullwidth; fixture memakai teks biasa.
- Ini alat bantu berpikir, bukan deteksi pasti. Tidak ada skor, persen, atau "tingkat bahaya" yang ditampilkan ke user.

## 8. Catatan privasi (K12)

- Browser memasking nomor, email, rekening, dan URL **sebelum** mengirim teks.
- Server memasking ulang sebagai lapisan kedua, memproses di memori, lalu membuang teks.
- Teks tidak di-log, tidak disimpan, tidak muncul di pesan error.
- Tidak ada LLM atau pihak ketiga saat aplikasi berjalan.

## 9. Untuk tim FE

- Masking dengan `maskText()` sebelum `POST /api/v1/lite/analyze`.
- Timeout 3 detik atau error: pakai model cadangan di browser. Muat `internal/ml/model.json` (salin ke `src/lib/ml/`), port tokenizer + prediksi, dan pastikan lolos `testdata/fixtures/ml-tokenize.json` dan `testdata/fixtures/ml-analyze.json`.
- Format `unknown` di `model.json` bersarang: `unknown["category"][kelas]` dan `unknown[id_taktik]["yes"|"no"]`.
- Aturan prediksi per token: token ada di kosakata model tetapi tidak ada di kelas itu -> pakai nilai `unknown`; token di luar kosakata model -> diabaikan.
- Di S-08, urutkan `missed_candidates` dengan mendahulukan `tactic.id` yang ada di `tactics`; tampilkan maksimal 2.
- `score` dan `confidence` tidak ditampilkan di UI; hanya untuk mengurutkan dan logika.

## 10. Kalimat untuk juri

*"Model Naive Bayes buatan sendiri berjalan di server kami, tanpa AI generatif. Nomor, email, rekening, dan tautan disamarkan di perangkat sebelum dikirim; server tidak mencatat atau menyimpan teks. Model dilatih dengan data sintetis yang dibuat dengan bantuan AI lalu diperiksa tim, dan diuji dengan pesan yang ditulis tim sendiri."*
