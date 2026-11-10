// Verifikasi animasi S-07: titik, tips bergantian, tinggi tetap, reduced motion. + rekaman video.
const { chromium, BASE, OUT: out, VIEWPORT, DESKTOP } = require("./_setup.cjs");
const assert = require("node:assert/strict");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0;
const ok = (m) => { pass++; console.log("  ✓", m); };

async function toLoading(page, delayMs) {
  await page.goto(`${BASE}/lite`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Tawaran Kerja/ }).click();
  await page.getByRole("button", { name: "Lanjut →", exact: true }).click();
  for (let i = 0; i < 2; i++) {
    await page.getByRole("checkbox").nth(0).click();
    await page.getByRole("button", { name: "Lanjut →", exact: true }).click();
    await page.getByText(`LITE · ${i + 2}/3`).waitFor();
  }
  await page.getByRole("checkbox").nth(0).click(); // Q3: pilih saja, klik "Lihat hasil" dilakukan pemanggil
  await page.route("**/lite/reflect", async (r) => { await sleep(delayMs); await r.continue().catch(() => {}); });
}
await0();
async function await0() {}

const probe = (page) => page.evaluate(() => {
  const h1 = document.querySelector("h1");
  const dots = [...h1.querySelectorAll("span[aria-hidden] > span")].map((s) => getComputedStyle(s).opacity);
  const tips = document.querySelector('[aria-live="off"]');
  const active = [...tips.children].find((p) => !p.hasAttribute("aria-hidden"));
  const r = h1.getBoundingClientRect();
  return {
    dots: dots.filter((o) => o === "1").length,
    dotsSpan: dots.length,
    tip: active ? active.textContent : null,
    tipOpacity: active ? getComputedStyle(active).opacity : null,
    tipsH: Math.round(tips.getBoundingClientRect().height),
    h1Left: Math.round(r.left), h1W: Math.round(r.width),
    textW: (() => { const range = document.createRange(); range.selectNodeContents(h1); return Math.round(range.getBoundingClientRect().width); })(),
    dotsAriaHidden: h1.querySelector("span[aria-hidden]") !== null,
  };
});

(async () => {
  const browser = await chromium.launch();

  // ---------- Gerak normal + rekaman ----------
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, recordVideo: { dir: out, size: VIEWPORT } });
    const page = await ctx.newPage();
    await toLoading(page, 9000);
    await page.getByRole("button", { name: "Lihat hasil →", exact: true }).click();
    await page.getByRole("status").waitFor();

    const samples = [];
    const t0 = Date.now();
    while (Date.now() - t0 < 7600) { samples.push({ t: Date.now() - t0, ...(await probe(page)) }); await sleep(100); }
    const shotsAt = [];
    // titik: urutan perubahan
    const seq = []; for (const s of samples) if (seq[seq.length - 1] !== s.dots) seq.push(s.dots);
    log("urutan jumlah titik", seq.slice(0, 12).join(" → "));
    assert.deepEqual(seq.slice(0, 8), seq.slice(0, 8).map((_, i) => (seq[0] + i) % 4), "urutan titik harus 0→1→2→3→0");
    ok("titik bertambah satu per satu lalu ulang dari kosong");
    const changes = []; for (let i = 1; i < samples.length; i++) if (samples[i].dots !== samples[i - 1].dots) changes.push(samples[i].t);
    const gaps = changes.slice(1).map((t, i) => t - changes[i]);
    const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    log("jeda rata-rata antar langkah titik (ms)", avg);
    assert.ok(avg > 330 && avg < 470);
    ok(`tiap langkah ±400 ms (rata-rata ${avg} ms)`);
    assert.ok(samples.every((s) => s.dotsSpan === 3 && s.dotsAriaHidden));
    ok("selalu 3 slot titik, dibungkus aria-hidden");
    const lefts = new Set(samples.map((s) => `${s.h1Left}/${s.textW}`));
    assert.equal(lefts.size, 1, "judul bergeser: " + [...lefts]);
    ok(`judul tidak bergeser (posisi/lebar teks tetap: ${[...lefts][0]})`);

    const tipSeq = []; for (const s of samples) if (s.tip && tipSeq[tipSeq.length - 1] !== s.tip) tipSeq.push(s.tip);
    log("tips yang tampil", tipSeq);
    assert.ok(tipSeq.length >= 3, "tips tidak berganti");
    ok(`tips berganti (${tipSeq.length} tips dalam 7,6 dtk)`);
    const heights = new Set(samples.map((s) => s.tipsH));
    assert.equal(heights.size, 1, "tinggi tips berubah: " + [...heights]);
    ok(`tinggi area tips tetap (${[...heights][0]} px)`);
    const fadeLow = samples.some((s) => Number(s.tipOpacity) < 0.5);
    assert.ok(fadeLow);
    ok("tips memudar saat berganti (opacity turun di tengah transisi)");
    assert.ok(samples.some((s) => s.t > 3000) && (await page.getByText("Agak lama? Kami siapkan mode terbatas.").isVisible()));
    ok("chip 'Agak lama?' tetap muncul (timer 3 dtk tidak berubah)");

    await page.screenshot({ path: `${out}/anim-slow.png` });
    await page.getByText("CELAH YANG KAMU TEMUKAN").waitFor({ timeout: 6000 });
    ok("hasil diterima → S-08 seperti biasa");
    await ctx.close();
    console.log("  video:", await page.video().path());
  }

  // ---------- Screenshot berurutan (3 frame titik + 2 tips) ----------
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await toLoading(page, 9000);
    await page.getByRole("button", { name: "Lihat hasil →", exact: true }).click();
    await page.getByRole("status").waitFor();
    for (const [i, wait] of [[1, 150], [2, 400], [3, 400], [4, 400]].entries ? [[1, 150], [2, 400], [3, 400], [4, 400]] : []) {
      await sleep(wait); await page.screenshot({ path: `${out}/anim-frame-${i}.png`, clip: { x: 0, y: 300, width: 390, height: 260 } });
    }
    await sleep(2000);
    await page.screenshot({ path: `${out}/anim-frame-tip2.png`, clip: { x: 0, y: 300, width: 390, height: 260 } });
    await ctx.close();
  }

  // ---------- Reduced motion ----------
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await toLoading(page, 9000);
    await page.getByRole("button", { name: "Lihat hasil →", exact: true }).click();
    await page.getByRole("status").waitFor();
    const samples = []; const t0 = Date.now();
    while (Date.now() - t0 < 6800) { samples.push(await probe(page)); await sleep(100); }
    assert.ok(samples.every((s) => s.dots === 3));
    ok("reduced motion: titik tetap '...' tanpa animasi");
    const tipSeq = []; for (const s of samples) if (s.tip && tipSeq[tipSeq.length - 1] !== s.tip) tipSeq.push(s.tip);
    assert.ok(tipSeq.length >= 2);
    assert.ok(samples.every((s) => s.tipOpacity === "1"));
    ok(`reduced motion: tips tetap berganti (${tipSeq.length}x) tanpa fade (opacity selalu 1)`);
    await page.screenshot({ path: `${out}/anim-reduced.png` });
    await ctx.close();
  }

  await browser.close();
  console.log(`ANIMASI: ${pass} lolos`);
})().catch((e) => { console.error("GAGAL:", e.message.split("\n").slice(0, 4).join(" | ")); process.exit(1); });

function log(k, v) { console.log(`  · ${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`); }
