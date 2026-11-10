// Uji E2E S-15 /tentang dan S-16 /privasi: render, tautan dari landing, menu, tanpa tab bar.
const { chromium, BASE, OUT: out } = require("./_setup.cjs");
const assert = require("node:assert/strict");

let pass = 0;
const ok = (m) => { pass++; console.log("  ✓", m); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  // Footer landing → /privasi (sebelumnya 404).
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Batasan & Privasi" }).click();
  await page.waitForURL(`${BASE}/privasi`);
  await page.getByRole("heading", { level: 1, name: "Batasan & Privasi" }).waitFor();
  assert.equal(await page.locator("nav.fixed").count(), 0, "tab bar tidak boleh tampil");
  for (const t of ["Tanpa login", "Tidak menyimpan tulisanmu", "Tidak ada data ke pihak ketiga", "Bukan deteksi pasti", "Menunggu verifikasi"]) {
    assert.ok(await page.getByText(t, { exact: true }).isVisible(), t);
  }
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}/info-privasi.png`, fullPage: true });
  ok("landing → 'Batasan & Privasi' → S-16 tampil (4 poin, kontak placeholder), tanpa tab bar");

  // Menu header membuka sheet Pilih Mode, link Tentang.
  await page.getByRole("button", { name: /menu/i }).click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("link", { name: "Pelajari konsepnya di Tentang" }).click();
  await page.waitForURL(`${BASE}/tentang`);
  await page.getByRole("heading", { level: 1, name: "Tentang ATO" }).waitFor();
  assert.equal(await page.locator("nav.fixed").count(), 0, "tab bar tidak boleh tampil");
  assert.equal(await page.locator('img[src*="/icons/ato/tentang/avatar-"]').count(), 4);
  for (const img of await page.locator('img[src*="/icons/ato/tentang/avatar-"]').all()) {
    assert.ok(await img.evaluate((el) => el.complete && el.naturalWidth > 0), "avatar gagal dimuat");
  }
  assert.equal(await page.getByRole("link", { name: "Lihat di GitHub" }).count(), 0, "tombol GitHub disembunyikan (repo privat)");
  await page.screenshot({ path: `${out}/info-tentang.png`, fullPage: true });
  ok("menu → 'Pelajari konsepnya di Tentang' → S-15 tampil (4 avatar tim), tanpa tab bar");

  await browser.close();
  console.log(`INFO: ${pass} lolos`);
})().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); });
