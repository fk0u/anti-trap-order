// Uji PR 0 (perbaikan error) dengan backend Go asli + route Playwright untuk memicu error.
const { chromium, BASE, OUT: out } = require("./_setup.cjs");
const assert = require("node:assert/strict");
const HDR = { "Access-Control-Allow-Origin": BASE, "Access-Control-Expose-Headers": "Retry-After", "Content-Type": "application/json" };

let pass = 0;
const ok = (m) => { pass++; console.log("  ✓", m); };
const shot = (page, name, full = false) => page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
const click = (page, text) => page.getByRole("button", { name: text, exact: true }).click();
const TEXT = "Halo kak ada lowongan admin gaji harian tinggi, daftar sekarang ya";

async function newPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  return { ctx, page: await ctx.newPage() };
}
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

  // ---------- S-17 ----------
  {
    const { ctx, page } = await newPage(browser);
    const res = await page.goto(`${BASE}/halaman-tidak-ada`, { waitUntil: "networkidle" });
    assert.equal(res.status(), 404);
    await page.getByText("Halaman ini hilang — tapi kamu tetap di jalur penjaga.").waitFor();
    assert.ok(await page.getByText("404", { exact: true }).isVisible());
    assert.equal(await page.locator("nav.fixed").count(), 0, "tab bar tidak boleh tampil di 404");
    ok("S-17: 404 + teks Figma, tanpa tab bar");
    await page.evaluate(() => document.fonts.ready);
    await shot(page, "pr0-s17");
    await page.getByRole("link", { name: "Kembali ke Awal" }).click();
    await page.waitForURL(`${BASE}/`);
    ok("S-17 'Kembali ke Awal' → /");
    await ctx.close();
  }

  // ---------- Tab bar: daftar izin ----------
  {
    const { ctx, page } = await newPage(browser);
    for (const [path, want] of [["/drill", 1], ["/docs", 1], ["/tentang", 0], ["/privasi", 0], ["/soul", 0], ["/lite", 0], ["/", 0]]) {
      // "load", bukan "networkidle": halaman lama /docs terus memanggil /api/health (klien lama).
      await page.goto(`${BASE}${path}`, { waitUntil: "load" });
      await page.waitForTimeout(300);
      assert.equal(await page.locator("nav.fixed").count(), want, `tab bar di ${path}`);
    }
    ok("tab bar hanya di route lama (/drill, /docs tampil; /tentang, /privasi, /soul, /lite, / tidak)");
    await ctx.close();
  }

  // ---------- 500 di analyze → S-18 overlay → Coba Lagi ----------
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
    await page.locator("textarea").fill(TEXT);
    await page.route("**/api/v1/lite/analyze", (r) =>
      r.fulfill({ status: 500, headers: HDR, body: JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "x" } }) })
    );
    await click(page, "Lanjut →");
    await page.getByText("Ada yang macet di sisi kami. Coba lagi sebentar.").waitFor();
    assert.equal(await page.getByText("Koneksi ke server terputus.").count(), 0, "500 tidak boleh tampil sebagai 'Koneksi terputus'");
    ok("500 di analyze → S-18 (bukan S-19)");
    await page.evaluate(() => document.fonts.ready);
    await shot(page, "pr0-s18-lite");
    assert.ok(await page.getByRole("alertdialog").getByRole("link", { name: "Beranda" }).isVisible());
    await page.unroute("**/api/v1/lite/analyze");
    await click(page, "Coba Lagi");
    await page.getByText("MODE PELAKU").waitFor();
    ok("S-18 'Coba Lagi' mengulang request dan lanjut ke Q1");
    await ctx.close();
  }

  // ---------- Data rusak / ID tak dikenal → S-18 ----------
  {
    const { ctx, page } = await newPage(browser);
    await page.route("**/api/v1/lite/categories", (r) => r.fulfill({ status: 200, headers: HDR, body: '{"bukan":"array"}' }));
    await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
    await page.getByText("Ada yang macet di sisi kami.").waitFor();
    ok("bentuk JSON salah di categories → S-18, tidak crash");
    await page.unroute("**/api/v1/lite/categories");
    await click(page, "Coba Lagi");
    await page.getByRole("button", { name: /Giveaway/ }).waitFor();
    ok("Coba Lagi → kategori dimuat");
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser);
    await page.route("**/api/v1/lite/categories", (r) => r.fulfill({ status: 200, headers: HDR, body: "{rusak" }));
    await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
    await page.getByText("Ada yang macet di sisi kami.").waitFor();
    ok("JSON rusak → S-18");
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser);
    await toQ3(page);
    await page.route("**/api/v1/lite/reflect", async (r) => {
      const res = await r.fetch();
      const j = await res.json();
      (j.found[0] ?? j.missed_candidates[0]).tactic.id = "taktik_baru";
      await r.fulfill({ response: res, body: JSON.stringify(j) });
    });
    await click(page, "Lihat hasil →");
    await page.getByText("Ada yang macet di sisi kami.").waitFor();
    ok("ID taktik tak dikenal di reflect → S-18 (data tidak ditemukan)");
    await page.unroute("**/api/v1/lite/reflect");
    await click(page, "Coba Lagi");
    await page.getByText("LITE · HASIL").waitFor();
    ok("S-18 'Coba Lagi' mengirim ulang reflect");
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser);
    await toQ3(page);
    await page.route("**/api/v1/lite/reflect", (r) =>
      r.fulfill({ status: 502, headers: HDR, body: "<html>Bad Gateway</html>" })
    );
    await click(page, "Lihat hasil →");
    await page.getByText("Ada yang macet di sisi kami.").waitFor();
    ok("502 (body HTML) saat reflect → S-18 di atas S-07");
    await ctx.close();
  }

  // ---------- 429 di categories → S-20 → OK → muat ulang ----------
  {
    const { ctx, page } = await newPage(browser);
    await page.route("**/api/v1/lite/categories", (r) =>
      r.fulfill({ status: 429, headers: { ...HDR, "Retry-After": "5" }, body: JSON.stringify({ error: { code: "RATE_LIMITED", message: "x", retry_after: 5 } }) })
    );
    await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
    await page.getByText("00:05").waitFor();
    await page.unroute("**/api/v1/lite/categories");
    await click(page, "OK");
    await page.getByRole("button", { name: /Giveaway/ }).waitFor();
    ok("429 di categories → S-20 → OK memuat ulang kategori");
    await ctx.close();
  }

  // ---------- S-19: area gelap tidak menutup; Esc menutup; tetap ada Coba lagi ----------
  {
    const { ctx, page } = await newPage(browser);
    await page.route("**/api/v1/lite/categories", (r) => r.abort("connectionrefused"));
    await page.goto(`${BASE}/lite`);
    await page.getByRole("dialog").waitFor();
    await page.waitForTimeout(400);
    await page.mouse.click(195, 60); // area gelap di atas sheet
    await page.waitForTimeout(400);
    assert.equal(await page.getByRole("dialog").count(), 1, "sheet tertutup oleh scrim");
    ok("S-19: ketuk area gelap tidak menutup sheet");
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached" });
    ok("S-19: Esc menutup sheet");
    await page.unroute("**/api/v1/lite/categories");
    const retry = page.getByRole("button", { name: "Coba lagi", exact: true });
    await retry.waitFor();
    await page.evaluate(() => document.fonts.ready);
    await shot(page, "pr0-s03-retry-categories");
    await retry.click();
    await page.getByRole("button", { name: /Giveaway/ }).waitFor();
    assert.equal(await retry.count(), 0);
    ok("setelah Esc: 'Coba lagi' di S-03 memuat ulang kategori");
    await ctx.close();
  }

  // ---------- S-03 Lanjut: spinner + chip "Agak lama?" ----------
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
    await page.locator("textarea").fill(TEXT);
    await page.route("**/api/v1/lite/analyze", async (r) => { await new Promise((s) => setTimeout(s, 4500)); await r.continue(); });
    const t0 = Date.now();
    await click(page, "Lanjut →");
    const btn = page.getByRole("button", { name: "Lanjut →" });
    assert.equal(await btn.getAttribute("aria-busy"), "true");
    assert.equal(await btn.locator("svg.lucide-loader-circle").count(), 1);
    ok("S-03 Lanjut menampilkan spinner + aria-busy");
    await page.waitForTimeout(500);
    await shot(page, "pr0-s03-busy");
    const chip = page.getByText("Agak lama? Kami siapkan mode terbatas.");
    assert.equal(await chip.count(), 0, "chip muncul terlalu cepat");
    await chip.waitFor({ timeout: 4000 });
    const at = ((Date.now() - t0) / 1000).toFixed(1);
    ok(`chip 'Agak lama?' di S-03 muncul pada ±${at} dtk`);
    await shot(page, "pr0-s03-slow");
    await btn.click({ force: true }); // klik ganda saat loading diabaikan
    await page.getByText("MODE PELAKU").waitFor({ timeout: 8000 });
    ok("respons lambat tetap ditunggu → Q1");
    await ctx.close();
  }

  // ---------- Back browser per langkah (pushState) & refresh ----------
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /Lite/ }).first().click(); // masuk lewat landing (navigasi Next)
    await page.waitForURL(`${BASE}/lite`);
    await page.getByRole("button", { name: /Giveaway/ }).click();
    await click(page, "Lanjut →");
    for (let i = 0; i < 3; i++) {
      await page.getByText(`LITE · ${i + 1}/3`).waitFor();
      await page.getByRole("checkbox").nth(0).click();
      if (i < 2) await click(page, "Lanjut →");
    }
    for (const want of ["LITE · 2/3", "LITE · 1/3", "LITE · 0/3"]) {
      await page.goBack();
      await page.getByText(want).waitFor();
    }
    assert.equal(await page.locator('[role=checkbox][aria-checked="true"]').count(), 0);
    ok("Q3 → Back → Q2 → Back → Q1 → Back → S-03");
    await page.goBack();
    await page.waitForURL(`${BASE}/`);
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    ok("Back dari S-03 → keluar dari /lite (landing)");

    // Refresh di Q2 → S-03 → Back langsung keluar
    await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Giveaway/ }).click();
    await click(page, "Lanjut →");
    await page.getByText("LITE · 1/3").waitFor();
    await page.getByRole("checkbox").nth(0).click();
    await click(page, "Lanjut →");
    await page.getByText("LITE · 2/3").waitFor();
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("LITE · 0/3").waitFor();
    ok("refresh di Q2 → S-03");
    await page.goBack();
    await page.waitForURL(`${BASE}/`);
    await page.waitForTimeout(600);
    assert.equal(page.url(), `${BASE}/`, "masih di: " + page.url());
    assert.equal(await page.getByText("LITE · 1/3").count(), 0);
    ok("Back setelah refresh → langsung keluar dari /lite (entri lama dilompati)");
    await ctx.close();
  }

  // ---------- Gagal menyalin ----------
  {
    const { ctx, page } = await newPage(browser);
    await toQ3(page);
    await click(page, "Lihat hasil →");
    await page.getByText("LITE · HASIL").waitFor();
    await click(page, "Lihat Action Card →");
    await page.getByText("LITE · AKSI").waitFor();
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("x")) } });
      document.execCommand = () => false;
    });
    await click(page, "Salin kalimat");
    await page.getByRole("button", { name: "Gagal menyalin" }).waitFor();
    ok("salin gagal → 'Gagal menyalin'");
    await shot(page, "pr0-s09-copy-failed", true);
    await page.waitForTimeout(2200);
    await page.getByRole("button", { name: "Salin kalimat" }).waitFor({ timeout: 500 });
    ok("label kembali ke 'Salin kalimat' setelah 2 dtk");
    await ctx.close();
  }

  await browser.close();
  console.log(`PR0: ${pass} lolos`);
})().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); });
