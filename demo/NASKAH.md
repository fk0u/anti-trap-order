# Naskah video demo — Anti Trap Order (ATO)

Durasi target: **±3:00**. Format: animasi SVG (fframes) + cuplikan layar asli 390px. Subtitle Indonesia; narasi dibacakan Syafar (naskah di kolom "Narasi").
Semua pesan, nama, dan nomor di layar fiktif. Tidak ada skor, persen, atau klaim "mendeteksi penipuan".
Kalimat privasi hanya yang sudah dikonfirmasi di aplikasi (S-01, S-16); jangan menambah klaim baru.

| # | Waktu | Layar / visual | Narasi | Subtitle di layar |
|---|---|---|---|---|
| 1 | 0:00–0:12 | Gelembung pesan fiktif muncul satu per satu ("Dicari admin input data, Rp500rb/hari, bayar seragam Rp150rb"). Ketukan jari, jeda. | "Pesan seperti ini datang tiap hari. Terasa janggal, tapi kita tidak tahu persis di mana jebakannya." | Terasa janggal. Tapi di mana celahnya? |
| 2 | 0:12–0:25 | Logo A→Ω, judul S-01 "Jangan hanya waspada. Jadilah penjaganya." | "Anti Trap Order tidak memberi skor bahaya. Ia melatih kamu berpikir seperti pelakunya, supaya celahnya kamu temukan sendiri." | Jangan hanya waspada. Jadilah penjaganya. |
| 3 | 0:25–0:40 | Rekaman S-01 → ketuk "Coba A20 Lite". S-03: pilih kategori atau tempel pesan; chip "N data disamarkan" muncul. | "A20 Lite: tiga menit, tanpa login. Tempel pesan yang kamu terima. Nomor, email, dan tautan langsung disamarkan di perangkatmu." | Tanpa login · Tanpa data pribadi |
| 4 | 0:40–1:05 | S-04 s.d. S-06: pertanyaan Mode Pelaku, stepper A→Ω berjalan. Pilihan dipilih satu per satu. | "Lalu kamu jadi pelaku selama 30 detik. Tiga pertanyaan: apa yang kamu manfaatkan, tekanan apa yang kamu pakai, dan verifikasi apa yang paling kamu hindari." | Jadi pelakunya selama 30 detik |
| 5 | 1:05–1:25 | S-07 loading singkat → S-08 "Kamu menemukan N celah." Kartu "Yang mungkin belum kepikiran". | "Hasilnya bukan angka. Kamu melihat celah yang kamu temukan sendiri, dan celah yang mungkin belum kepikiran, lengkap dengan penangkalnya." | Kamu yang menemukan celahnya |
| 6 | 1:25–1:40 | S-09 Action Card: checklist, kalimat peringatan (santai/tegas), tombol "Salin kalimat" → "Tersalin ✓". | "Terakhir, kartu aksi yang bisa kamu bawa: langkah yang harus dilakukan dan kalimat untuk memperingatkan orang terdekat." | Bawa ini bersamamu |
| 7 | 1:40–2:10 | S-10 pilih karakter fiktif → S-11 misi, S-12 pilihan, S-13 konsekuensi dan meter bergerak → S-14 peringkat. | "A20 Soul: pilih seseorang yang ingin kamu jaga, misalnya adik atau ibu. Setiap keputusanmu berdampak pada kepercayaan, kewaspadaan, dan keamanannya." | Jaga seseorang lewat cerita |
| 8 | 2:10–2:30 | Diagram sederhana: teks → disamarkan di browser → analisis → dibuang. S-16 "Batasan & Privasi". | "Teks yang kamu tulis disamarkan dulu di perangkatmu, dianalisis, lalu langsung dibuang. Tidak ada AI generatif. Analisisnya Naive Bayes yang bisa dijelaskan." | Kami tidak menyimpan apa yang kamu tulis |
| 9 | 2:30–2:48 | Rekaman: server diputus (mode pesawat atau route Playwright) → S-19 "Koneksi ke server terputus" → ketuk "Lanjut mode terbatas" → Lite tetap sampai hasil. | "Bahkan saat server mati atau sinyal hilang, kamu tetap bisa lanjut. Mode terbatas menjalankan semuanya di perangkatmu." | Hasilnya dibuat di perangkatmu |
| 10 | 2:48–3:00 | Layar penutup: logo, "Ini alat bantu berpikir, bukan deteksi pasti." Tim dan lomba (MIT-Week UNMUL 2026 · Guardians of the Digital Space). | "Anti Trap Order. Bukan deteksi pasti, tapi latihan untuk jadi penjaga digital." | Ini alat bantu berpikir, bukan deteksi pasti. |

## Yang perlu diisi Syafar

- Nama tim dan anggota untuk layar penutup (no. 10).
- Suara narasi dan musik latar (bebas royalti). Naskah bisa dipangkas jika terlalu panjang.
- Persetujuan akhir narasi no. 8: klaim privasi harus tetap sama dengan teks di S-01/S-16.

## Catatan teknis

- Cuplikan layar diambil dari build produksi dengan backend Go asli (lihat CLAUDE.md → Test e2e), viewport 390×844, data fiktif dari `internal/data/v1`.
- Adegan no. 9 memakai fitur mode terbatas (Fase 1 di `plan.md`), jadi video dirender setelah fitur itu lolos tes.
- Proyek fframes dan hasil render ada di `demo/video/`.
