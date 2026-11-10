// Screenshot alur Soul untuk video. API Soul di-mock dari fixture Go (testdata/fixtures/soul-v1.json)
// dan internal/data/v1/characters.json — jalur "teguh: kerja" (B, C, A). Data fiktif.
const { chromium, BASE } = require("../e2e/_setup.cjs");
const fs = require("node:fs"); const path = require("node:path"); const { isDeepStrictEqual } = require("node:util");
const OUT = path.join(__dirname, "video", "media");
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, "../testdata/fixtures/soul-v1.json"), "utf8"));
const chars = fs.readFileSync(path.join(__dirname, "../internal/data/v1/characters.json"), "utf8");
const H = { "Access-Control-Allow-Origin": BASE, "Content-Type": "application/json" };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const shot = async (n, full = true) => {
    if (full) await page.addStyleTag({ content: "[class*='sticky'],[class*='fixed']{position:static !important}" });
    await page.screenshot({ path: `${OUT}/${n}.png`, fullPage: full });
  };
  await page.route("**/api/v1/soul/**", async (r) => {
    const req = r.request(); const url = new URL(req.url());
    if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: { ...H, "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" } });
    if (url.pathname.endsWith("/characters")) return r.fulfill({ status: 200, headers: H, body: chars });
    const body = JSON.parse(req.postData() || "{}");
    const hit = fx.find((f) => f.endpoint.endsWith(url.pathname.replace("/api/v1", "/api/v1")) && isDeepStrictEqual(f.request, body));
    if (!hit) return r.abort("failed");
    return r.fulfill({ status: hit.status, headers: H, body: JSON.stringify(hit.response) });
  });
  await page.goto(`${BASE}/soul`, { waitUntil: "networkidle" }); await page.evaluate(() => document.fonts.ready);
  await page.getByRole("radio").first().click(); await shot("07a-soul-karakter", false);
  await page.getByRole("button", { name: /Mulai Misi 1/ }).click();
  const picks = [1, 2, 0];
  for (let i = 0; i < 3; i++) {
    await page.getByText(`SOUL · MISI ${i + 1}/3`).waitFor();
    await page.getByRole("radio").nth(picks[i]).click(); await shot(`07b-soul-misi${i + 1}`);
    await page.getByRole("button", { name: /Pilih/ }).click();
    await page.getByText("SOUL · KONSEKUENSI").waitFor(); await page.waitForTimeout(300); await shot(`07c-soul-konsekuensi${i + 1}`);
    await page.getByRole("button", { name: i < 2 ? /Lanjut ke Misi/ : /Lihat Status Penjagaan/ }).click();
  }
  await page.getByText("Status Penjagaan").first().waitFor(); await page.waitForTimeout(300); await shot("07d-soul-ringkasan");
  await browser.close(); console.log("selesai");
})().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); });
