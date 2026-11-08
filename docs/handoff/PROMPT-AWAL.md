# Prompt awal untuk Claude Code

Salin teks di bawah garis ke Claude Code, dijalankan dari folder repo setelah `git pull` dan berpindah ke branch yang memuat folder `docs/handoff/`.

---

Halo. Proyek ini Anti Trap Order (ATO) untuk lomba MIT-Week UNMUL 2026. Perancangannya sudah dibahas panjang di sesi lain, dan semua hasilnya ada di repo ini. Saya awam soal machine learning, jadi tolong jelaskan langkahmu dengan bahasa sederhana.

Sebelum menulis kode apa pun:

1. Baca `CLAUDE.md`, `docs/handoff/KEPUTUSAN.md`, `docs/handoff/ML-SPEC.md`, `docs/openapi.yaml`, dan `docs/api-v1.md`.
2. Lihat kode yang relevan: `src/lib/ml/contract.ts`, `src/types/api-v1.ts`, `internal/reflect/nlp.go`, `internal/data/scenarios.json`, `src/lib/reflect-local.ts`.
3. Ringkas pemahamanmu ke saya dalam maksimal 10 poin, termasuk apa saja yang akan kamu buat dan urutannya. Sebutkan juga jika ada yang bertentangan atau tidak jelas.
4. Tanyakan keputusan terbuka di `KEPUTUSAN.md` §7 yang berpengaruh ke tugas ini, terutama: dataset dibuat olehmu (sintetis) atau oleh tim.

Setelah saya setuju, kerjakan **bagian ML** sesuai `ML-SPEC.md`:

- Buat branch baru `feat/ml-browser`.
- Kerjakan bertahap dan commit per tahap: (a) label runtime + tokenizer + test, (b) dataset + generator, (c) Naive Bayes + training + `model.json` + `report.md`, (d) `analyzeText()` + test, (e) README untuk pemula.
- Setelah tahap (c), tunjukkan isi `report.md` dan jelaskan arti angkanya ke saya.
- Jangan menambah LLM, library ML, atau panggilan jaringan. Jangan mengubah UI atau `docs/openapi.yaml`.
- Di akhir, tulis ringkasan: file yang dibuat, cara melatih ulang, hasil uji, dan apa yang perlu dikerjakan tim frontend untuk memakainya.
