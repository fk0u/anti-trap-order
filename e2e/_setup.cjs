/**
 * Pengaturan bersama untuk test e2e (lihat CLAUDE.md → "Test e2e").
 *
 * Playwright sengaja TIDAK ada di package.json. Jalankan lewat npx:
 *   npx -y -p playwright@1.49.1 node e2e/lite.cjs
 * npx menaruh `<cache>/_npx/<hash>/node_modules/.bin` di PATH; dari situ
 * modul `playwright` dicari. PW_PATH (path ke folder paket playwright) bisa
 * dipakai untuk menimpa.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function loadPlaywright() {
  const candidates = [];
  if (process.env.PW_PATH) candidates.push(process.env.PW_PATH);
  candidates.push("playwright");
  for (const dir of (process.env.PATH || "").split(path.delimiter)) {
    if (/[\\/]_npx[\\/]/.test(dir) && /node_modules[\\/]\.bin$/.test(dir)) {
      candidates.push(path.join(dir, "..", "playwright"));
    }
  }
  const errors = [];
  for (const c of candidates) {
    try {
      return require(c);
    } catch (err) {
      errors.push(`${c}: ${err.code || err.message}`);
    }
  }
  throw new Error(
    "Playwright tidak ditemukan. Jalankan lewat: npx -y -p playwright@1.49.1 node e2e/<file>.cjs\n" + errors.join("\n")
  );
}

/** URL frontend yang diuji (harus sama dengan CORS_ORIGIN backend). */
const BASE = (process.env.E2E_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Folder screenshot: argumen pertama, E2E_OUT, atau folder temp sistem. */
const OUT = process.argv[2] || process.env.E2E_OUT || path.join(os.tmpdir(), "ato-e2e");
fs.mkdirSync(OUT, { recursive: true });

/**
 * Viewport uji: E2E_VIEWPORT = "390" | "768" | "1024" | "1440" (atau "LEBARxTINGGI").
 * Default 390×844 (mobile). `DESKTOP` = lebar ≥ 1024 (layout desktop Figma 06).
 */
function parseViewport(v) {
  const presets = { 390: [390, 844], 768: [768, 1024], 1024: [1024, 768], 1440: [1440, 900] };
  if (!v) return { width: 390, height: 844 };
  const m = /^(\d+)(?:x(\d+))?$/.exec(v);
  if (!m) throw new Error(`E2E_VIEWPORT tidak valid: ${v}`);
  const [w, h] = presets[m[1]] ?? [Number(m[1]), Number(m[2] ?? 900)];
  return { width: w, height: m[2] ? Number(m[2]) : h };
}
const VIEWPORT = parseViewport(process.env.E2E_VIEWPORT);
const DESKTOP = VIEWPORT.width >= 1024;

module.exports = { ...loadPlaywright(), BASE, OUT, VIEWPORT, DESKTOP };
