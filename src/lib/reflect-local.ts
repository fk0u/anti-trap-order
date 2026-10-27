import scenariosData from "@/data/scenarios.json";
import {
  Flaw,
  FlawResult,
  ReflectRequest,
  ReflectResponse,
  Scenario,
  ScenarioCategory,
} from "@/types/api";

const scenarios: Scenario[] = scenariosData as Scenario[];

const IndonesianSlangMap: Record<string, string> = {
  tf: "transfer",
  trf: "transfer",
  trsf: "transfer",
  rek: "rekening",
  rekk: "rekening",
  norek: "rekening",
  depo: "deposit",
  topup: "deposit",
  byr: "bayar",
  dp: "uang_muka",
  pinjol: "pinjaman_online",
  pnjm: "pinjam",
  cair: "pencairan_dana",
  bunga: "bunga_pinjaman",
  loker: "lowongan_kerja",
  lwngan: "lowongan_kerja",
  krja: "kerja",
  parttime: "paruh_waktu",
  freelance: "paruh_waktu",
  komisi: "komisi",
  gaji: "komisi",
  sub: "subscribe",
  subs: "subscribe",
  skrg: "sekarang",
  skrng: "sekarang",
  segera: "segera",
  buruan: "segera",
  hangus: "hangus_kedaluwarsa",
  urgent: "darurat",
  wa: "whatsapp",
  tele: "telegram",
  apk: "unduh_aplikasi",
  link: "tautan_link",
  klik: "tautan_link",
  mng: "menang",
  giveaway: "giveaway_hadiah",
  hadiah: "giveaway_hadiah",
  kk: "kakak",
  kak: "kakak",
  bca: "bank_bca",
  bri: "bank_bri",
  bni: "bank_bni",
  mandiri: "bank_mandiri",
  dana: "ewallet_dana",
  gopay: "ewallet_gopay",
  ovo: "ewallet_ovo",
};

const vectorPatterns: Record<string, string[]> = {
  urgency: [
    "sebelum hangus",
    "kuota terbatas",
    "hanya hari ini",
    "sekarang juga",
    "segera konfirmasi",
    "1x24 jam",
    "batas waktu",
  ],
  upfront_fee: [
    "transfer deposit",
    "biaya pendaftaran",
    "biaya aktivasi",
    "biaya admin",
    "modal awal",
    "transfer dulu",
  ],
  impersonation: [
    "ini nomor baru",
    "hp ku hilang",
    "pinjam nomor rekening",
    "customer service resmi",
    "dari pihak shopee",
  ],
  too_good_to_be_true: [
    "gaji jutaan per hari",
    "kerja santai modal like",
    "hanya like dan subscribe",
    "tanpa jaminan langsung cair",
  ],
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeNLP(text: string): string[] {
  const norm = normalize(text);
  const words = norm.split(" ");
  return words.map((w) => IndonesianSlangMap[w] || w);
}

function detectVectors(text: string): string[] {
  const norm = normalize(text);
  const detected: string[] = [];
  for (const [vec, patterns] of Object.entries(vectorPatterns)) {
    if (patterns.some((p) => norm.includes(p))) {
      detected.push(vec);
    }
  }
  return detected;
}

function resolveScenario(req: ReflectRequest): Scenario {
  if (req.scenario_id) {
    const found = scenarios.find((s) => s.id === req.scenario_id);
    if (found) return found;
  }

  if (req.free_text && req.free_text.trim().length > 0) {
    const normText = normalize(req.free_text);
    const tokens = tokenizeNLP(req.free_text);
    const tokenSet = new Set(tokens);
    const vectors = detectVectors(req.free_text);

    let bestScore = 0;
    let bestScenario: Scenario | null = null;

    for (const sc of scenarios) {
      if (sc.id === "generic") continue;
      let score = 0;
      for (const kw of sc.keywords) {
        const normKw = normalize(kw);
        if (normKw.includes(" ")) {
          if (normText.includes(normKw)) {
            score += 3;
          }
        } else if (tokenSet.has(normKw)) {
          score += 2;
        }
      }

      // Vector boost
      if (sc.category === "job_scam" && vectors.includes("upfront_fee")) score += 4;
      if (sc.category === "impersonation" && vectors.includes("impersonation")) score += 5;
      if (sc.category === "giveaway" && vectors.includes("too_good_to_be_true")) score += 4;
      if (sc.category === "loan" && vectors.includes("too_good_to_be_true")) score += 3;

      if (score > bestScore) {
        bestScore = score;
        bestScenario = sc;
      }
    }

    if (bestScore >= 2 && bestScenario) {
      return bestScenario;
    }
  }

  const generic = scenarios.find((s) => s.id === "generic");
  return generic || scenarios[0];
}

export function reflectLocal(req: ReflectRequest): ReflectResponse {
  const sc = resolveScenario(req);

  // 1. Collect tags from answers and free_text keywords & vectors
  const tagCounts = new Map<string, number>();
  const userOptionLabels: string[] = [];

  for (const ans of req.answers || []) {
    for (const q of sc.perspective_questions) {
      if (q.id === ans.question_id) {
        for (const opt of q.options) {
          if (opt.id === ans.selected_option_id) {
            userOptionLabels.push(opt.label);
            for (const t of opt.tags) {
              tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
            }
          }
        }
      }
    }
  }

  const detectedVectors = req.free_text ? detectVectors(req.free_text) : [];
  for (const v of detectedVectors) {
    if (v === "urgency") tagCounts.set("urgensi", (tagCounts.get("urgensi") || 0) + 1);
    if (v === "upfront_fee") tagCounts.set("uang_muka", (tagCounts.get("uang_muka") || 0) + 1);
    if (v === "impersonation") tagCounts.set("rekayasa_identitas", (tagCounts.get("rekayasa_identitas") || 0) + 1);
  }

  // 2. Rank flaws
  interface ScoredFlaw {
    flaw: Flaw;
    score: number;
  }

  const scored: ScoredFlaw[] = sc.flaws.map((f) => {
    const matchCount = tagCounts.get(f.tag) || 0;
    const score = matchCount * f.severity;
    return { flaw: f, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.flaw.severity !== a.flaw.severity) return b.flaw.severity - a.flaw.severity;
    return a.flaw.id.localeCompare(b.flaw.id);
  });

  const topFlaws = scored.slice(0, 3).map((sf) => sf.flaw);

  // 3. Dominant tag
  let dominantTag = "";
  let maxTagCount = 0;
  tagCounts.forEach((count, tag) => {
    if (count > maxTagCount) {
      maxTagCount = count;
      dominantTag = tag;
    }
  });

  // 4. Safe steps
  const safeSteps: string[] = [];
  for (const step of sc.safe_steps) {
    if (dominantTag && step.applies_to_tags.includes(dominantTag)) {
      safeSteps.push(step.text);
    }
  }
  for (const step of sc.safe_steps) {
    if (safeSteps.length >= 4) break;
    if (!safeSteps.includes(step.text)) {
      safeSteps.push(step.text);
    }
  }

  // 5. Warning templates
  let casual = "";
  let firm = "";
  for (const wt of sc.warning_templates) {
    if (dominantTag && wt.applies_to_tags.includes(dominantTag)) {
      if (wt.tone === "casual" && !casual) casual = wt.text;
      if (wt.tone === "firm" && !firm) firm = wt.text;
    }
  }
  for (const wt of sc.warning_templates) {
    if (wt.tone === "casual" && !casual) casual = wt.text;
    if (wt.tone === "firm" && !firm) firm = wt.text;
  }

  // 6. User detected flaws
  const userDetectedFlaws: FlawResult[] = topFlaws.map((f) => {
    const isTagMatched = (tagCounts.get(f.tag) || 0) > 0;
    const reason = isTagMatched
      ? `Kamu mengenali taktik ini saat memilih sudut pandang pelaku: celah "${f.title}" sengaja dieksploitasi agar korban tidak sempat verifikasi.`
      : `Taktik pendukung yang sering dipakai bersama pola manipulasi yang kamu tandai.`;

    return {
      id: f.id,
      title: f.title,
      explanation: f.explanation,
      evidence_phrases: f.evidence_phrases,
      severity: f.severity,
      user_perspective_reason: reason,
    };
  });

  let perspectiveSummary =
    userOptionLabels.length > 0
      ? `Melalui sudut pandang pelaku, kamu menandai fokus pada: ${userOptionLabels.join(
          "; "
        )}. Ini membuka celah manipulasi berikut:`
      : `Melalui sudut pandang pelaku, pola manipulasi berikut berhasil dipetakan:`;

  if (detectedVectors.length > 0) {
    perspectiveSummary += ` [NLP Tokenizer mendeteksi vektor manipulasi: ${detectedVectors.join(", ")}]`;
  }

  return {
    scenario_id: sc.id,
    matched_category: sc.category as ScenarioCategory,
    user_detected_flaws: userDetectedFlaws,
    safe_steps: safeSteps,
    warning_templates: {
      casual: casual || "Hati-hati ya, pesan tadi ada tanda-tanda manipulasi. Jangan klik atau transfer apa pun dulu.",
      firm: firm || "PERINGATAN: Pesan tersebut menggunakan pola rekayasa sosial. Segera verifikasi lewat kanal resmi sebelum bertindak.",
    },
    confidence_note:
      "Analisis ini merupakan alat bantu penalaran berdasarkan pola rekayasa sosial, bukan vonis mutlak sistem keamanan.",
    perspective_summary: perspectiveSummary,
  };
}
