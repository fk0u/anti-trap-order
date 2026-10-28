# TRD — Technical Requirement Documentation

> **Draft v0.1 — belum disetujui.** Baseline: `main` commit `2c94c93` (28 Oktober 2026). Dokumen ini membedakan **Aktual** (terbukti pada snapshot), **Usulan** (target teknis, belum diterapkan), dan **Perlu keputusan** (pilihan pemilik produk/teknis). Ini bukan bukti layanan sedang live atau deployment berhasil.

**Navigasi dokumentasi** · [PRD](PRD.md) · [TRD](TRD.md) · [AFD](AFD.md) · [DBD](DBD.md) · [BSD](BSD.md) · [IPD](IPD.md)

## 1. Cakupan dan arsitektur

**Aktual.** Aplikasi memadukan frontend Next.js App Router dengan API Go. Deklarasi package menetapkan Next.js `^16.4.3`, React dan React DOM `^19.3.1`, TypeScript `^5.9.3`, serta Tailwind CSS `^3.4.19`; angka caret adalah rentang deklarasi, bukan bukti versi hasil instalasi. `go.mod` menyatakan direktif Go `1.22` dan tidak mencantumkan dependensi eksternal. Backend memakai `net/http` dan `http.NewServeMux`; klaim pada `RUAS_CONTEXT.md` bahwa router-nya Chi tidak sesuai dengan kode yang diperiksa. (Bukti: [package.json](../package.json), [go.mod](../go.mod), [main.go](../cmd/server/main.go), [handler.go](../internal/handler/handler.go), [RUAS_CONTEXT.md](../RUAS_CONTEXT.md).)

Frontend mengakses enam rute API memakai `NEXT_PUBLIC_API_URL` sebagai prefiks; jika kosong, request memakai path `/api/...` pada origin frontend. Request berakhir setelah batas 6 detik di klien. Untuk hasil non-2xx maupun kegagalan jaringan/timeout, fungsi klien melanjutkan ke implementasi lokal berbasis data TypeScript/JSON: daftar dan detail skenario, refleksi, daftar arc, dan langkah Soul. Tidak ada database atau sinkronisasi state sesi yang tampak pada jalur ini; kemajuan yang dikirim ke `/api/soul/step` adalah state dalam payload. Fallback bukan bukti hasil identik: kode lokal dan Go menggunakan aturan pemilihan/ranking berbeda. (Bukti: [api.ts](../src/lib/api.ts), [reflect-local.ts](../src/lib/reflect-local.ts), [soul-local.ts](../src/lib/soul-local.ts), [tipe API](../src/types/api.ts).)

## 2. API dan kontrak

Semua respons sukses ditulis sebagai JSON `application/json; charset=utf-8`. Tipe request/response utamanya didefinisikan pada Go dan TypeScript; struktur inti meliputi `Scenario`, `ReflectRequest/Response`, `SoulArcSummary`, `SoulStepRequest/Response`, dan state `trust`, `awareness`, `empathy`. (Bukti: [model/types.go](../internal/model/types.go), [tipe API frontend](../src/types/api.ts).)

| Endpoint | Perilaku aktual |
|---|---|
| `GET /api/health` | `200`, objek status, timestamp, versi, dan label sistem. Timestamp serta versi saat ini ditulis statis dalam handler, bukan waktu/versi build dinamis. |
| `GET /api/reflect/scenarios` | `200`, daftar `ScenarioSummary`. |
| `GET /api/reflect/scenarios/{id}` | `200`, skenario penuh; `400 INVALID_ID` bila ID kosong dan `404 NOT_FOUND` jika tidak ditemukan. |
| `POST /api/reflect` | Body `ReflectRequest` (`scenario_id` opsional, `free_text` opsional, `answers`); `200 ReflectResponse` dengan kategori, celah, langkah aman, templat peringatan, catatan keyakinan kualitatif, dan ringkasan perspektif. Input kosong menghasilkan `400 MISSING_INPUT`; teks lebih dari 1.000 byte ditolak. |
| `GET /api/soul/arcs` | `200`, daftar ringkas arc. |
| `POST /api/soul/step` | Body `arc_id`, `node_id`, `choice_id`, dan state; `200 SoulStepResponse`, berisi state dan node berikutnya atau ending. ID wajib kosong menghasilkan `400 MISSING_FIELDS`; ID arc/node/pilihan yang tidak dikenal menghasilkan `400 STEP_ERROR`. |

Endpoint POST mengembalikan `400 INVALID_JSON` jika decoder gagal; error proses refleksi diberi `PROCESSING_ERROR`. Error berbentuk `{ "error": { "code", "message" } }`, tetapi tidak semua kasus runtime dibungkus: khususnya batas ukuran body dapat gagal saat decode. Kontrak di `docs/api-contract.md` berguna sebagai referensi tipe, tetapi bukan otoritas atas implementasi: tipe dokumen menyebut `SafeStep` sebagai `string[]` pada respons refleksi sedangkan data input memakai objek; endpoint health di dokumen memberi contoh timestamp dinamis, sedangkan implementasi statis. (Bukti: [handler.go](../internal/handler/handler.go), [api-contract.md](../docs/api-contract.md).)

## 3. Validasi, batas permintaan, dan keamanan

**Aktual.** Server membatasi body hingga 1 MiB, menetapkan read-header 5 detik, read 15 detik, write 30 detik, idle 60 detik, dan graceful shutdown 10 detik. Middleware rate-limit proses lokal membatasi 120 request per menit per IP dan mengirim `429` serta `Retry-After: 60`. CORS memakai `CORS_ORIGIN`, tetapi default-nya `*`; pencocokan konfigurasi memakai `strings.Contains`, dan IP berasal dari header forwarding bila tersedia. Header keamanan memasang HSTS, `nosniff`, `DENY`, dan kebijakan referrer. Next.js juga mengatur header tersebut dan menonaktifkan `X-Powered-By`. (Bukti: [main.go](../cmd/server/main.go), [middleware.go](../internal/middleware/middleware.go), [next.config.mjs](../next.config.mjs).)

**Batas dan risiko aktual.** Validasi skema belum menyeluruh: handler hanya memeriksa panjang teks refleksi dan keberadaan beberapa field Soul; `len` Go menghitung byte, bukan karakter Unicode. Rate limit dalam memori tidak dibagi antar proses, bucket tidak terlihat dibersihkan secara periodik, dan nilai forwarding dapat dipalsukan jika proxy tidak menghapus/menetapkan ulang header itu. CORS default terbuka dan pencocokan substring bukan allowlist origin yang tepat. Recovery mencatat method/path dan nilai panic; karena itu klaim “metadata saja” dalam komentar belum cukup membuktikan nilai panic tak memuat data pengguna. Kontrak meminta teks bebas tidak dicatat, namun logging ini perlu diaudit sebelum klaim privasi operasional dibuat. (Bukti: [handler.go](../internal/handler/handler.go), [middleware.go](../internal/middleware/middleware.go).)

## 4. Konfigurasi dan operasi

**Aktual.** Konfigurasi yang tampak adalah `PORT` (default `8080`), `CORS_ORIGIN` (default `*`) dan `NEXT_PUBLIC_API_URL` (default kosong). Script deployment menunjukkan proses rsync, build Go/Next.js, menjalankan test Go, lalu reload/restart PM2; script itu juga mencoba `git push` dan memuat detail akses host/key. Script tidak dijalankan dalam penyusunan dokumen ini. **Usulan:** pisahkan deployment dari publikasi Git, gunakan secret manager/SSH key di luar repo, batasi izin dan asal CORS, verifikasi konfigurasi proxy TLS/forwarded-header, serta ganti nilai host dan kredensial statis dengan parameter environment aman. Jangan menyimpan rahasia di dokumentasi atau log. (Bukti: [main.go](../cmd/server/main.go), [middleware.go](../internal/middleware/middleware.go), [api.ts](../src/lib/api.ts), [deploy.sh](../scripts/deploy.sh).)

## 5. Privasi dan ancaman

**Aktual.** Arsitektur yang terlihat tidak memerlukan login atau database untuk endpoint ini; payload refleksi dapat berisi teks bebas dan dikirim ke backend jika API tersedia. Klien mengirim teks melalui JSON, server tidak menunjukkan penyimpanan pesan, dan dokumen API melarang pencatatan body. Ini tidak dengan sendirinya membuktikan kebijakan retensi log, konfigurasi reverse proxy, atau penggunaan telemetri pihak ketiga. **Usulan:** minimalkan pengiriman data (jelaskan pilihan lokal/server kepada pengguna), jangan mencatat payload atau ID sensitif, sanitasi panic/error agar tidak menggemakan input, tambahkan kebijakan privasi/retensi yang dapat diaudit, serta uji abuse, spoofing proxy, dan pembatasan body. Aplikasi harus tetap menyatakan hasilnya alat bantu berpikir, bukan verifikasi atau keputusan keamanan pasti. (Bukti: [api-contract.md](../docs/api-contract.md), [api.ts](../src/lib/api.ts), [middleware.go](../internal/middleware/middleware.go).)

## 6. Pengujian dan NFR yang diusulkan

**Aktual.** Tersedia test handler Go untuk health, daftar/detail skenario, request refleksi termasuk teks terlalu panjang, dan satu langkah Soul. `package.json` menyediakan `test:data`, `build`, dan `lint`, tetapi tidak ada script test frontend umum yang dideklarasikan di file tersebut. Tidak ada test, build, deploy, benchmark, atau pemeriksaan pipeline yang dijalankan untuk dokumen ini; keberadaan test bukan bukti semuanya lulus. (Bukti: [handler_test.go](../internal/handler/handler_test.go), [package.json](../package.json).)

**Usulan NFR untuk persetujuan:** (1) p95 respons API di bawah 500 ms untuk endpoint data statis dan 1 s untuk refleksi/Soul pada dataset serta lingkungan CI yang ditentukan; ukur dengan benchmark berulang, tanpa mengklaim kinerja saat ini. (2) p95 interaksi fallback lokal di bawah 100 ms pada perangkat acuan yang disepakati. (3) Uji otomatis mencakup validasi skema, UTF-8/batas byte, seluruh status error, CORS preflight/allowlist, spoofed forwarding header, timeout, fallback konsisten, dan paritas minimal untuk fixture bersama. (4) Build/test Go dan frontend harus menjadi pemeriksaan wajib sebelum rilis; tetapkan coverage minimum setelah baseline terukur. (5) Target availability dan retensi log harus diputuskan sebelum dinyatakan sebagai komitmen layanan.

## 7. Keputusan terbuka

Pemilik produk/teknis perlu memutuskan: origin frontend resmi dan kebijakan CORS; apakah fallback dan backend harus menghasilkan output semantik yang setara; batas teks dalam byte atau karakter; format/error kontrak dan timestamp health yang benar; trusted proxy yang menetapkan IP klien; strategi pengujian frontend, coverage serta lingkungan benchmark; dan sasaran availability/retensi privasi. Sampai diputuskan, angka NFR pada bagian sebelumnya adalah **usulan**, bukan persyaratan yang telah diterima.