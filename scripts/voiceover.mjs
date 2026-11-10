// Membuat voice-over video demo dari demo/narasi.json lewat ElevenLabs (satu mp3 per adegan).
// Kunci dibaca dari ELEVENLABS_API_KEY (.env.local); jangan dimasukkan ke kode.
//   node --env-file=.env.local scripts/voiceover.mjs --list-voices
//   node --env-file=.env.local scripts/voiceover.mjs [--voice <id>] [--only 3]
// Hasil: demo/video/media/vo-01.mp3 … vo-10.mp3 (di-commit supaya video bisa dirender ulang tanpa kredit).
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { readFileSync, writeFileSync } from "node:fs";
import { Readable } from "node:stream";

const client = new ElevenLabsClient();
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

if (args.includes("--list-voices")) {
  const res = await client.voices.search({ pageSize: 100 });
  for (const v of res.voices) if (v.category === "premade") console.log(v.voiceId, v.name, JSON.stringify(v.labels ?? {}));
  process.exit(0);
}

const voiceId = opt("--voice") ?? process.env.VO_VOICE_ID;
if (!voiceId) throw new Error("Beri --voice <id> (lihat --list-voices)");
const only = opt("--only") ? Number(opt("--only")) : null;
const narasi = JSON.parse(readFileSync(new URL("../demo/narasi.json", import.meta.url), "utf8"));
const out = (i) => new URL(`../demo/video/media/vo-${String(i + 1).padStart(2, "0")}.mp3`, import.meta.url);

for (let i = 0; i < narasi.length; i++) {
  if (only && only !== i + 1) continue;
  const stream = await client.textToSpeech.convert(voiceId, {
    text: narasi[i],
    modelId: "eleven_v4",
    languageCode: "id",
    outputFormat: "mp3_44100_128",
    // Request stitching: nada dan jeda tersambung antar adegan.
    previousText: narasi[i - 1],
    nextText: narasi[i + 1],
  });
  const buf = Buffer.concat(await Readable.fromWeb(stream).toArray());
  writeFileSync(out(i), buf);
  console.log(`vo-${String(i + 1).padStart(2, "0")}.mp3  ${buf.length} byte  ≈ ${((buf.length * 8) / 128000).toFixed(1)} dtk`);
}
