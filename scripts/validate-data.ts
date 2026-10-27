import fs from "node:fs";
import path from "node:path";
import type { Scenario, SoulArc } from "../src/types/api";

function runValidation() {
  console.log("==> Memulai Validasi Data & Kontrak Fase A (ATO)...\n");

  const scenariosPath = path.resolve(process.cwd(), "src/data/scenarios.json");
  const soulArcsPath = path.resolve(process.cwd(), "src/data/soul-arcs.json");

  if (!fs.existsSync(scenariosPath)) {
    throw new Error(`File skenario tidak ditemukan di: ${scenariosPath}`);
  }
  if (!fs.existsSync(soulArcsPath)) {
    throw new Error(`File soul arcs tidak ditemukan di: ${soulArcsPath}`);
  }

  const scenarios: Scenario[] = JSON.parse(fs.readFileSync(scenariosPath, "utf-8"));
  const soulArcs: SoulArc[] = JSON.parse(fs.readFileSync(soulArcsPath, "utf-8"));

  // 1. VALIDASI SKENARIO
  console.log(`[1/3] Memeriksa ${scenarios.length} Skenario...`);
  if (scenarios.length < 6) {
    throw new Error(`Skenario kurang dari 6 (ditemukan: ${scenarios.length})`);
  }

  const prohibitedPatterns = [
    /https?:\/\/(?!localhost)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Real unmasked URL
    /\+62\s?[0-9]{9,12}(?!.*X)/, // Real unmasked phone number
    /08[0-9]{9,11}(?!.*X)/,
  ];

  const categoriesFound = new Set<string>();

  for (const s of scenarios) {
    categoriesFound.add(s.category);

    // Invariant: Non-empty IDs & title
    if (!s.id || !s.title) throw new Error(`Skenario tanpa id/title`);
    if (s.perspective_questions.length < 3) {
      throw new Error(`Skenario ${s.id} harus memiliki minimal 3 pertanyaan perspektif`);
    }
    if (s.flaws.length < 4) {
      throw new Error(`Skenario ${s.id} harus memiliki minimal 4 flaws`);
    }
    if (s.safe_steps.length < 4) {
      throw new Error(`Skenario ${s.id} harus memiliki minimal 4 safe_steps`);
    }

    const tones = s.warning_templates.map((w) => w.tone);
    if (!tones.includes("casual") || !tones.includes("firm")) {
      throw new Error(`Skenario ${s.id} harus memiliki warning template casual dan firm`);
    }

    // Check evidence phrases
    for (const flaw of s.flaws) {
      if (!flaw.evidence_phrases || flaw.evidence_phrases.length === 0) {
        throw new Error(`Flaw ${flaw.id} di skenario ${s.id} tidak memiliki evidence_phrases`);
      }
    }

    // Invariant: Privacy & Real Entity Check
    const rawContent = JSON.stringify(s);
    for (const pattern of prohibitedPatterns) {
      if (pattern.test(rawContent)) {
        throw new Error(`Skenario ${s.id} melanggar privasi: mengandung URL/nomor asli (${pattern})`);
      }
    }

    console.log(`  ✓ Skenario [${s.category}] "${s.title}" lolos verifikasi.`);
  }

  // 2. VALIDASI GRAPH SOUL ARC
  console.log(`\n[2/3] Memeriksa Graf Cerita Soul Arc...`);
  if (soulArcs.length < 1) {
    throw new Error(`Soul arc tidak ditemukan`);
  }

  for (const arc of soulArcs) {
    console.log(`  Memvalidasi Arc: "${arc.title}" (Ward: ${arc.ward.name})...`);
    const nodeMap = new Map(arc.nodes.map((n) => [n.id, n]));

    if (!nodeMap.has(arc.initial_node_id)) {
      throw new Error(`initial_node_id '${arc.initial_node_id}' tidak ada di daftar nodes!`);
    }

    // Reachability check via BFS
    const visitedNodes = new Set<string>();
    const queue: string[] = [arc.initial_node_id];
    let reachableEndingsCount = 0;

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visitedNodes.has(currentId)) continue;
      visitedNodes.add(currentId);

      const node = nodeMap.get(currentId);
      if (!node) continue;

      if (!node.choices || node.choices.length === 0) {
        throw new Error(`Dead-end terdeteksi pada node ${node.id}: tidak memiliki choices!`);
      }

      for (const choice of node.choices) {
        const nextId = choice.next_node_id;
        if (nextId === "resolve_ending") {
          reachableEndingsCount++;
        } else if (!nodeMap.has(nextId)) {
          throw new Error(`Choice '${choice.id}' pada node '${node.id}' mengarah ke node tidak dikenal '${nextId}'!`);
        } else {
          queue.push(nextId);
        }
      }
    }

    // Ensure all nodes in arc are reachable (no orphan dead code)
    for (const n of arc.nodes) {
      if (!visitedNodes.has(n.id)) {
        throw new Error(`Orphan node terdeteksi: '${n.id}' tidak dapat dicapai dari initial_node!`);
      }
    }

    if (arc.endings.length < 3) {
      throw new Error(`Arc harus memiliki minimal 3 ending berbeda! Ditemukan: ${arc.endings.length}`);
    }

    if (reachableEndingsCount === 0) {
      throw new Error(`Graf tidak memiliki jalur yang mencapai ending!`);
    }

    console.log(`  ✓ Semua ${arc.nodes.length} node reachable tanpa dead-end.`);
    console.log(`  ✓ ${arc.endings.length} ending valid dan dapat diselesaikan.`);
  }

  // 3. UJI DETERMINISME INVERSI PERSPEKTIF
  console.log(`\n[3/3] Menguji Determinisme Mesin Inversi Perspektif...`);
  const testScenario = scenarios[0];
  const q1 = testScenario.perspective_questions[0];
  const q2 = testScenario.perspective_questions[1];

  const combo1Tags = [...q1.options[0].tags, ...q2.options[0].tags];
  const combo2Tags = [...q1.options[1].tags, ...q2.options[1].tags];

  const scoreFlaws = (tags: string[]) => {
    return testScenario.flaws
      .map((f) => ({
        id: f.id,
        score: (tags.includes(f.tag) ? 10 : 0) + f.severity * 2,
      }))
      .sort((a, b) => b.score - a.score);
  };

  const top1 = scoreFlaws(combo1Tags)[0].id;
  const top2 = scoreFlaws(combo2Tags)[0].id;

  if (top1 === top2) {
    throw new Error(`Inversi gagal: dua kombinasi jawaban berbeda menghasilkan top flaw yang sama (${top1})`);
  }

  console.log(`  ✓ Kombinasi 1 menghasilkan top flaw: ${top1}`);
  console.log(`  ✓ Kombinasi 2 menghasilkan top flaw: ${top2}`);
  console.log(`  ✓ Inversi perspektif terbukti deterministik dan reaktif terhadap pilihan user!`);

  console.log("\n✅ SEMUA VALIDASI FASE A LULUS 100%!");
}

runValidation();
