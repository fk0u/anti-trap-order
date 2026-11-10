// Uji E2E mode terbatas: SEMUA request ke API diputus (server mati), lalu Lite dijalankan
// penuh lewat "Lanjut mode terbatas". Tidak butuh backend Go.
const { chromium, BASE, OUT: out, VIEWPORT } = require("./_setup.cjs");
const assert = require("node:assert/strict");

let pass = 0;
const ok = (m) => { pass++; console.log("  ✓", m); };
const click = (page, text) => page.getByRole("button", { name: text, exact: true }).click();

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const apiCalls = [];
  await page.route("**/api/v1/**", (r) => { apiCalls.push(r.request().url()); return r.abort("connectionrefused"); });

  await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
  await page.getByRole("dialog").waitFor();
  await page.waitForTimeout(400);
  ok("server mati → sheet S-19 saat /lite dibuka");
  await page.screenshot({ path: `${out}/offline-s19.png` });

  const limited = page.getByRole("dialog").getByRole("button", { name: /Lanjut mode terbatas/ });
  assert.equal(await limited.isDisabled(), false, "tombol harus aktif");
  await limited.click();
  await page.getByRole("button", { name: /Tawaran Kerja/ }).waitFor();
  ok("'Lanjut mode terbatas' → kategori dimuat dari mesin lokal");

  const before = apiCalls.length;
  const raw = "Halo kak, lowongan admin WFH gaji 300rb/hari. Daftar sekarang, cukup tf biaya seragam 150rb ke 1234567890123 ya!!";
  await page.locator("textarea").fill(raw);
  await page.getByText("1 data disamarkan").waitFor();
  await click(page, "Lanjut →");
  await page.getByText("MODE PELAKU").waitFor();
  ok("analisis teks berjalan lokal → Q1");

  for (let i = 0; i < 3; i++) {
    await page.getByText(`LITE · ${i + 1}/3`).waitFor();
    await page.getByRole("checkbox").nth(0).click();
    await click(page, i < 2 ? "Lanjut →" : "Lihat hasil →");
  }
  await page.getByText(/Kamu menemukan \d+ celah/).waitFor({ timeout: 8000 });
  ok("hasil S-08 tampil dari mesin lokal");
  await page.screenshot({ path: `${out}/offline-s08.png`, fullPage: true });

  await click(page, "Lihat Action Card →");
  await page.getByText("Bawa ini bersamamu").waitFor({ timeout: 5000 });
  ok("Action Card S-09 tampil");

  assert.equal(apiCalls.length, before, "tidak boleh ada request API setelah mode terbatas: " + apiCalls.slice(before).join(", "));
  ok("tidak ada request API setelah mode terbatas (teks tidak keluar dari browser)");

  await browser.close();
  console.log(`E2E offline: ${pass} lolos`);
})().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); });
