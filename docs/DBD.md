# DBD — Design Brief Documentation

> **Draft v0.1 — belum disetujui**  
> Baseline: `main` · commit `2c94c935` (28 Oktober 2026).  
> Dokumen ini merangkum arah desain yang tampak pada snapshot kode; rekomendasi bukan deskripsi fitur yang sudah selesai.

**Navigasi dokumentasi:** [PRD](PRD.md) · [TRD](TRD.md) · [AFD](AFD.md) · **DBD** · [BSD](BSD.md) · [IPD](IPD.md)

## 1. Ringkasan dan prinsip desain

**Aktual.** Anti Trap Order (ATO) menempatkan diri sebagai alat bantu berpikir dan pelatih refleks, bukan pemeriksa yang mengeluarkan kepastian atau skor persentase. A20 memberi dua bingkai pengalaman: A20 Lite / *The Reflex* untuk membedah situasi dengan cepat, dan A20 Soul / *The Guardian Arc* untuk latihan naratif tentang menjadi penjaga. Bahasa hero mengajak pengguna menemukan celah sendiri; pesan hasil juga menyarankan verifikasi melalui kanal resmi. [copy landing](../src/content/landing.ts) [Hero](../src/components/landing/Hero.tsx) [ReverseReflexDemo](../src/components/landing/ReverseReflexDemo.tsx)

**Usulan.** Pertahankan identitas visual digital/teknis—gelap, grid, cahaya teal-sian—tetapi jangan sampai estetika “konsol keamanan” terasa mengintimidasi atau menyalahkan orang yang hampir tertipu. Gunakan nada setara, tenang, praktis dan non-menghakimi: soroti taktik dan pilihan aman, bukan kekurangan korban. Hindari janji “deteksi”, “aman”, atau angka kepastian. Jelaskan bahwa hasil adalah bahan pertimbangan dan verifikasi resmi tetap diperlukan.

## 2. Pengalaman dan hierarki

**Aktual.** Halaman beranda memulai dengan headline dan CTA, lalu memperlihatkan pratinjau simulasi, penjelasan sistem, demo Reverse Reflex serta prinsip dan keterbatasan. Hero memadukan kisi, aurora, spotlight, console bertahap dan ticker skenario. [komposisi Hero](../src/components/landing/Hero.tsx) [HeroConsole](../src/components/landing/HeroConsole.tsx) [Trust](../src/components/landing/Trust.tsx)

A20 Lite memiliki alur input situasi → pertanyaan perspektif → hasil; hasil menampilkan celah, langkah aman, pilihan nada pesan dan tombol salin. A20 Soul menyajikan narasi, pilihan respons, tiga indikator kondisi cerita, lalu refleksi akhir. [halaman Lite](../src/app/lite/page.tsx) [halaman Soul](../src/app/soul/page.tsx)

Navigasi landing berupa pill mengambang: navigasi bagian dan CTA di desktop, menu lembar tarik di viewport kecil. Root layout juga menambahkan tab bar bawah khusus mobile untuk Latihan, Lite, Soul, dan Docs. Halaman Lite/Soul memiliki header tersendiri dan tautan silang antarmode. [Navbar](../src/components/landing/Navbar.tsx) [MobileTabBar](../src/components/layout/MobileTabBar.tsx) [root layout](../src/app/layout.tsx)

**Usulan.** Jadikan langkah berikutnya, progres alur, dan tombol utama paling menonjol; tempatkan penjelasan, disclaimer, dan kontrol sekunder dalam urutan yang mudah dipindai. Di layar sempit, pastikan CTA dan kontrol salin tidak tenggelam oleh tab bar tetap. Periksa hierarki pada lebar kecil, teks panjang, pembesaran, serta orientasi lanskap; jangan mengandalkan hover untuk mengungkap fungsi.

## 3. Sistem visual: token aktual dan arah lanjutan

**Token aktual.** `globals.css` menetapkan warna permukaan `#07090D`, kartu `#0D1117`, elevated `#161B22`, border putih 8% opasitas, teks utama `#F5F7FA`, teks redup `#8B95A5`, teal `#10B981`, sian `#22D3EE`, dan amber `#F59E0B`. Tailwind mengulang sebagian warna tersebut dan juga menyediakan palet terang `#F7F8FA`, putih, `#0D1117`, muted `#64748B`, border `#E2E8F0`; komponen Trust memang menggunakan tema terang. Jadi sistem aktual dominan gelap, tetapi tidak seragam gelap di semua section. [globals.css](../src/app/globals.css) [tailwind.config.ts](../tailwind.config.ts) [Trust](../src/components/landing/Trust.tsx)

Tipografi memakai Geist Sans untuk teks antarmuka dan Geist Mono untuk label teknis/status. Layout memanfaatkan skala spacing bawaan Tailwind (tidak ada skala spacing khusus di konfigurasi yang dibaca). Konfigurasi tidak memperluas radius; pemakaian aktual mencampur utilitas seperti `rounded-xl`, `rounded-2xl`, `rounded-3xl`, pill, serta nilai arbitrer `28px` dan `44px` pada shell hero. Perlakukan ini sebagai pola pemakaian, bukan token radius baku. [layout.tsx](../src/app/layout.tsx) [tailwind.config.ts](../tailwind.config.ts) [Hero](../src/components/landing/Hero.tsx)

**Primitives aktual.** Grid/noise dan aurora berfungsi sebagai lapisan dekoratif; CursorSpotlight terbatas pada pointer halus dan non-reduced-motion; BorderBeam menggambar tepi animasi; SpotlightCard memberi sorotan radial saat pointer bergerak. Framer Motion menangani transisi section/menu/step, sementara ikon berasal dari Lucide React. [GridBackground](../src/components/ui/GridBackground.tsx) [Aurora](../src/components/ui/Aurora.tsx) [CursorSpotlight](../src/components/ui/CursorSpotlight.tsx) [BorderBeam](../src/components/ui/BorderBeam.tsx) [SpotlightCard](../src/components/ui/SpotlightCard.tsx)

**Usulan.** Formalisasikan alias semantik untuk warna teks, permukaan, border, sukses, peringatan dan fokus; tetapkan skala spacing/radius terbatas setelah audit penggunaan. Pertahankan amber untuk tanda taktik/peringatan dan teal untuk tindakan aman, tetapi jangan memakai warna sebagai satu-satunya pembawa makna. Motion harus membantu urutan, bukan memberi kesan urgensi palsu; batasi dekorasi bergerak dan sediakan alternatif tanpa animasi.

## 4. Keadaan antarmuka dan akurasi nada

**Aktual.** HeroConsole memiliki lima fase otomatis, kontrol jeda, tampilan akhir default untuk SSR/reduced motion, dan tombol salin. Global CSS mengurangi durasi animasi serta menonaktifkan smooth scroll bagi preferensi reduced motion; BorderBeam dan spotlight juga menghormati preferensi ini. API client mencoba backend lalu memakai data/engine lokal untuk sebagian kegagalan atau timeout. [HeroConsole](../src/components/landing/HeroConsole.tsx) [globals.css](../src/app/globals.css) [api client](../src/lib/api.ts)

**Gap aktual.** Penanda `Go API Live` pada demo berarti permintaan tidak memakai fallback (`isOffline` false), bukan bukti layanan produksi sedang live. Skor “Tingkat Bahaya: n/3” pada demo dapat terasa bertentangan dengan pesan ATO yang menolak kepastian berbentuk skor. Saat fallback lokal aktif, sebagian layar menampilkan “Local Engine”/“Offline Mode”. Namun catch pada demo, Lite dan Soul hanya mencatat kegagalan; antarmuka tidak menyediakan state error/pemulihan yang jelas untuk semua kegagalan. [ReverseReflexDemo](../src/components/landing/ReverseReflexDemo.tsx) [Lite](../src/app/lite/page.tsx) [Soul](../src/app/soul/page.tsx) [api client](../src/lib/api.ts)

**Usulan.** Bedakan “diproses secara lokal” dari status konektivitas, dan hindari label live yang tidak diverifikasi. Jelaskan angka 1–3 sebagai tingkat taktik skenario atau hapus indikatornya dari demo; jangan menyajikannya sebagai probabilitas/kepastian. Sediakan state memuat, kosong, berhasil, fallback dan gagal yang eksplisit: apa yang terjadi, apakah teks tersimpan/dikirim, serta pilihan coba lagi atau kembali. Jika clipboard tidak tersedia/ditolak, tampilkan pesan dan biarkan teks mudah disalin manual. Tidak ada bukti bahwa semua pesan gagal dan izin clipboard sudah ditangani.

## 5. Aksesibilitas dan kriteria penerimaan (usulan)

**Aktual.** Dokumen HTML berbahasa Indonesia; ada label navigasi, label aksesibel untuk tombol jeda/menu, fokus terlihat pada CTA desktop, dan `aria-live="polite"` pada hasil demo. Beberapa input memakai label yang terhubung. Namun ini bukan audit kepatuhan aksesibilitas. [layout.tsx](../src/app/layout.tsx) [Navbar](../src/components/landing/Navbar.tsx) [ReverseReflexDemo](../src/components/landing/ReverseReflexDemo.tsx) [Lite](../src/app/lite/page.tsx)

**Usulan — acceptance checklist sebelum persetujuan desain:**
- Seluruh alur utama dapat diselesaikan dengan keyboard; fokus terlihat, urut, dan tidak tertutup header/tab bar. Menu mengumumkan status buka/tutup dan tautan aktif secara semantik.
- Kontrol pilihan, nada, reset, checklist dan salin memiliki nama serta status yang dapat dibaca pembaca layar; pesan loading/hasil/error diumumkan tanpa memindah fokus secara mengejutkan.
- Kontras teks, ikon, batas kontrol, dan fokus diperiksa pada tema gelap maupun section terang; informasi tidak bergantung hanya pada warna atau animasi.
- Periksa zoom, reflow layar sempit, target sentuh, teks panjang, reduced motion, dan keadaan clipboard/offline. Tampilkan penjelasan keterbatasan dengan bahasa yang tidak menyalahkan pengguna.
- Copy tidak menjanjikan deteksi pasti; hasil mendorong verifikasi melalui sumber resmi dan angka apa pun diberi makna yang jelas.

## 6. Keputusan terbuka

**Perlu keputusan.** Apakah tema terang pada section Trust merupakan kontras yang disengaja atau perlu konsistensi tema? Apakah skor bahaya per taktik dipertahankan dengan label yang lebih jelas atau dihapus? Apa arti status koneksi yang perlu diketahui pengguna dan bagaimana menyampaikan fallback? Apakah tab bar mobile harus tampil pada seluruh rute dan bagaimana ruang bawah konten dijaga? Siapa yang menetapkan standar kontras, ukuran target sentuh, serta perilaku error/clipboard sebelum checklist aksesibilitas dianggap terpenuhi?

## Catatan konsistensi sumber

README menyebut Next.js 15 dan menandai engine Reverse Reflex sebagai fase mendatang, sementara `package.json` menetapkan Next.js `^16.4.3` dan implementasi demo serta halaman Lite sudah ada. Brief ini mengikuti source untuk klaim implementasi, bukan checklist README. Outline proyek DOCX memberi konteks visi, alur, dan nada; ia adalah draft perancangan, bukan bukti bahwa semua skenario atau kriteria sudah tersedia pada baseline ini. [README](../README.md) [package.json](../package.json) [Project Outline Draft](Anti%20Trap%20Order%20Project%20Outline%20Draft.docx)
