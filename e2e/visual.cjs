// Regresi visual: potret ±30 state di viewport E2E_VIEWPORT (default 390), atau bandingkan dua folder.
//
//   npx -y -p playwright@1.49.1 node e2e/visual.cjs capture <folder>
//   npx -y -p playwright@1.49.1 node e2e/visual.cjs compare <folder-baseline> <folder-baru>
//
// Pembandingan byte per byte: PNG dari Chromium yang sama identik jika pikselnya identik,
// jadi "sama" = 0 piksel berbeda. Animasi dimatikan (reducedMotion + animations: "disabled").
const fs = require("node:fs");
const path = require("node:path");

const [mode, a, b] = process.argv.slice(2);

if (mode === "compare") {
  const files = fs.readdirSync(a).filter((f) => f.endsWith(".png")).sort();
  let diff = 0;
  for (const f of files) {
    const other = path.join(b, f);
    if (!fs.existsSync(other)) {
      console.log(`  ✗ ${f}: tidak ada di ${b}`);
      diff++;
    } else if (!fs.readFileSync(path.join(a, f)).equals(fs.readFileSync(other))) {
      console.log(`  ✗ ${f}: BERBEDA`);
      diff++;
    }
  }
  console.log(diff === 0 ? `VISUAL: ${files.length} state identik` : `VISUAL: ${diff} dari ${files.length} state berbeda`);
  process.exit(diff === 0 ? 0 : 1);
}

if (mode !== "capture" || !a) {
  console.error("Pakai: visual.cjs capture <folder> | compare <a> <b>");
  process.exit(2);
}

process.argv[2] = a; // OUT untuk _setup
const { chromium, BASE, VIEWPORT } = require("./_setup.cjs");
const out = a;
fs.mkdirSync(out, { recursive: true });
const HDR = { "Access-Control-Allow-Origin": BASE, "Access-Control-Expose-Headers": "Retry-After", "Content-Type": "application/json" };
const TEXT = "Dicari admin input data, Rp500rb/hari. Hubungi 081234567123 atau budi@mail.com, bayar seragam Rp150rb.";

const click = (page, name) => page.getByRole("button", { name, exact: true }).click();

(async () => {
  const browser = await chromium.launch();
  let n = 0;
  const fresh = async () => {
    const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, reducedMotion: "reduce" });
    return ctx.newPage();
  };
  const shot = async (page, name) => {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(450); // transisi sheet 300 ms + gambar
    await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true, animations: "disabled", caret: "hide" });
    n++;
  };

  // ---------- Landing, 404, info ----------
  let page = await fresh();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await shot(page, "01-landing");
  const menu = page.getByRole("button", { name: "Menu" });
  if (await menu.isVisible()) {
    await menu.click();
    await page.getByRole("dialog").waitFor();
    await shot(page, "02-mode-sheet");
  }
  await page.goto(`${BASE}/tentang`, { waitUntil: "networkidle" });
  await shot(page, "03-tentang");
  await page.goto(`${BASE}/privasi`, { waitUntil: "networkidle" });
  await shot(page, "04-privasi");
  await page.goto(`${BASE}/halaman-tidak-ada`, { waitUntil: "networkidle" });
  await shot(page, "05-s17");
  await page.context().close();

  // ---------- Lite ----------
  page = await fresh();
  await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
  await shot(page, "10-s03-empty");
  await page.locator("textarea").fill(TEXT);
  await shot(page, "11-s03-masked");
  await click(page, "Lanjut →");
  await page.getByText("LITE · 1/3").waitFor();
  await shot(page, "12-s04-none");
  const opts = page.getByRole("checkbox");
  await opts.nth(0).click();
  await opts.nth(3).click();
  await shot(page, "13-s04-two");
  await page.getByRole("button", { name: /Lainnya/ }).click();
  await page.getByRole("textbox").fill("Contoh singkat");
  await shot(page, "14-s04-other");
  await click(page, "Lanjut →");
  await page.getByText("LITE · 2/3").waitFor();
  await page.getByRole("checkbox").nth(0).click();
  await shot(page, "15-s05");
  await click(page, "Lanjut →");
  await page.getByText("LITE · 3/3").waitFor();
  await page.getByRole("checkbox").nth(1).click();
  await shot(page, "16-s06");
  await page.route("**/api/v1/lite/reflect", async (r) => { await new Promise((s) => setTimeout(s, 3600)); await r.continue(); });
  await click(page, "Lihat hasil →");
  await page.getByText("Menyusun celah").waitFor();
  await shot(page, "17-s07-waiting");
  await page.getByText("Agak lama?").waitFor();
  await shot(page, "18-s07-slow");
  await page.getByText("CELAH YANG KAMU TEMUKAN").waitFor({ timeout: 10000 });
  await page.unroute("**/api/v1/lite/reflect");
  await shot(page, "19-s08");
  await click(page, "Lihat Action Card →");
  await page.getByRole("heading", { name: "Bawa ini bersamamu" }).waitFor();
  await shot(page, "20-s09");
  await page.goBack();
  await page.goBack();
  await page.getByText("LITE · 3/3").waitFor();
  await page.route("**/api/v1/lite/reflect", (r) => r.abort("connectionrefused"));
  await click(page, "Lihat hasil →");
  await page.getByText("Koneksi ke server terputus.").waitFor({ timeout: 8000 });
  await shot(page, "21-s07-error");
  await page.context().close();

  page = await fresh();
  await page.route("**/api/v1/lite/categories", (r) => r.abort("connectionrefused"));
  await page.goto(`${BASE}/lite`);
  await page.getByRole("dialog").waitFor();
  await shot(page, "22-s19");
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await shot(page, "23-s03-retry");
  await page.context().close();

  page = await fresh();
  await page.route("**/api/v1/lite/categories", (r) =>
    r.fulfill({ status: 429, headers: { ...HDR, "Retry-After": "20" }, body: JSON.stringify({ error: { code: "RATE_LIMITED", message: "x", retry_after: 20 } }) })
  );
  await page.goto(`${BASE}/lite`);
  await page.getByText("00:20").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, "24-s20.png"), fullPage: true, animations: "disabled", caret: "hide" });
  n++;
  await page.context().close();

  page = await fresh();
  await page.route("**/api/v1/lite/categories", (r) =>
    r.fulfill({ status: 500, headers: HDR, body: JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "x" } }) })
  );
  await page.goto(`${BASE}/lite`);
  await page.getByText("Ada yang macet di sisi kami.").waitFor();
  await shot(page, "25-s18");
  await page.context().close();

  // ---------- Soul ----------
  page = await fresh();
  await page.goto(`${BASE}/soul`, { waitUntil: "networkidle" });
  await shot(page, "30-s10");
  await page.getByRole("radio").first().click();
  await shot(page, "31-s10-selected");
  await page.getByLabel("Nama panggilan").fill("Nadia 08123");
  await shot(page, "32-s10-error");
  await page.getByRole("radio").first().click();
  await click(page, "Mulai Misi 1");
  await page.getByText("Misi 1 dari 3", { exact: true }).waitFor();
  await shot(page, "33-s11-none");
  await page.getByRole("radio").nth(1).click();
  await shot(page, "34-s11-selected");
  await page.route("**/api/v1/soul/step", async (r) => { await new Promise((s) => setTimeout(s, 1500)); await r.continue(); });
  await click(page, "Pilih →");
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(out, "35-s12-locked.png"), fullPage: true, animations: "disabled", caret: "hide" });
  n++;
  await page.getByText("MISI 1 DARI 3", { exact: true }).waitFor();
  await page.unroute("**/api/v1/soul/step");
  await shot(page, "36-s13");
  for (const [m, k] of [[2, 0], [3, 2]]) {
    await click(page, `Lanjut ke Misi ${m} →`);
    await page.getByText(`Misi ${m} dari 3`, { exact: true }).waitFor();
    await page.getByRole("radio").nth(k).click();
    await click(page, "Pilih →");
    await page.getByText(`MISI ${m} DARI 3`, { exact: true }).waitFor();
  }
  await shot(page, "37-s13-k3");
  await click(page, "Lihat Status Penjagaan →");
  await page.getByText("Status Penjagaan", { exact: true }).waitFor();
  await shot(page, "38-s14");
  await page.goBack();
  await page.goBack();
  await page.getByText("Misi 3 dari 3", { exact: true }).waitFor();
  await shot(page, "39-s11-answered");
  await page.getByRole("button", { name: "Karakter" }).click();
  await page.getByRole("dialog").waitFor();
  await shot(page, "40-soul-confirm");
  await page.context().close();

  await browser.close();
  console.log(`VISUAL: ${n} state dipotret di ${VIEWPORT.width}×${VIEWPORT.height} → ${out}`);
})().catch((e) => {
  console.error("GAGAL:", e.message);
  process.exit(1);
});
