// Uji E2E /soul (S-10 → S-14) dengan backend Go asli: alur, aturan nama, privasi request, riwayat, error.
const { chromium, BASE, OUT: out } = require("./_setup.cjs");
const assert = require("node:assert/strict");
const HDR = { "Access-Control-Allow-Origin": BASE, "Access-Control-Expose-Headers": "Retry-After", "Content-Type": "application/json" };

let pass = 0;
const ok = (m) => { pass++; console.log("  ✓", m); };
const shot = (page, name, full = true) => page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
const click = (page, name) => page.getByRole("button", { name, exact: true }).click();

async function newPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const bodies = [];
  page.on("request", (r) => { if (r.url().includes("/api/v1/soul/") && r.method() === "POST") bodies.push({ url: r.url(), body: r.postData() }); });
  return { ctx, page, bodies };
}

/** Dari /soul baru: pilih template pertama → Mulai → berhenti di Misi 1. */
async function toMission1(page) {
  await page.goto(`${BASE}/soul`, { waitUntil: "networkidle" });
  await page.getByRole("radio").first().click();
  await click(page, "Mulai Misi 1");
  await page.getByText("Misi 1 dari 3", { exact: true }).waitFor();
}

/** Di Misi n: pilih opsi ke-`k` lalu "Pilih →", tunggu S-13. */
async function answer(page, n, k = 1) {
  await page.getByText(`Misi ${n} dari 3`, { exact: true }).waitFor();
  await page.getByRole("radio").nth(k).click();
  await click(page, "Pilih →");
  await page.getByText(`MISI ${n} DARI 3`, { exact: true }).waitFor();
}

(async () => {
  const browser = await chromium.launch();

  // ---------- 1. Karakter buatan sendiri: aturan nama + privasi + alur penuh ----------
  {
    const { ctx, page, bodies } = await newPage(browser);
    await page.goto(`${BASE}/soul`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator("nav.fixed").count(), 0, "tab bar tidak boleh tampil di /soul");
    const cards = page.getByRole("radio");
    assert.ok((await cards.count()) >= 1, "template karakter harus dimuat");
    ok(`S-10: ${await cards.count()} template dari GET /soul/characters, tanpa tab bar`);
    const start = page.getByRole("button", { name: "Mulai Misi 1" });
    assert.ok(await start.isDisabled(), "Mulai harus nonaktif sebelum memilih");

    const nick = page.getByLabel("Nama panggilan");
    const err = page.getByText("Pakai nama panggilan saja ya, tanpa nomor atau email.");
    for (const bad of ["Nadia 08123", "Nadia17", "nadia@mail.com", "www.nadia.id"]) {
      await nick.fill(bad);
      await err.waitFor();
      assert.ok(await start.isDisabled(), `Mulai harus nonaktif untuk "${bad}"`);
    }
    await shot(page, "soul-s10-error");
    ok("nama berisi angka/email/URL ditolak dengan pesan 06, Mulai nonaktif");
    await nick.fill("  Kak  Rani  ");
    assert.equal(await err.count(), 0);
    assert.ok(await start.isEnabled());
    assert.equal(await nick.getAttribute("maxlength"), "20");
    ok("nama valid → Mulai aktif; maks. 20 karakter");

    await start.click();
    await page.getByText("Misi 1 dari 3", { exact: true }).waitFor();
    const story = await page.locator("section", { hasText: "CERITA" }).innerText();
    assert.ok(story.includes("Kak Rani"), "nama panggilan harus mengisi {{nama}}: " + story);
    assert.ok(!/\{\{(nama|relasi)\}\}/.test(story), "placeholder tersisa: " + story);
    ok("cerita diisi nama panggilan di browser (fillStory)");
    await shot(page, "soul-s11-none");

    assert.ok(await page.getByRole("button", { name: "Pilih →" }).isDisabled());
    await page.getByRole("radio").nth(1).click();
    await page.route("**/api/v1/soul/step", async (r) => { await new Promise((s) => setTimeout(s, 1200)); await r.continue(); });
    await click(page, "Pilih →");
    await page.waitForTimeout(250);
    assert.equal(await page.getByRole("button", { name: "Pilih →" }).getAttribute("aria-busy"), "true");
    assert.equal(await page.locator('[role=radio][aria-disabled="true"]').count(), 3, "semua pilihan terkunci saat mengirim");
    await shot(page, "soul-s12-locked");
    ok("saat mengirim: pilihan terkunci (lain redup), tombol loading");
    await page.getByText("MISI 1 DARI 3", { exact: true }).waitFor();
    await page.unroute("**/api/v1/soul/step");
    assert.ok(await page.getByText("Keputusanmu: B").isVisible());
    await shot(page, "soul-s13");
    ok("S-13: 'Keputusanmu: B' + konsekuensi dari POST /soul/step");

    await click(page, "Lanjut ke Misi 2 →");
    await answer(page, 2, 2);
    await click(page, "Lanjut ke Misi 3 →");
    await answer(page, 3, 0);
    await click(page, "Lihat Status Penjagaan →");
    await page.getByText("Status Penjagaan", { exact: true }).waitFor();
    assert.ok(await page.getByText("Ini alat bantu berpikir, bukan deteksi pasti.").isVisible());
    assert.equal(await page.getByRole("link", { name: "Jalankan Lite untuk situasi serupa →" }).getAttribute("href"), "/lite");
    const body = await page.locator("body").innerText();
    assert.ok(!/%|skor|tingkat bahaya/i.test(body), "tidak boleh ada skor/persen");
    await shot(page, "soul-s14");
    ok("S-14: peringkat, disclaimer, link Lite → /lite, tanpa skor/persen");

    // Privasi: nama tidak pernah dikirim; body hanya field kontrak.
    assert.equal(bodies.length, 4, "1 start + 3 step");
    for (const b of bodies) assert.ok(!/Rani/i.test(b.body), "nama bocor: " + b.body);
    assert.deepEqual(Object.keys(JSON.parse(bodies[0].body)), ["arc_id"]);
    for (const b of bodies.slice(1)) assert.deepEqual(Object.keys(JSON.parse(b.body)).sort(), ["arc_id", "choice_id", "meters", "mission_id"]);
    ok(`request hanya ID + meter, nama tidak terkirim (${bodies[1].body})`);

    // Back browser: S-14 → S-13 → S-11 Misi 3 (hanya baca).
    await page.goBack();
    await page.getByText("MISI 3 DARI 3", { exact: true }).waitFor();
    await page.goBack();
    await page.getByText("Misi 3 dari 3", { exact: true }).waitFor();
    assert.equal(await page.locator('[role=radio][aria-checked="true"]').count(), 1);
    assert.equal(await page.locator('[role=radio][aria-disabled="true"]').count(), 3, "misi terjawab harus hanya-baca");
    await page.getByRole("radio").nth(1).click({ force: true });
    assert.equal(await page.getByRole("radio").nth(0).getAttribute("aria-checked"), "true", "pilihan tidak boleh berubah");
    ok("Back → S-13 → S-11 Misi 3 hanya-baca (pilihan tetap, tidak bisa diganti)");
    await click(page, "Pilih →");
    await page.getByText("MISI 3 DARI 3", { exact: true }).waitFor();
    assert.equal(bodies.length, 4, "misi terjawab tidak boleh dikirim ulang");
    ok("'Pilih →' di misi terjawab membuka akibatnya lagi tanpa request baru");

    // "Ulangi dengan karakter lain" → S-10.
    await click(page, "Lihat Status Penjagaan →");
    await click(page, "Ulangi dengan karakter lain");
    await page.getByText("Siapa yang ingin kamu jaga?").waitFor();
    assert.equal(await page.locator('[role=radio][aria-checked="true"]').count(), 0);
    ok("'Ulangi dengan karakter lain' → S-10 tanpa pilihan");
    await ctx.close();
  }

  // ---------- 2. Ganti karakter (konfirmasi) + riwayat + refresh ----------
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await toMission1(page);
    await answer(page, 1);
    await click(page, "Lanjut ke Misi 2 →");
    await page.getByText("Misi 2 dari 3", { exact: true }).waitFor();
    for (const want of ["MISI 1 DARI 3", "Misi 1 dari 3", "Siapa yang ingin kamu jaga?"]) {
      await page.goBack();
      await page.getByText(want, { exact: true }).waitFor();
    }
    await page.goBack();
    await page.waitForURL(`${BASE}/`);
    ok("Back per langkah: S-11 M2 → S-13 → S-11 M1 → S-10 → keluar dari /soul");

    await toMission1(page);
    await page.getByRole("button", { name: "Karakter" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByText("Ganti karakter? Progres misi akan hilang.").waitFor();
    await page.waitForTimeout(350);
    await shot(page, "soul-confirm", false);
    await dialog.getByRole("button", { name: "Lanjut misi" }).click();
    await dialog.waitFor({ state: "detached" });
    assert.ok(await page.getByText("Misi 1 dari 3", { exact: true }).isVisible());
    await page.getByRole("button", { name: "Karakter" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Ganti", exact: true }).click();
    await page.getByText("Siapa yang ingin kamu jaga?").waitFor();
    ok("'Karakter' → konfirmasi: 'Lanjut misi' tetap di misi, 'Ganti' ke S-10");

    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await toMission1(page);
    await answer(page, 1);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("Siapa yang ingin kamu jaga?").waitFor();
    await page.goBack();
    await page.waitForURL(`${BASE}/`);
    await page.waitForTimeout(500);
    assert.equal(page.url(), `${BASE}/`);
    ok("refresh di S-13 → S-10; Back langsung keluar dari /soul");
    await ctx.close();
  }

  // ---------- 3. Error ----------
  {
    const { ctx, page } = await newPage(browser);
    await toMission1(page);
    await page.route("**/api/v1/soul/step", (r) =>
      r.fulfill({ status: 500, headers: HDR, body: JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "x" } }) })
    );
    await page.getByRole("radio").nth(0).click();
    await click(page, "Pilih →");
    await page.getByText("Ada yang macet di sisi kami. Coba lagi sebentar.").waitFor();
    ok("500 di /soul/step → S-18");
    await page.unroute("**/api/v1/soul/step");
    await click(page, "Coba Lagi");
    await page.getByText("MISI 1 DARI 3", { exact: true }).waitFor();
    ok("S-18 'Coba Lagi' mengirim ulang pilihan");
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser);
    await page.route("**/api/v1/soul/characters", (r) => r.abort("connectionrefused"));
    await page.goto(`${BASE}/soul`);
    await page.getByRole("dialog").waitFor();
    await page.waitForTimeout(400);
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached" });
    await page.unroute("**/api/v1/soul/characters");
    await click(page, "Coba lagi");
    await page.getByRole("radio").first().waitFor();
    ok("server tak terjangkau → S-19; setelah Esc, 'Coba lagi' memuat ulang karakter");
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(`${BASE}/soul`, { waitUntil: "networkidle" });
    await page.route("**/api/v1/soul/start", (r) =>
      r.fulfill({ status: 429, headers: { ...HDR, "Retry-After": "7" }, body: JSON.stringify({ error: { code: "RATE_LIMITED", message: "x", retry_after: 7 } }) })
    );
    await page.getByRole("radio").first().click();
    await click(page, "Mulai Misi 1");
    await page.getByText("00:07").waitFor();
    await page.unroute("**/api/v1/soul/start");
    await click(page, "OK");
    await click(page, "Mulai Misi 1");
    await page.getByText("Misi 1 dari 3", { exact: true }).waitFor();
    ok("429 di /soul/start → S-20; setelah OK bisa mulai lagi");
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser);
    await page.route("**/api/v1/soul/characters", (r) =>
      r.fulfill({ status: 200, headers: HDR, body: JSON.stringify({ templates: [], relations: "rusak", nickname_max_length: 20 }) })
    );
    await page.goto(`${BASE}/soul`, { waitUntil: "networkidle" });
    await page.getByText("Ada yang macet di sisi kami.").waitFor();
    ok("bentuk respons karakter salah → S-18, tidak crash");
    await ctx.close();
  }

  await browser.close();
  console.log(`SOUL: ${pass} lolos`);
})().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); });
