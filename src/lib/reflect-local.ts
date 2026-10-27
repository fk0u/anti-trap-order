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

interface ScoredScenario {
  scenario: Scenario;
  score: number;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveScenario(req: ReflectRequest): Scenario {
  if (req.scenario_id) {
    const found = scenarios.find((s) => s.id === req.scenario_id);
    if (found) return found;
  }

  if (req.free_text && req.free_text.trim().length > 0) {
    const normText = normalize(req.free_text);
    const words = new Set(normText.split(" "));

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
        } else if (words.has(normKw)) {
          score += 2;
        }
      }
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

  // 1. Collect tags from answers and free_text keywords
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

  if (req.free_text) {
    const normText = normalize(req.free_text);
    for (const kw of sc.keywords) {
      if (normText.includes(normalize(kw))) {
        tagCounts.set("keyword_match", (tagCounts.get("keyword_match") || 0) + 1);
      }
    }
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
    if (count > maxTagCount && tag !== "keyword_match") {
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

  const perspectiveSummary =
    userOptionLabels.length > 0
      ? `Melalui sudut pandang pelaku, kamu menandai fokus pada: ${userOptionLabels.join(
          "; "
        )}. Ini membuka celah manipulasi berikut:`
      : `Melalui sudut pandang pelaku, pola manipulasi berikut berhasil dipetakan:`;

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
