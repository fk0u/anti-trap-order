# BSD — Backend Schema Documentation

> **Draft v0.1 — belum disetujui** · Baseline `main` commit `2c94c935` (28 Oktober 2026)
>
> **Aktual** = terlihat di kode/data pada baseline. **Usulan** = saran untuk masa depan, belum diimplementasikan. **Perlu keputusan** = pilihan produk/teknis yang belum ditetapkan.

**Navigasi dokumentasi:** [PRD](PRD.md) · [TRD](TRD.md) · [AFD](AFD.md) · [DBD](DBD.md) · [BSD](BSD.md) · [IPD](IPD.md)

Dokumen ini mencatat bentuk data backend Anti Trap Order (ATO) yang benar-benar ada, bukan rancangan skema database. Konteks produk Project Outline menyebut data JSON/file-based dan kemungkinan SQLite/Postgres sebagai opsi, tetapi itu bukan bukti bahwa database sudah diterapkan ([Project Outline](../docs/Anti%20Trap%20Order%20Project%20Outline%20Draft.docx)).

## 1. Penyimpanan dan sumber data — Aktual

Backend tidak memakai database: dua berkas JSON (`scenarios.json` dan `soul-arcs.json`) disematkan ke binary melalui `go:embed`, dibaca saat inisialisasi, lalu dimuat ke struct Go, slice, dan map di memori. Map memakai `id` sebagai kunci; state perjalanan Soul dikirim kembali klien pada setiap permintaan, bukan disimpan sebagai rekaman server ([`data.go`](../internal/data/data.go), [`main.go`](../cmd/server/main.go), [`engine.go`](../internal/soul/engine.go)). Dengan demikian tidak ada tabel, user record, akun, autentikasi, atau migrasi database dalam schema aktual.

Model Go dan tipe TypeScript mendefinisikan kontrak JSON dengan nama field snake_case. Data seeded juga diduplikasi di backend dan frontend. Perbandingan isi baseline menunjukkan kedua pasang berkas—skenario dan Soul Arc—sama; namun tidak tampak generator, sumber tunggal, checksum, atau mekanisme versioning yang menjaga salinan tetap sama saat diedit kelak ([model Go](../internal/model/types.go), [tipe TypeScript](../src/types/api.ts), [seed Go](../internal/data/scenarios.json), [seed web](../src/data/scenarios.json), [seed Soul Go](../internal/data/soul-arcs.json), [seed Soul web](../src/data/soul-arcs.json)). Klien juga memiliki fallback lokal jika API gagal ([`api.ts`](../src/lib/api.ts)).

## 2. Entitas dan enumerasi — Aktual

- **Scenario** mempunyai `id`, `title`, `category`, `difficulty`, daftar `victim_view`, `perspective_questions`, `flaws`, `safe_steps`, `warning_templates`, dan `keywords`. Pesan berisi `from`/`text`; pertanyaan memuat pilihan dengan `id`, `label`, `tags`. Flaw memuat `tag`, penjelasan, `evidence_phrases`, dan `severity`. Langkah aman serta template peringatan masing-masing memiliki `id`, teks, dan `applies_to_tags`.
- `category` dibatasi tipe TypeScript ke `job_scam`, `giveaway`, `impersonation`, `phishing`, `loan`, `marketplace`, `generic`. `difficulty` dan `severity` ditulis sebagai `1 | 2 | 3` di TypeScript, tetapi berupa `int` biasa di Go. `WarningTone` hanya `casual` atau `firm`. Angka batas tersebut bukan validasi otomatis pada decoding Go.
- **SoulArc** terdiri dari profil `ward` (`name`, `relationship`, `age`, `context`), `initial_node_id`, `initial_state`, daftar `nodes` dan `endings`. Node memiliki `choices`; pilihan mengacu ke `next_node_id`, membawa perubahan `effects` untuk `trust`, `awareness`, `empathy`, serta opsional `perspective_hint`. Pada baseline ada 10 skenario dan satu arc `arc_dian_parttime`, dengan 5 node dan 3 ending ([data Soul](../internal/data/soul-arcs.json)).

Relasi dihubungkan memakai ID string, bukan foreign key: jawaban merujuk `question_id` dan `selected_option_id`; pilihan Soul menuju node lain atau sentinel `resolve_ending`. Skenario memakai tag yang sama secara logis pada pilihan, flaw, dan langkah, tetapi tidak ada objek master/tag registry terpisah. Seed Soul mempunyai `initial_node_id` yang merujuk node dalam arc; handler/engine juga mencari arc, node, dan pilihan berdasarkan ID ([`engine.go`](../internal/soul/engine.go)).

## 3. Request, response, dan aturan runtime — Aktual

Endpoint yang memakai schema domain ialah `GET /api/reflect/scenarios` (ringkasan), `GET /api/reflect/scenarios/{id}` (skenario penuh), `POST /api/reflect`, `GET /api/soul/arcs` (ringkasan arc), dan `POST /api/soul/step` ([routes dan handler](../internal/handler/handler.go)). Contoh request reflection:

```json
{"scenario_id":"wfh_admin_fee","answers":[{"question_id":"q1","selected_option_id":"q1_opt1"}]}
```

`scenario_id` dan `free_text` opsional di tipe, tetapi runtime meminta setidaknya salah satu; bila keduanya ada, scenario ID dipakai. Teks bebas dibatasi `len` Go 1.000 byte (bukan selalu 1.000 karakter Unicode). Jawaban yang ID-nya tidak cocok tidak menghasilkan error validasi khusus; engine hanya memakai pasangan yang ditemukan. Tidak ada validasi tipe statis TypeScript di server. Request JSON rusak, input kosong, teks terlalu panjang, atau ID skenario tak dikenal menghasilkan error HTTP. Dekoder Go tidak memberlakukan skema ketat atas field tambahan atau semua field wajib ([handler](../internal/handler/handler.go), [reflection engine](../internal/reflect/engine.go)).

Respons reflection memuat `scenario_id`, `matched_category`, hingga tiga `user_detected_flaws`, `safe_steps` (teks), pasangan template `casual`/`firm`, `confidence_note`, dan `perspective_summary`. Skor internal bersifat deterministik: kecocokan tag diberi bobot 10 per hitungan dan severity 2 kali nilainya; hasil diurutkan menurun dengan ID sebagai pemecah seri. Safe steps diambil dari seluruh daftar skenario tanpa memfilter `applies_to_tags`; template pertama untuk tiap tone dipakai. Ini bukan skor probabilitas dan `confidence_note` menyatakan hasil bukan deteksi pasti ([`engine.go`](../internal/reflect/engine.go)).

Contoh request langkah Soul: `{"arc_id":"arc_dian_parttime","node_id":"arc1_n1","choice_id":"c1_inversion_prompt","state":{"trust":60,"awareness":30,"empathy":50}}`. Efek pilihan ditambahkan ke state yang dikirim klien, kemudian masing-masing nilai dijepit pada rentang 0–100. Jika `next_node_id` adalah `resolve_ending`, ending dipilih menurut `awareness` dan `trust` dengan ambang 55; `empathy` tidak menentukan ending. Respons berisi `state` dan salah satu `next_node` atau `ending` (field yang nilainya null disembunyikan lewat `omitempty`). Server tidak menyimpan riwayat state ([tipe](../internal/model/types.go), [engine Soul](../internal/soul/engine.go)).

## 4. Validasi dan celah faktual

Saat runtime, pemuatan Go memeriksa JSON dapat di-decode dan `id` skenario/arc tidak kosong; pemeriksaan itu tidak menjamin keunikan ID, enum, kelengkapan relasi, atau batas angka. Script `npm run test:data` memeriksa salinan frontend dan graf Soul, bukan salinan backend. Ada konflik konkret: validator mensyaratkan minimal empat flaw untuk setiap skenario, sementara empat skenario seed—`apk_wedding_invitation`, `marketplace_cod_scam`, `romance_investment_pigbutchering`, dan `task_scam_review_maps`—masing-masing memiliki tiga. Maka validator sebagaimana tertulis akan menolak dataset tersebut bila dijalankan; dokumen ini tidak mengklaim test pernah dijalankan atau lulus ([validator](../scripts/validate-data.ts), [seed skenario](../internal/data/scenarios.json)).

Ada pula ketidakselarasan fallback: `getScenario` mencari ID `generic`, sedangkan skenario generik aktual bernama `generic_emergency`; jika ID yang diminta tidak ada di lokal, fallback itu jatuh ke elemen pertama ([`api.ts`](../src/lib/api.ts), [seed web](../src/data/scenarios.json)). Kontrak API tertulis perlu dibaca bersama handler aktual; misalnya contoh health di dokumentasi tidak memuat field `system` yang dikirim handler, dan timestamp/version handler saat ini berupa nilai hard-coded ([API contract](../docs/api-contract.md), [handler](../internal/handler/handler.go)).

## 5. Keputusan terbuka — Usulan, belum diterapkan

1. **Perlu keputusan:** tetapkan apakah JSON tetap menjadi sumber kanonis tanpa DB, atau apakah kebutuhan produk di masa depan membenarkan persistence. Outline hanya menyebut SQLite/Postgres sebagai opsi; tidak ada alasan untuk memaksakan tabel, login, atau migrasi sekarang.
2. **Usulan:** bila seed tetap diduplikasi, pilih proses sinkronisasi yang dapat diperiksa—misalnya satu sumber kanonis, generator, atau validasi kesetaraan kedua salinan—serta definisikan versi kontrak sebelum perubahan breaking.
3. **Perlu keputusan:** sepakati validasi minimum untuk rentang integer, ID unik dan referensi silang, field wajib/opsional, batas teks berdasarkan byte atau karakter, serta penanganan field tak dikenal. Selaraskan pula aturan jumlah flaw validator dengan data yang memang dimaksudkan.
