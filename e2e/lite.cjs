// Uji E2E /lite dengan backend Go asli. Screenshot 390px DPR 2 per layar + cek privasi request.
const { chromium, BASE, OUT: out, VIEWPORT, DESKTOP } = require("./_setup.cjs");
const assert = require("node:assert/strict");
const ORIGIN_HDR = { "Access-Control-Allow-Origin": BASE, "Access-Control-Expose-Headers": "Retry-After", "Content-Type": "application/json" };

let pass = 0;
const ok = (m) => { pass++; console.log("  ✓", m); };

async function newPage(browser) {
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const bodies = [];
  page.on("request", (r) => { if (r.method() === "POST") bodies.push({ url: r.url(), body: r.postData() }); });
  return { ctx, page, bodies };
}
const shot = (page, name, full = true) => page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
const click = (page, text) => page.getByRole("button", { name: text, exact: true }).click();
/** Dari /lite baru: chip Giveaway → jawab Q1–Q2 → berhenti di Q3 (sudah memilih, belum kirim). */
async function toQ3(page) {
  await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Giveaway/ }).click();
  await click(page, "Lanjut →");
  for (let i = 0; i < 3; i++) {
    await page.getByText(`LITE · ${i + 1}/3`).waitFor();
    await page.getByRole("checkbox").nth(0).click();
    if (i < 2) await click(page, "Lanjut →");
  }
}

(async () => {
  const browser = await chromium.launch();

  // ---------- 1. Alur teks ----------
  {
    const { ctx, page, bodies } = await newPage(browser);
    await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator("nav.fixed").count(), 0, "tab bar harus tersembunyi");
    ok("MobileTabBar tersembunyi di /lite");
    assert.equal(await page.getByRole("button", { name: /Tawaran Kerja/ }).count(), 1);
    ok("chip kategori dimuat dari GET /categories");
    assert.ok(await page.getByText("Tambahkan sedikit lagi").isVisible());
    assert.ok(await page.getByRole("button", { name: "Lanjut →" }).isDisabled());
    ok("S-03 Empty: pesan 'Tambahkan sedikit lagi…' + Lanjut nonaktif");
    await shot(page, "e2e-s03-empty", false);

    const raw = "Dicari admin input data, Rp500rb/hari. Hubungi 081234567123 atau budi@mail.com, bayar seragam Rp150rb.";
    await page.locator("textarea").fill(raw);
    assert.equal(await page.locator("textarea").inputValue(), raw, "isi textarea tidak boleh diubah");
    await page.getByText("2 data disamarkan").waitFor();
    ok("chip '2 data disamarkan' muncul, isi textarea tetap utuh");
    await shot(page, "e2e-s03-masked", false);

    await click(page, "Lanjut →");
    await page.getByText("MODE PELAKU").waitFor();
    const an = bodies.find((b) => b.url.includes("/analyze"));
    assert.ok(an, "analyze harus dipanggil");
    assert.ok(!/081234567123|budi@mail\.com/.test(an.body), "data asli bocor: " + an.body);
    ok(`analyze hanya menerima teks termasking: ${an.body}`);

    // Q1: pilih 2 opsi, opsi ke-3 terkunci, isi "Lainnya"
    const opts = page.getByRole("checkbox");
    await opts.nth(0).click();
    await opts.nth(3).click();
    assert.equal(await opts.nth(1).getAttribute("aria-disabled"), "true", "opsi ke-3 harus terkunci");
    await opts.nth(1).click({ force: true }); // dipaksa: tetap harus diabaikan
    assert.equal(await page.locator('[role=checkbox][aria-checked="true"]').count(), 2);
    ok("maks. 2 opsi per pertanyaan");
    await shot(page, "e2e-s04-two", true);
    await page.getByRole("button", { name: /Lainnya/ }).click();
    await page.getByRole("textbox").fill("RAHASIA-LAINNYA");
    await shot(page, "e2e-s04-other", true);
    await click(page, "Lanjut →");
    await page.getByText("LITE · 2/3").waitFor();

    // Tombol "Kembali" di layar → Q1 dengan pilihan tetap
    await page.getByRole("button", { name: "Kembali" }).last().click();
    await page.getByText("LITE · 1/3").waitFor();
    assert.equal(await page.locator('[role=checkbox][aria-checked="true"]').count(), 2);
    ok("tombol Kembali kembali ke Q1, pilihan tetap");
    await click(page, "Lanjut →");
    await page.getByText("LITE · 2/3").waitFor();

    await page.getByRole("checkbox").nth(0).click();
    await shot(page, "e2e-s05", true);
    await click(page, "Lanjut →");
    await page.getByText("LITE · 3/3").waitFor();
    await page.getByRole("checkbox").nth(0).click();
    await shot(page, "e2e-s06", true);
    await click(page, "Lihat hasil →");
    await page.getByText("CELAH YANG KAMU TEMUKAN").waitFor();
    const rf = bodies.find((b) => b.url.includes("/reflect"));
    assert.ok(!rf.body.includes("RAHASIA"), "isi Lainnya bocor");
    assert.ok(rf.body.includes('"other_filled":true'));
    ok(`reflect hanya ID + other_filled: ${rf.body}`);
    await shot(page, "e2e-s08", true);
    await page.goBack();
    await page.getByText("LITE · 3/3").waitFor();
    ok("Back browser dari S-08 → Q3 (S-07 tidak masuk riwayat)");
    await click(page, "Lihat hasil →");
    await page.getByText("CELAH YANG KAMU TEMUKAN").waitFor();

    await click(page, "Lihat Action Card →");
    await page.getByRole("heading", { name: "Bawa ini bersamamu" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Simpan gambar" }).count(), 0);
    ok("S-09: tombol 'Simpan gambar' disembunyikan");
    await page.getByRole("checkbox").nth(1).click();
    await shot(page, "e2e-s09", true);
    await ctx.grantPermissions(["clipboard-read", "clipboard-write"]);
    await click(page, "Salin kalimat");
    await page.getByRole("button", { name: "Tersalin ✓" }).waitFor();
    ok("Salin kalimat → 'Tersalin ✓'");
    await shot(page, "e2e-s09-copied", true);
    await page.getByRole("radio", { name: "Tegas" }).click();
    ok("Segmented Santai/Tegas berfungsi");
    // Desktop 06 S-09 tidak punya tombol "Hasil" (hanya mobile) → Back browser.
    if (DESKTOP) await page.goBack();
    else await page.getByRole("button", { name: "Hasil" }).click();
    await page.getByText("CELAH YANG KAMU TEMUKAN").waitFor();
    ok(DESKTOP ? "Back browser di S-09 kembali ke S-08 (desktop)" : "tombol 'Hasil' di S-09 kembali ke S-08");
    await click(page, "Lihat Action Card →");
    await page.getByRole("heading", { name: "Bawa ini bersamamu" }).waitFor();
    await click(page, "Coba situasi lain");
    await page.getByText("LITE · 0/3").waitFor();
    assert.equal(await page.locator("textarea").inputValue(), "");
    ok("Coba situasi lain → kembali ke S-03 kosong");
    await ctx.close();
  }

  // ---------- 2. Alur chip + 429 + lambat + timeout ----------
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Giveaway/ }).click();
    await shot(page, "e2e-s03-chip", false);
    await click(page, "Lanjut →");
    await page.getByText("MODE PELAKU").waitFor();
    ok("alur chip: skenario cadangan kategori dimuat");
    for (let i = 0; i < 3; i++) {
      await page.getByRole("checkbox").nth(0).click();
      await click(page, i < 2 ? "Lanjut →" : "Lihat hasil →");
      if (i < 2) await page.getByText(`LITE · ${i + 2}/3`).waitFor();
    }
    await page.getByText("CELAH YANG KAMU TEMUKAN").waitFor();

    // 429 pada reflect
    await toQ3(page);
    await page.route("**/api/v1/lite/reflect", (r) =>
      r.fulfill({ status: 429, headers: { ...ORIGIN_HDR, "Retry-After": "20" }, body: JSON.stringify({ error: { code: "RATE_LIMITED", message: "x", retry_after: 20 } }) })
    );
    await click(page, "Lihat hasil →");
    await page.getByText("00:20").waitFor();
    await page.waitForTimeout(2100);
    const t = await page.getByRole("timer").textContent();
    assert.ok(t === "00:18" || t === "00:17", "hitung mundur: " + t);
    ok(`429 → S-20 dengan hitung mundur (${t})`);
    await shot(page, "e2e-s20", false);
    await click(page, "OK");
    await page.getByText("LITE · 3/3").waitFor();
    ok("OK menutup S-20 dan kembali ke Q3");
    await page.unroute("**/api/v1/lite/reflect");

    // Lambat (>3 dtk) lalu sukses
    await page.route("**/api/v1/lite/reflect", async (r) => { await new Promise((res) => setTimeout(res, 4000)); await r.continue(); });
    await click(page, "Lihat hasil →");
    await shot(page, "e2e-s07-default", false);
    await page.getByText("Agak lama? Kami siapkan mode terbatas.").waitFor({ timeout: 3800 });
    ok("chip 'Agak lama?' muncul setelah 3 detik");
    await shot(page, "e2e-s07-slow", false);
    await page.getByText("CELAH YANG KAMU TEMUKAN").waitFor({ timeout: 8000 });
    ok("respons lambat tetap ditunggu sampai selesai");
    await page.unroute("**/api/v1/lite/reflect");

    // Timeout 10 dtk → S-07 Error, Coba lagi berfungsi
    await toQ3(page);
    await page.route("**/api/v1/lite/reflect", async (r) => { await new Promise((res) => setTimeout(res, 15000)); await r.continue().catch(() => {}); });
    const t0 = Date.now();
    await click(page, "Lihat hasil →");
    await page.getByText("Koneksi ke server terputus.").waitFor({ timeout: 12000 });
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    ok(`timeout → S-07 Error setelah ${secs} dtk`);
    assert.ok(await page.getByRole("button", { name: "Lanjut mode terbatas" }).isDisabled());
    ok("'Lanjut mode terbatas' tampil tapi nonaktif");
    await shot(page, "e2e-s07-error", false);
    await page.unroute("**/api/v1/lite/reflect");
    await click(page, "Coba lagi");
    await page.getByText("CELAH YANG KAMU TEMUKAN").waitFor({ timeout: 8000 });
    ok("'Coba lagi' mengirim ulang dan berhasil");
    await ctx.close();
  }

  // ---------- 3. Server tidak terjangkau di S-03 → S-19 ----------
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
    await page.locator("textarea").fill("Halo kak ada lowongan admin gaji harian tinggi, daftar sekarang ya");
    await page.route("**/api/v1/lite/analyze", (r) => r.abort("connectionrefused"));
    await click(page, "Lanjut →");
    await page.getByRole("dialog").waitFor();
    await page.waitForTimeout(400);
    ok("server tak terjangkau di S-03 → sheet S-19");
    await shot(page, "e2e-s19", false);
    await page.unroute("**/api/v1/lite/analyze");
    await page.getByRole("dialog").getByRole("button", { name: "Coba lagi" }).click();
    await page.getByText("MODE PELAKU").waitFor();
    ok("'Coba lagi' di S-19 melanjutkan ke Q1");
    await ctx.close();
  }

  await browser.close();
  console.log(`E2E: ${pass} lolos`);
})().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); });
