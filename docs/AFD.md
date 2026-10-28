# AFD — App Flow Documentation

> **Draft v0.1 — Belum disetujui**  
> Baseline: `main` @ `2c94c935` (28 Oktober 2026).  
> **Aktual** = perilaku yang tampak pada kode snapshot; **Usulan** = arahan dokumentasi/perbaikan, bukan fitur yang sudah ada; **Perlu keputusan** = pertanyaan produk/implementasi yang belum dipastikan.

## Navigasi dokumentasi

[PRD](PRD.md) · [TRD](TRD.md) · **AFD** · [DBD](DBD.md) · [BSD](BSD.md) · [IPD](IPD.md)

## Lingkup dan peta route aktual

Peta berikut merujuk pada App Router dan tautan UI yang ada, bukan klaim bahwa layanan sedang tersedia. Navigasi global desktop di landing memakai anchor untuk bagian halaman dan tautan ke route; tab bawah global di layar kecil hanya memuat Latihan, A20 Lite, A20 Soul, dan Docs. Karena itu `/tentang` tidak ada di tab bawah, tetapi tersedia dari navigasi landing. [Navbar](../src/components/landing/Navbar.tsx) · [konfigurasi tautan landing](../src/content/landing.ts) · [MobileTabBar](../src/components/layout/MobileTabBar.tsx) · [layout](../src/app/layout.tsx)

| Route | Entry dan alur/exit yang tampak |
|---|---|
| `/` | Landing berisi Hero, Problem, A20 System, demo Reverse Reflex, Trust, Final CTA, Footer. Navbar mengarah ke anchor Masalah, A20 System, Simulator; tautan lainnya menuju `/drill`, `/lite`, `/soul`, `/tentang`, `/docs`. Demo selesai menawarkan pengujian ulang atau masuk ke `/lite`/`/soul`/`/docs`. [page](../src/app/page.tsx) · [demo](../src/components/landing/ReverseReflexDemo.tsx) |
| `/lite` | Mode refleksi taktis; “Beranda” kembali ke `/`, tombol “A20 Soul” membuka `/soul`; hasil menyediakan reset/coba lagi dan tautan Docs. [Lite](../src/app/lite/page.tsx) |
| `/soul` | Cerita interaktif dengan karakter default Dian; “Beranda” ke `/`, “A20 Lite” ke `/lite`; ending menawarkan ulang cerita atau Lite. [Soul](../src/app/soul/page.tsx) |
| `/drill` | Peta delapan level dan modal latihan; Beranda ke `/`, modal dapat ditutup untuk kembali ke peta, hasil dapat menuju Lite. [Drill](../src/app/drill/page.tsx) |
| `/tentang` | Halaman filosofi/batasan; tautan ke Beranda, `/docs`, dan `/lite`. [Tentang](../src/app/tentang/page.tsx) |
| `/docs` | Halaman dokumentasi dengan tab Outline, Codebase, API, Architecture dan tautan unduh DOCX. Beranda kembali ke `/`. [Docs](../src/app/docs/page.tsx) |

## Alur interaksi

1. **Landing — demo Reverse Reflex.** Pengguna memilih skenario fiktif atau mengetik situasi pada kolom “Atau ketik sendiri situasi yang kamu alami” (maksimum 1.000 karakter; UI memperingatkan agar tidak memasukkan KTP, PIN atau password). Pencocokan teks demo mengubah skenario berdasarkan kata kunci; bila tidak cocok memilih `generic_emergency`. Tombol “Mulai Balik Perspektif” membuka pertanyaan pilihan ganda. Semua pilihan perlu dijawab sebelum “Buka Action Card”; tombol “← Ganti Skenario” kembali ke langkah awal. [ReverseReflexDemo](../src/components/landing/ReverseReflexDemo.tsx)
2. Setelah pilihan terakhir, demo memanggil `reflect` dan menampilkan tahap “Action Card & Results”: celah manipulasi, langkah aman, pilihan nada “Santai (Grup Teman)”/“Tegas (Grup Keluarga)”, tombol “Salin Pesan”, disclaimer, dan “Uji Skenario Lain”. Untuk sementara sebelum hasil API tiba, komponen dapat merender celah berdasarkan skenario lokal; tidak ada spinner/loading eksplisit di demo. Kegagalan request dicatat ke console, sementara helper API biasanya mengembalikan hasil lokal. [demo](../src/components/landing/ReverseReflexDemo.tsx) · [API client](../src/lib/api.ts)
3. **A20 Lite — input → refleksi → kartu.** Pada “Pilih Skenario Nyata”, pengguna memilih skenario lalu “Mulai Analisis Perspektif Pelaku”; atau memilih “Ketik Pesan Sendiri”, memasukkan teks, lalu tombol yang sama. Pertanyaan ditampilkan satu per satu sebagai “Inversi Perspektif #n”; pilih jawaban, atau gunakan tombol 1/2/3. Jawaban terakhir memicu analisis dan tahap hasil. “Reset”/Esc kembali ke input; tidak ada tombol kembali ke pertanyaan sebelumnya. [Lite](../src/app/lite/page.tsx)
4. Hasil Lite menampilkan “Hasil Inversi Perspektif”, celah beserta penjelasan/frasa indikator, checklist “Langkah Aman yang Harus Kamu Ambil Sekarang”, dan kalimat peringatan. Pengguna dapat mengganti nada “Santai (Keluarga)”/“Tegas (Formal)”, menyalin kalimat, menandai checklist, lalu mencoba situasi lain atau membuka Docs/Soul. Selama request, ada indikator penyusunan Action Card. [Lite](../src/app/lite/page.tsx)
5. **Soul.** Route langsung membuka arc lokal pertama dan memulihkan node/state/riwayat bila tersimpan; pengguna memilih respons pada dialog Dian, lalu state Trust/Awareness/Empathy dan node/ending diperbarui. “Hapus Progres” menghapus simpanan dan memulai ulang arc; setelah ending tersedia “Ulangi dengan Pendekatan Lain”. [Soul](../src/app/soul/page.tsx) · [fallback Soul](../src/lib/soul-local.ts)
6. **Drill.** Peta level menandai level terkunci/selesai. Membuka level menampilkan pesan, satu pertanyaan tiap layar, opsi, “Periksa Celah”, penjelasan, lalu “Lanjutkan”. Selesai semua pertanyaan memberi layar perayaan, +25 XP, dan jalan kembali ke peta atau Lite. Tutup modal keluar tanpa menandai level selesai. [Drill](../src/app/drill/page.tsx)

## Loading, offline, state, dan batas perilaku

- **Aktual — Lite/API.** `getScenarios`, `getScenario` dan `reflect` mencoba endpoint API dengan batas waktu 6 detik; respons non-OK maupun kegagalan/timeout jatuh ke data/mesin lokal. Teks bebas Lite dikirim sebagai `free_text` dalam request refleksi setiap kali klien mencoba endpoint API; fallback lokal dipilih setelah respons non-OK atau kegagalan/timeout, sehingga fallback bukan bukti request tidak pernah diterima server. Refleksi mengembalikan penanda `isOffline`; daftar/detail skenario tidak menampilkan status offline atau tombol coba lagi. [API client](../src/lib/api.ts) · [refleksi lokal](../src/lib/reflect-local.ts)
- **Aktual — celah error.** Pada Lite, bila `reflect` melempar error tak tertangani, UI hanya mencatatnya ke console, keluar dari loading dan tidak memberi pesan/error/retry yang terlihat; tahap hasil dapat kosong. Demo landing punya pola catch serupa. Soul menonaktifkan pilihan selama pemrosesan, tetapi catch hanya menulis ke console; tidak ada pesan retry yang terlihat. [Lite](../src/app/lite/page.tsx) · [demo](../src/components/landing/ReverseReflexDemo.tsx) · [Soul](../src/app/soul/page.tsx)
- **Aktual — kepemilikan state.** Demo landing dan Lite menyimpan input, jawaban, hasil, nada, checklist dan langkah dalam state komponen React; reset Lite mengosongkan alur/hasil, bukan mengubah skenario yang dipilih. Drill membaca/menulis XP, streak dan level selesai ke `localStorage` `ato_duolingo_drill_v1`; Soul menyimpan node, nilai dan history ke `ato_soul_progress_v1`, lalu menghapus progres saat ending/reset. [demo](../src/components/landing/ReverseReflexDemo.tsx) · [Lite](../src/app/lite/page.tsx) · [Drill](../src/app/drill/page.tsx) · [Soul](../src/app/soul/page.tsx)
- **Aktual — empty/loading.** Drill memakai data skenario yang diimpor lokal dan tidak memiliki panel loading/error khusus. Soul mengambil daftar arc tetapi tampilan memakai arc lokal pertama; tidak ada pemilih arc. Docs memanggil `/api/health`; badge hanya muncul jika memperoleh data, tanpa pesan unavailable atau tombol retry. Ini menjelaskan perilaku UI, bukan bukti API aktif. [Drill](../src/app/drill/page.tsx) · [Soul](../src/app/soul/page.tsx) · [Docs](../src/app/docs/page.tsx)

## Niat produk vs implementasi

**Aktual:** Source menyediakan enam route di atas dan interaksi demo/Lite, Soul, Drill serta Docs. **Usulan / perlu keputusan:** Outline produk menggambarkan Soul sebagai cerita tentang orang yang ingin dipilih/dijaga, sedangkan UI sekarang memakai Dian dan arc default; putuskan apakah personalisasi karakter memang ditunda atau tidak termasuk cakupan. Outline dan CONTEXT juga mendeskripsikan banyak kapabilitas sebagai sasaran/arsitektur; AFD ini tidak menganggapnya sebagai perilaku route sampai ada bukti implementasi. [Project Outline Draft](../docs/Anti%20Trap%20Order%20Project%20Outline%20Draft.docx) · [CONTEXT](../CONTEXT.md)

**Gap faktual untuk diperbaiki/diverifikasi:** Lite menginisialisasi ID `job_scam_wfh`, tetapi katalog klien memakai `wfh_admin_fee`; fallback lokal `getScenario` memilih skenario pertama bila ID tak ditemukan, sehingga data awal dapat tampil tanpa chip terpilih. Untuk input bebas, kode meminta `getScenario("generic")`, sementara katalog yang diperiksa memakai `generic_emergency`; fallback lokal kembali ke skenario pertama. Pastikan ID dan pertanyaan yang benar sebelum menyatakan alur generik. [Lite](../src/app/lite/page.tsx) · [API client](../src/lib/api.ts) · [data skenario](../src/data/scenarios.json)

README menandai fase landing lanjutan belum selesai, sementara source snapshot sudah merender bagian Problem/A20/Trust/CTA; CONTEXT menyebut Docs berisi 13 bab dan mendaftar skenario/route dengan nama yang tidak selalu sama persis dengan kode. Gunakan perilaku source di atas untuk alur aktual; selaraskan README/context terpisah pada revisi mendatang, bukan sebagai bukti fitur runtime. [README](../README.md) · [CONTEXT](../CONTEXT.md) · [landing](../src/app/page.tsx)

**Perlu keputusan:** Tetapkan pesan dan aksi retry yang terlihat ketika request gagal, perilaku kembali/menyimpan jawaban di pertanyaan Lite, pilihan arc Soul, serta sumber kebenaran ID skenario lintas frontend/backend. **Usulan:** setelah keputusan, tambahkan tes alur untuk gagal API, pemulihan lokal dan reset tanpa mengubah janji produk menjadi klaim ketersediaan layanan.
