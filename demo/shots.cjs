// Ambil screenshot layar asli (390x844, DPR 2) untuk video demo. Semua API diputus,
// jadi seluruh alur Lite berjalan lewat mode terbatas (tanpa backend, data fiktif).
const { chromium, BASE } = require("../e2e/_setup.cjs");
const path = require("node:path");
const OUT = path.join(__dirname, "video", "media");
const click = (p, t) => p.getByRole("button", { name: t, exact: true }).click();
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  // Halaman panjang: bar tombol yang menempel dilepas supaya tidak melayang di tengah gambar saat di-pan di video.
  const shot = async (n, full = false) => {
    if (full) await page.addStyleTag({ content: "[class*='sticky'],[class*='fixed']{position:static !important}" });
    await page.screenshot({ path: `${OUT}/${n}.png`, fullPage: full });
  };
  await page.route("**/api/v1/**", (r) => r.abort("connectionrefused"));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" }); await page.evaluate(() => document.fonts.ready);
  await shot("01-landing");
  await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
  await page.getByRole("dialog").waitFor(); await page.waitForTimeout(500);
  await shot("09-offline-sheet");
  await page.getByRole("dialog").getByRole("button", { name: /Lanjut mode terbatas/ }).click();
  await page.getByRole("button", { name: /Tawaran Kerja/ }).waitFor();
  await page.locator("textarea").fill("Halo kak, lowongan admin WFH gaji 300rb/hari. Daftar sekarang, cukup tf biaya seragam 150rb ke 1234567890123 ya!!");
  await page.getByText("1 data disamarkan").waitFor(); await shot("03-situasi");
  await click(page, "Lanjut →"); await page.getByText("MODE PELAKU").waitFor();
  for (let i = 0; i < 3; i++) {
    await page.getByText(`LITE · ${i + 1}/3`).waitFor();
    await page.getByRole("checkbox").nth(0).click(); await page.getByRole("checkbox").nth(2).click();
    await shot(`04-q${i + 1}`);
    await click(page, i < 2 ? "Lanjut →" : "Lihat hasil →");
  }
  await page.getByText(/Kamu menemukan \d+ celah/).waitFor(); await page.waitForTimeout(400); await shot("05-hasil", true);
  await click(page, "Lihat Action Card →"); await page.getByText("Bawa ini bersamamu").waitFor(); await shot("06-action", true);
  await page.goto(`${BASE}/privasi`, { waitUntil: "networkidle" }); await shot("08-privasi", true);
  await browser.close(); console.log("selesai");
})().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); });
