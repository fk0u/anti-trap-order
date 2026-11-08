# Laporan model ML

Dibuat oleh `go run ./cmd/ml-train` (tanpa cap waktu agar hasil deterministik). Data latih: `data/ml/train.csv` (1221 baris, sintetis). Ukuran `model.json`: 265172 byte; kosakata 5078 token.

## Pemilihan ambang taktik (validasi 20% dari train.csv)

Model sementara dilatih pada 80% data (berstrata kategori, seed tetap). Ambang dipilih dari 0,05 sampai 0,95: F1 tertinggi dengan presisi ≥ 0,8, jika tidak ada maka presisi tertinggi. Catatan: validasi memakai data dari generator yang sama dengan data latih, jadi angkanya lebih optimis daripada uji di bawah.

| taktik | ambang | presisi | recall | F1 |
|---|---|---|---|---|
| urgency | 0.95 | 0.93 | 0.86 | 0.89 |
| upfront_fee | 0.90 | 0.84 | 0.95 | 0.89 |
| impersonation | 0.95 | 0.62 | 0.51 | 0.56 |
| isolation | 0.50 | 0.81 | 0.77 | 0.79 |
| too_good | 0.30 | 0.85 | 0.87 | 0.86 |
| credential_request | 0.90 | 0.81 | 0.82 | 0.82 |
| link_or_apk | 0.95 | 0.86 | 0.95 | 0.90 |
| authority | 0.85 | 0.91 | 0.91 | 0.91 |

## Uji test-agen.csv (ditulis terpisah, tidak dipakai training)

Jumlah baris: 67

### Kategori

Akurasi: **0.866** (58 dari 67)

Confusion matrix (baris = kategori benar, kolom = prediksi):

| benar \ prediksi | tawaran_kerja | giveaway | akun_menyamar | pinjaman_investasi | lainnya |
|---|---|---|---|---|---|
| tawaran_kerja | 9 | 0 | 2 | 0 | 4 |
| giveaway | 0 | 9 | 0 | 0 | 0 |
| akun_menyamar | 1 | 1 | 9 | 0 | 0 |
| pinjaman_investasi | 0 | 0 | 0 | 11 | 0 |
| lainnya | 0 | 1 | 0 | 0 | 20 |

### Taktik

| taktik | presisi | recall | F1 | TP | FP | FN |
|---|---|---|---|---|---|---|
| urgency | 0.89 | 0.47 | 0.62 | 8 | 1 | 9 |
| upfront_fee | 0.95 | 0.90 | 0.92 | 18 | 1 | 2 |
| impersonation | 1.00 | 0.18 | 0.30 | 3 | 0 | 14 |
| isolation | 0.70 | 0.78 | 0.74 | 7 | 3 | 2 |
| too_good | 0.67 | 0.50 | 0.57 | 8 | 4 | 8 |
| credential_request | 1.00 | 0.71 | 0.83 | 10 | 0 | 4 |
| link_or_apk | 0.93 | 0.88 | 0.90 | 14 | 1 | 2 |
| authority | 1.00 | 0.43 | 0.60 | 6 | 0 | 8 |

Pesan normal yang salah diberi minimal satu taktik: **8.3%** (1 dari 12)

### Target ML-SPEC §7

| target | hasil | status |
|---|---|---|
| akurasi kategori ≥ 0,80 | 0.866 | ✅ |
| presisi upfront_fee ≥ 0,75 | 0.95 | ✅ |
| presisi credential_request ≥ 0,75 | 1.00 | ✅ |
| pesan normal salah ditandai ≤ 15% | 8.3% | ✅ |

### Contoh salah prediksi (maks. 10; salah kategori didahulukan)

- "Perkenalkan saya Bu Maya manajer rekrutmen PT Laut Biru Perkasa. Mohon kirim kode verifikasi yang masuk ke ponsel Anda untuk mengaktifkan akun pelamar" — kategori benar `tawaran_kerja`, prediksi `akun_menyamar`; taktik benar [credential_request, impersonation], prediksi [credential_request, impersonation]
- "Selamat bergabung kak! Tinggal transfer deposit peralatan Rp 300.000 sebelum jam 8 malam atau kontrak batal" — kategori benar `tawaran_kerja`, prediksi `lainnya`; taktik benar [upfront_fee, urgency], prediksi [upfront_fee, urgency]
- "Kemarin aku dikabari lolos jadi admin e-commerce, tapi katanya harus bayar 250rb buat laptop dan batas bayarnya malam ini" — kategori benar `tawaran_kerja`, prediksi `lainnya`; taktik benar [upfront_fee, urgency], prediksi [upfront_fee, urgency]
- "Seseorang mengaku manajer HRD kirim aku link buat isi biodata, link nya aneh banget" — kategori benar `tawaran_kerja`, prediksi `lainnya`; taktik benar [impersonation, link_or_apk], prediksi [link_or_apk]
- "Pihak yang ngaku dari dinas ketenagakerjaan minta foto KTP dan kode OTP buat daftar kerja. Aku nggak jadi kirim" — kategori benar `tawaran_kerja`, prediksi `akun_menyamar`; taktik benar [authority, credential_request], prediksi [credential_request]
- "Ada yang mengaku staf rekrutmen perusahaan tambang, meminta uang pendaftaran 300rb padahal aku cuma lamar lewat email" — kategori benar `tawaran_kerja`, prediksi `lainnya`; taktik benar [impersonation, upfront_fee], prediksi [upfront_fee]
- "Bapak dari kepolisian, anak Anda tersangkut kasus. Harus damai hari ini, kirim uang 5 juta" — kategori benar `akun_menyamar`, prediksi `giveaway`; taktik benar [authority, impersonation, urgency], prediksi [authority]
- "Telepon dari yang ngaku resmi pihak kepolisian meminta PIN rekeningku. Langsung kututup" — kategori benar `akun_menyamar`, prediksi `tawaran_kerja`; taktik benar [authority, credential_request], prediksi []
- "Kurir palsu menelepon, minta kode yang dikirim lewat sms untuk mengantar paket" — kategori benar `lainnya`, prediksi `giveaway`; taktik benar [credential_request, impersonation], prediksi [credential_request, too_good]
- "Dibutuhkan 15 orang operator warung digital, gaji 6 juta tanpa tes! Setor dulu uang seragam dan kartu pegawai 175rb, pendaftaran ditutup malam ini" — kategori benar `tawaran_kerja`, prediksi `tawaran_kerja`; taktik benar [too_good, upfront_fee, urgency], prediksi [upfront_fee]

## Uji test-tim.csv

Dilewati: baru berisi contoh (≤ 3 baris). Isi 30–50 baris oleh tim lalu jalankan ulang.