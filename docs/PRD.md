# PRD — Product Requirement Documentation

> **Draft v0.1 — belum disetujui** · **Baseline:** `main` @ `2c94c93` (28 Oktober 2026)
>
> Status dalam dokumen: **Aktual** = ada bukti pada snapshot kode; **Usulan** = target/rekomendasi, belum dinyatakan tersedia; **Perlu keputusan** = pilihan pemilik produk belum ditetapkan.

**Navigasi dokumen:** [PRD](PRD.md) · [TRD](TRD.md) · [AFD](AFD.md) · [DBD](DBD.md) · [BSD](BSD.md) · [IPD](IPD.md)

## 1. Masalah dan visi

**Aktual —** Anti Trap Order (ATO) dirancang sebagai alat bantu berpikir edukatif, bukan alat yang menetapkan pesan “aman” atau “penipuan”. Antarmuka mengajak pengguna memeriksa situasi dari sudut pandang pelaku, lalu menampilkan indikator, langkah berhati-hati, dan teks peringatan. Hasil `confidence_note` juga menegaskan bahwa analisis bukan vonis mutlak (`../src/lib/reflect-local.ts#L285-L296`). Pengguna tetap perlu memverifikasi melalui kanal resmi; ATO tidak menggantikan verifikasi tersebut (`../src/app/tentang/page.tsx#L142-L179`).

**Usulan —** Visi produk adalah membantu masyarakat Indonesia mengenali taktik rekayasa sosial, berhenti sebelum bertindak, memeriksa informasi secara mandiri, dan memperingatkan orang lain tanpa memberi rasa aman palsu. Keberhasilan berarti pengguna memahami alasan untuk berhenti dan memverifikasi—bukan banyaknya pesan yang “terdeteksi”.

Masalah dan pengguna sasaran di bawah ini berangkat dari Project Outline Draft (mahasiswa dan anak muda usia 18–28, serta orang yang ingin menjaga keluarga/teman); segmen ini masih asumsi produk dan belum divalidasi melalui riset pengguna (`../docs/Anti%20Trap%20Order%20Project%20Outline%20Draft.docx`).

## 2. Pengguna dan pekerjaan yang ingin diselesaikan

**Usulan —** Pengguna utama adalah anak muda yang menerima pesan kerja, giveaway, pinjaman, investasi, atau permintaan mendadak, lalu ingin menjawab: “Apa yang janggal, apa yang sebaiknya saya lakukan sekarang, dan bagaimana menjelaskannya kepada orang lain?” Pengguna sekunder adalah teman, keluarga, atau pendamping edukasi yang ingin menyampaikan peringatan dengan bahasa yang tidak menggurui. ATO harus mudah dipakai tanpa keahlian keamanan siber dan tidak menyuruh pengguna menempelkan rahasia pribadi.

**Outcome yang diharapkan (belum diukur):** lebih banyak pengguna dapat menyebutkan sedikitnya satu indikator dan satu tindakan verifikasi setelah latihan; mereka mengetahui bahwa keluaran ATO bukan kepastian; dan mereka dapat membagikan peringatan tanpa mengirimkan ulang informasi sensitif.

## 3. Cakupan prototipe dan batas

**Aktual —** Snapshot memuat landing page dengan demo reverse-reflex (`../src/app/page.tsx#L1-L38`), A20 Lite (`../src/app/lite/page.tsx#L37-L58`), A20 Soul (`../src/app/soul/page.tsx#L37-L55`), dan delapan tahap latihan harian (`../src/app/drill/page.tsx#L40-L142`). Lite menyediakan skenario contoh, input teks bebas maksimal 1.000 karakter, pertanyaan pilihan, hasil berisi celah/penjelasan/langkah aman, pilihan nada peringatan, salin ke clipboard, dan disclaimer (`../src/app/lite/page.tsx#L395-L435`; `../src/app/lite/page.tsx#L616-L741`). Client mencoba API Go dan beralih ke mesin lokal saat respons non-2xx, kegagalan jaringan, atau timeout (`../src/lib/api.ts#L16-L38`, `#L75-L95`).

Soul memiliki cerita bercabang, pilihan berdampak pada state, pengakhiran, reset, dan penyimpanan progres lokal. Namun implementasi memilih arc bawaan pertama; Outline yang membayangkan pengguna membuat/memilih profil penjaga dan beberapa misi belum sepenuhnya terealisasi (`../src/app/soul/page.tsx#L57-L123`; bandingkan rencana `../docs/Anti%20Trap%20Order%20Project%20Outline%20Draft.docx`). Drill punya delapan node dan menyimpan streak/XP/tahap di `localStorage` (`../src/app/drill/page.tsx#L51-L142`). Kode saat ini memajukan latihan dan memberi XP saat semua pertanyaan selesai; PRD ini tidak menganggap validasi pembelajaran atau penilaian jawaban sudah terbukti (`../src/app/drill/page.tsx#L241-L273`).

**Usulan —** Pertahankan satu prototipe edukasi dengan tiga jalur tersebut, skenario data-driven, penjelasan keterbatasan, dan akses tanpa membuat akun. Perbaikan berikutnya sebaiknya memprioritaskan kejelasan hasil dan keamanan data, bukan menambah banyak fitur.

**Di luar cakupan prototipe / non-goals:** deteksi otomatis yang menjamin kebenaran; skor probabilitas atau peringkat “aman”; pemblokiran pesan, pemulihan dana, respons darurat, atau pengganti kanal resmi; integrasi WhatsApp/media sosial; akun/sinkronisasi lintas perangkat; profil pengguna buatan, kurikulum adaptif, pelaporan otomatis, serta klaim dampak belajar. Fitur yang tercantum sebagai roadmap/dokumen rancangan tidak dianggap sudah live hanya karena disebut di outline atau README.

## 4. Kebutuhan fungsional

Kriteria berikut adalah persyaratan **Usulan**; verifikasi dilakukan pada build yang ditetapkan sebelum rilis, bukan klaim hasil tes saat ini.

- **PRD-01 — Mulai dari contoh atau situasi sendiri.** Pengguna dapat memilih skenario tersedia atau memasukkan teks. **Terima jika:** kedua alur dapat dimulai; teks lebih dari 1.000 karakter ditolak atau dipotong secara konsisten dengan pesan yang jelas; tampilan mengingatkan agar tidak memasukkan PIN, kata sandi, OTP, nomor identitas, atau data rekening. Batas yang terlihat di Lite kini 1.000 karakter (`../src/app/lite/page.tsx#L395-L419`); handler Go juga menolak free-text lebih dari 1.000 byte (`../internal/handler/handler.go#L100-L124`), sehingga kesesuaian batas karakter multibyte perlu diuji.
- **PRD-02 — Latih pembalikan perspektif.** Pengguna menjawab pertanyaan sebelum menerima analisis. **Terima jika:** jawaban dapat dipilih dan alur bergerak ke pertanyaan berikut/hasil; hasil menjelaskan hubungan pilihan dengan indikator, tanpa menampilkan persentase kepastian (`../src/app/lite/page.tsx#L438-L500`; `../src/lib/reflect-local.ts#L257-L297`).
- **PRD-03 — Beri tindakan, bukan vonis.** **Terima jika:** hasil menyajikan alasan yang dapat ditelusuri ke skenario/indikator, langkah verifikasi atau pengamanan, peringatan yang bisa disalin, dan disclaimer; bila layanan/API gagal, antarmuka menandai penggunaan fallback lokal (`../src/lib/api.ts#L75-L95`; `../src/app/lite/page.tsx#L667-L741`).
- **PRD-04 — Latihan cerita.** **Terima jika:** pilihan Soul mengubah state/lanjutan cerita dan pengguna dapat mengulang; bila progres disimpan di perangkat, antarmuka menjelaskan cara menghapusnya. Perilaku alur dan penyimpanan lokal ada, tetapi kejelasan retensi/penghapusan perlu dirapikan (`../src/app/soul/page.tsx#L92-L123`).
- **PRD-05 — Navigasi dan aksesibilitas dasar.** **Terima jika:** pengguna bisa berpindah antara Lite, Soul, latihan, dan informasi keterbatasan; seluruh alur pokok dapat digunakan dengan keyboard serta label kontrol terbaca. Pemeriksaan aksesibilitas lintas perangkat belum dibuktikan oleh source yang ditelaah.

## 5. Privasi dan keamanan

**Aktual —** Input Lite dikirim sebagai `free_text` dalam request ke endpoint API yang dicoba klien; fallback lokal dipilih setelah respons non-2xx atau kegagalan/timeout, sehingga fallback bukan bukti request tidak pernah diterima server (`../src/lib/api.ts#L75-L95`). Handler menerapkan batas ukuran request dan batas teks, lalu memproses request; middleware memasang pembatasan laju dan header tertentu (`../internal/handler/handler.go#L100-L124`; `../cmd/server/main.go#L41-L57`). Komentar panic recovery menyebut pencatatan metadata saja, tetapi implementasi juga memformat nilai panic ke log; karena itu jangan mengklaim body/input pasti tidak tercatat tanpa audit (`../internal/middleware/middleware.go#L130-L144`). Ini juga tidak membuktikan kebijakan log seluruh infrastruktur/deployment. Tidak ditemukan bukti untuk menyatakan telemetri produk, database pengguna, atau layanan autentikasi digunakan.

**Usulan —** Minimalkan dan jelaskan data yang dikirim; jangan simpan isi pesan atau kredensial; sediakan penghapusan progres lokal yang nyata; validasi dan batasi input di server; tinjau logging, proxy, konfigurasi CORS, serta header keamanan sebelum rilis. Sampaikan bahwa browser dan server pemroses menerima teks yang ditempelkan, dan sarankan menyamarkan identitas. Jangan memasukkan pesan ke analitik tanpa keputusan privasi eksplisit.

## 6. Metrik usulan, risiko, dan keputusan terbuka

**Metrik usulan (belum diinstrumentasi/diukur):** tingkat penyelesaian alur latihan; proporsi peserta uji yang mampu menyebutkan indikator dan langkah verifikasi; pemahaman bahwa keluaran bukan vonis; keberhasilan menyalin peringatan; serta tingkat kegagalan/timeout per alur. Ukur melalui uji usability terencana atau telemetry yang disetujui secara privasi; jangan menyimpulkan efektivitas anti-penipuan dari jumlah hasil maupun XP.

**Risiko:** aturan berbasis pola dan skenario dapat melewatkan modus baru atau memberi saran kurang cocok (`../src/lib/reflect-local.ts#L62-L93`, `#L120-L168`); teks sensitif dapat terkirim ke backend walau terdapat peringatan; bahasa yang terlalu tegas dapat disalahartikan sebagai kepastian; progres lokal dapat hilang atau tetap tersimpan pada perangkat bersama; label streak/XP dapat menimbulkan kesan hasil belajar yang belum diuji. Mitigasi usulan: disclaimer kontekstual, anjuran verifikasi resmi, minimisasi input, pilihan hapus progres, review skenario, dan evaluasi dengan pengguna.

**Perlu keputusan:** (1) apakah Lite dan Soul sama-sama target wajib rilis atau Lite prioritas; (2) siapa pemilik dan proses review akurasi konten; (3) apakah pengiriman free-text ke API tetap diizinkan dan bagaimana retensi/logging seluruh deployment diverifikasi; (4) apakah metrik dikumpulkan tanpa identitas atau hanya lewat sesi uji sukarela; (5) definisi serta rentang manfaat belajar yang layak; (6) kebijakan untuk rekomendasi kanal pelaporan agar selalu mutakhir.

## 7. Konflik sumber dan keterbatasan bukti

README menyebut Next.js 15 dan fase 2–4 belum selesai, sedangkan `package.json` menetapkan Next.js `^16.4.3` dan route/component nyata telah ditambahkan (`../package.json#L13-L22`; `../src/app/page.tsx#L1-L38`). Perlakukan status fase README sebagai konteks lama, bukan status snapshot. Outline adalah draft rancangan: beberapa gagasannya—misalnya karakter Soul yang dapat dipilih/dibuat dan kanal laporan di Action Card—belum tampak pada alur yang diperiksa. Belum ada verifikasi runtime, rilis, hasil uji pengguna, kepatuhan privasi deployment, atau pengukuran performa; PRD ini tidak menyatakan hal-hal itu telah tercapai.
