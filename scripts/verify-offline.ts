/**
 * Memastikan mesin lokal (mode terbatas) identik dengan server Go.
 * Acuan: testdata/fixtures/ml-tokenize.json, ml-analyze.json, reflect-v1.json
 * (dihasilkan Go). Jalankan: npx -y tsx scripts/verify-offline.ts
 */
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { tokenize } from "../src/lib/offline/ml";
import { analyzeTextLocal, reflectLocal } from "../src/lib/offline/engine";

const load = (f: string) => JSON.parse(readFileSync(new URL(`../testdata/fixtures/${f}`, import.meta.url), "utf8"));
let fail = 0;
let total = 0;
const check = (name: string, got: unknown, want: unknown) => {
  total++;
  if (!isDeepStrictEqual(got, want)) {
    fail++;
    console.error(`GAGAL ${name}\n  got:  ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`);
  }
};

for (const c of load("ml-tokenize.json")) check(`tokenize "${c.text}"`, tokenize(c.text), c.tokens);
for (const c of load("ml-analyze.json")) check(`analyze "${c.text.slice(0, 40)}"`, analyzeTextLocal(c.text), c.expected);
for (const c of load("reflect-v1.json")) {
  if (c.status !== 200) continue;
  check(`reflect ${c.name}`, reflectLocal(c.request), c.response);
}

console.log(`${total - fail}/${total} cocok dengan fixture Go`);
process.exit(fail ? 1 : 0);
