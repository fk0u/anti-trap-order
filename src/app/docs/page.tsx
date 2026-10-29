"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Server,
  Code2,
  BookOpen,
  Sparkles,
  Lock,
  Layers,
  Terminal,
  FolderTree,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/utils";

type Tab = "outline" | "api" | "architecture" | "code";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("outline");
  const [activeCodeFile, setActiveCodeFile] = useState<string>("reflect_engine");
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    system: string;
    version: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setHealthStatus(data))
      .catch(() => setHealthStatus(null));
  }, []);

  return (
    <div className="min-h-screen bg-eco-grid text-slate-900 selection:bg-sky-500/20 selection:text-sky-800">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-sky-200 aero-glass px-4 sm:px-8 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full aero-pill text-xs font-bold text-slate-700 hover:text-slate-900 hover:border-sky-300 transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sky-600" />
              <span>Kembali ke Beranda</span>
            </Link>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide text-slate-900">ATO Docs & Repo Portal</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-sky-100 text-sky-800 border border-sky-200 font-bold">
                Public Access
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {healthStatus && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-[11px] font-mono text-emerald-800 font-bold shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>API Live (Go 1.26): {healthStatus.version}</span>
              </div>
            )}

            <a
              href="/docs/Anti-Trap-Order-Project-Outline-Draft.docx"
              download
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold aero-btn-aqua text-white shadow-md active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download DOCX Asli</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        {/* Hero Section */}
        <div className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-xs font-mono font-bold text-sky-800 shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>Dokumentasi Resmi & Portal Akses Terbuka</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Anti Trap Order (ATO) — Project Design, Outline & Codebase
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed font-medium">
            Meskipun repositori Git di-set private untuk integritas penjurian, seluruh naskah perancangan proyek (<span className="text-slate-900 font-mono font-bold">Anti Trap Order Project Outline Draft.docx</span>), arsitektur monorepo, implementasi Go backend, dan kontrak API dapat diakses dan diinspeksi secara transparan di halaman ini.
          </p>

          {/* Navigation Tabs */}
          <div className="pt-4 flex flex-wrap gap-2 border-b border-sky-100 pb-4">
            <button
              type="button"
              onClick={() => setActiveTab("outline")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs",
                activeTab === "outline"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-white border border-sky-200 text-slate-700 hover:text-slate-900 hover:bg-sky-50"
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Project Outline (13 Bab DOCX)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs",
                activeTab === "code"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-white border border-sky-200 text-slate-700 hover:text-slate-900 hover:bg-sky-50"
              )}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>2. Codebase & Source Explorer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("api")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs",
                activeTab === "api"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-white border border-sky-200 text-slate-700 hover:text-slate-900 hover:bg-sky-50"
              )}
            >
              <Server className="w-3.5 h-3.5" />
              <span>3. API Contract & Live Go Engine</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("architecture")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs",
                activeTab === "architecture"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-white border border-sky-200 text-slate-700 hover:text-slate-900 hover:bg-sky-50"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>4. Monorepo & Invarian Privasi</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Project Outline Draft (Full 13 Chapters) */}
        {activeTab === "outline" && (
          <div className="space-y-8 text-left">
            {/* Meta Card */}
            <div className="p-6 rounded-3xl border border-white/10 bg-surface-card/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Status Dokumen</span>
                <span className="text-brand-teal font-semibold">Draft Internal (v0.9)</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Penyusun</span>
                <span className="text-text-primary font-semibold">Hipster (Web Dev Lead)</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Inspirasi Utama</span>
                <span className="text-text-primary font-semibold">Lee Soo-man (Culture Tech)</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Target Kompetisi</span>
                <span className="text-text-primary font-semibold">MIT-Week 2026</span>
              </div>
            </div>

            {/* Chapters Container */}
            <div className="space-y-6 text-sm leading-relaxed text-text-primary/90">
              {/* Bab 1 */}
              <section className="p-7 rounded-3xl border border-white/10 bg-surface-card space-y-3">
                <span className="text-xs font-mono text-brand-teal uppercase tracking-widest font-semibold block">
                  Bab 1
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Pendahuluan & Latar Belakang Masalah
                </h2>
                <p>
                  Anak muda Indonesia setiap hari berhadapan dengan tawaran kerja palsu, giveaway penipuan, akun yang menyamar sebagai teman atau pihak resmi, tawaran pinjaman/investasi menyesatkan, hingga tautan phishing. Dalam situasi nyata, sulit membedakan interaksi yang tepercaya dari yang menipu. Bahkan setelah sadar menjadi target, banyak orang tidak tahu langkah apa yang harus diambil atau bagaimana membantu orang lain agar tidak mengalami hal serupa.
                </p>
                <p className="text-text-muted">
                  Masalah yang lebih dalam bukan sekadar kurangnya informasi. Masalah utamanya terletak pada <strong className="text-white">ketiadaan kerangka berpikir yang terlatih</strong> saat rasa ragu muncul, serta ketiadaan ruang yang secara sistematis membentuk identitas “penjaga” di ruang digital.
                </p>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-text-muted space-y-1">
                  <span className="font-mono text-brand-teal uppercase text-[10px] font-bold block">
                    Fokus Studi Kasus (MIT-Week 2026):
                  </span>
                  <p>
                    Guardians of the Digital Space – Empowering Today&apos;s Generation Toward a Safer Cyber Ecosystem. Aplikasi memiliki minimal satu fitur utama yang interaktif (hasil bergantung pada input/pilihan user), sudah di-deploy publik, menghormati privasi, dan jujur tentang keterbatasannya.
                  </p>
                </div>
              </section>

              {/* Bab 2 */}
              <section className="p-7 rounded-3xl border border-white/10 bg-surface-card space-y-3">
                <span className="text-xs font-mono text-brand-teal uppercase tracking-widest font-semibold block">
                  Bab 2
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Referensi & Sumber Inspirasi
                </h2>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">2.1 Lee Soo-man & Culture Technology</h3>
                  <p className="text-text-muted">
                    Lee Soo-man adalah pendiri SM Entertainment dan tokoh di balik konsep Culture Technology. Ia tidak hanya menciptakan idol, tetapi membangun sistem produksi budaya yang sistematis: dari pemilihan bakat mentah (Alpha), proses training yang ketat, pembentukan persona, hingga titik di mana sang idol memiliki pengaruh budaya yang luas (mendekati Omega).
                  </p>
                  <p className="text-text-muted">
                    A20 (Alpha to Omega) dalam konteks ini merepresentasikan perjalanan lengkap pembentukan “Digital Guardian” — dari keraguan mentah hingga insting penjaga yang sudah matang. Pendekatan ini diterapkan ke domain Anti-Trap sebagai ranah budaya, bukan sekadar tools keamanan pasif.
                  </p>
                </div>
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <h3 className="text-sm font-semibold text-white">2.2 Makna &ldquo;Order&rdquo; (Orde)</h3>
                  <p className="text-text-muted">
                    Kata &ldquo;Order&rdquo; dipilih karena terinspirasi dari penggunaan istilah &ldquo;orde&rdquo; dalam sejarah tatanan sosial Indonesia. Dalam konteks ini, &ldquo;Order&rdquo; berarti tatanan / sistem / struktur yang mengatur cara baru generasi muda merespons manipulasi siber.
                  </p>
                </div>
              </section>

              {/* Bab 3 */}
              <section className="p-7 rounded-3xl border border-white/10 bg-surface-card space-y-3">
                <span className="text-xs font-mono text-brand-teal uppercase tracking-widest font-semibold block">
                  Bab 3
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Visi, Misi, dan Filosofi Inti
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="font-semibold text-white text-xs block font-mono">Visi</span>
                    <p className="text-xs text-text-muted">
                      Menjadikan kewaspadaan digital sebagai bagian dari identitas budaya anak muda Indonesia, bukan sekadar pengetahuan hafalan yang mudah dilupakan.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="font-semibold text-white text-xs block font-mono">Misi Utama</span>
                    <p className="text-xs text-text-muted">
                      1. Melatih perspective inversion (berpikir dari sisi pelaku).<br />
                      2. Membentuk ikatan emosional sebagai Digital Guardian.<br />
                      3. Memberikan alat taktis yang langsung bisa dipakai di WhatsApp/sosmed.
                    </p>
                  </div>
                </div>
              </section>

              {/* Bab 4 */}
              <section className="p-7 rounded-3xl border border-white/10 bg-surface-card space-y-3">
                <span className="text-xs font-mono text-brand-teal uppercase tracking-widest font-semibold block">
                  Bab 4
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Konsep Solusi: Sistem Berlapis A20
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-2">
                    <span className="font-mono text-xs uppercase text-emerald-400 font-bold block">
                      A20 Lite (Alpha) — The Reflex
                    </span>
                    <p className="text-xs text-text-muted">
                      Versi cepat, dingin, dan taktis (&lt; 90 detik). Dipakai saat sedang menghadapi situasi janggal. User memasukkan situasi &rarr; dipaksa berpikir dari kacamata pelaku &rarr; Action Card checklist + kalimat peringatan siap kirim ke WhatsApp.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-purple-500/30 space-y-2">
                    <span className="font-mono text-xs uppercase text-purple-400 font-bold block">
                      A20 Soul (Omega) — The Guardian Arc
                    </span>
                    <p className="text-xs text-text-muted">
                      Versi dalam dan emosional. User memilih karakter yang ingin dijaga (Dian - adik perantauan), lalu menjalankan rangkaian misi cerita interaktif di mana setiap respons mempengaruhi trust, awareness, dan nasib akhir mereka.
                    </p>
                  </div>
                </div>
              </section>

              {/* Bab 5 & 6 */}
              <section className="p-7 rounded-3xl border border-white/10 bg-surface-card space-y-3">
                <span className="text-xs font-mono text-brand-teal uppercase tracking-widest font-semibold block">
                  Bab 5 & 6
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Target Pengguna & Detail Fitur Interaktif
                </h2>
                <p className="text-text-muted">
                  Target utama adalah mahasiswa & anak muda usia 18–28 tahun yang aktif di WhatsApp, Instagram, Telegram, dan sering menerima tawaran kerja remote palsu, giveaway, atau pinjol ilegal.
                </p>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 text-xs text-text-muted">
                  <span className="font-semibold text-white block">Reverse Reflex: Syarat Interaktivitas Hackathon</span>
                  <p>
                    Bukan detektor pasif. Pengguna harus memilih atau mengetik hipotesis celah terlebih dahulu. Output yang dihasilkan menyambung langsung dengan logika yang baru saja dipikirkan oleh user.
                  </p>
                </div>
              </section>

              {/* Bab 7 */}
              <section className="p-7 rounded-3xl border border-white/10 bg-surface-card space-y-3">
                <span className="text-xs font-mono text-brand-teal uppercase tracking-widest font-semibold block">
                  Bab 7
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  User Flow Lengkap & Diagram Alur
                </h2>
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-brand-teal overflow-x-auto">
                  START &rarr; Beranda (/) &rarr; [ A20 Lite (/lite) | A20 Soul (/soul) | Docs (/docs) ]<br />
                  &bull; A20 Lite: Input Situasi &rarr; 3 Pertanyaan Pelaku &rarr; Action Card &rarr; Salin Peringatan<br />
                  &bull; A20 Soul: Pilih Karakter &rarr; Misi Interaktif &rarr; State (Trust/Awareness) &rarr; Ending & Refleksi
                </div>
              </section>

              {/* Bab 8 & 9 */}
              <section className="p-7 rounded-3xl border border-white/10 bg-surface-card space-y-3">
                <span className="text-xs font-mono text-brand-teal uppercase tracking-widest font-semibold block">
                  Bab 8 & 9
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Arsitektur Teknis: Mengapa Go + Next.js
                </h2>
                <p className="text-text-muted">
                  Hipster (Web Dev Lead) menetapkan arsitektur monorepo decoupled: Next.js 16 untuk frontend interaktif dan Go 1.26 untuk rule engine deterministik. Decision tree berbasis kata kunci dan tag psikologis, bukan LLM generatif yang tidak deterministik dan berbiaya mahal saat trafik tinggi.
                </p>
              </section>

              {/* Bab 10, 11, 12, 13 */}
              <section className="p-7 rounded-3xl border border-white/10 bg-surface-card space-y-3">
                <span className="text-xs font-mono text-brand-teal uppercase tracking-widest font-semibold block">
                  Bab 10 - 13
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Roadmap, Metrik Keberhasilan & Visi Jangka Panjang
                </h2>
                <div className="space-y-2 text-xs text-text-muted">
                  <p>
                    &bull; <strong className="text-white">Metrik Lomba:</strong> Fitur interaktif selesai, live tanpa error di EC2, privasi terjaga tanpa logging, skor Lighthouse mobile &ge; 90.
                  </p>
                  <p>
                    &bull; <strong className="text-white">Visi Jangka Panjang:</strong> ATO dirancang agar dapat digunakan pada orientasi mahasiswa baru, modul peer-education kampus, dan alat bantu cepat yang disebarkan di grup WhatsApp keluarga di seluruh Indonesia.
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Tab 2: Codebase & Source Explorer */}
        {activeTab === "code" && (
          <div className="space-y-6 text-left">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Public Code Inspection</span>
                <span className="text-text-muted hidden sm:inline">(Monorepo Source Viewer)</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "reflect_engine", label: "internal/reflect/engine.go (Go Engine)" },
                  { id: "reflect_local", label: "src/lib/reflect-local.ts (TS Local Fallback)" },
                  { id: "api_client", label: "src/lib/api.ts (Typed Client)" },
                  { id: "soul_engine", label: "internal/soul/engine.go (Soul Logic)" },
                  { id: "server_main", label: "cmd/server/main.go (Go HTTP Server)" },
                ].map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setActiveCodeFile(file.id)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs transition-all",
                      activeCodeFile === file.id
                        ? "bg-white text-surface-base font-bold"
                        : "bg-white/[0.04] text-text-muted hover:text-white"
                    )}
                  >
                    {file.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Box */}
            <div className="p-6 rounded-3xl border border-white/10 bg-[#0B0F17] space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs">
                <span className="text-brand-teal font-semibold">
                  {activeCodeFile === "reflect_engine" && "prototype_ATO/internal/reflect/engine.go"}
                  {activeCodeFile === "reflect_local" && "prototype_ATO/src/lib/reflect-local.ts"}
                  {activeCodeFile === "api_client" && "prototype_ATO/src/lib/api.ts"}
                  {activeCodeFile === "soul_engine" && "prototype_ATO/internal/soul/engine.go"}
                  {activeCodeFile === "server_main" && "prototype_ATO/cmd/server/main.go"}
                </span>
                <span className="text-text-muted text-[11px]">Read-only Public Export</span>
              </div>

              <pre className="p-4 rounded-2xl bg-black/70 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[550px]">
{activeCodeFile === "reflect_engine" && `package reflect

import (
	"fmt"
	"sort"
	"strings"
	"prototype-ato/internal/data"
	"prototype-ato/internal/model"
)

type Engine struct {
	repo *data.Repository
}

func NewEngine(repo *data.Repository) *Engine {
	return &Engine{repo: repo}
}

func (e *Engine) Process(req *model.ReflectRequest) (*model.ReflectResponse, error) {
	scenario := e.resolveScenario(req)

	// 1. Gather tags from answers and keywords
	tagCounts := make(map[string]int)
	var userOptionLabels []string

	for _, ans := range req.Answers {
		for _, q := range scenario.PerspectiveQuestions {
			if q.ID == ans.QuestionID {
				for _, opt := range q.Options {
					if opt.ID == ans.SelectedOptionID {
						userOptionLabels = append(userOptionLabels, opt.Label)
						for _, t := range opt.Tags {
							tagCounts[t]++
						}
					}
				}
			}
		}
	}

	// 2. Deterministic ranking: score = matching_tags * severity
	type scoredFlaw struct {
		flaw  model.Flaw
		score int
	}
	var scored []scoredFlaw
	for _, f := range scenario.Flaws {
		matchCount := tagCounts[f.Tag]
		scored = append(scored, scoredFlaw{flaw: f, score: matchCount * f.Severity})
	}

	sort.SliceStable(scored, func(i, j int) bool {
		if scored[i].score != scored[j].score {
			return scored[i].score > scored[j].score
		}
		return scored[i].flaw.ID < scored[j].flaw.ID
	})

	// Top 3 flaws with context linking back to user's choice
	var userFlaws []model.FlawResult
	for i := 0; i < len(scored) && i < 3; i++ {
		sf := scored[i]
		reason := fmt.Sprintf("Kamu mengenali taktik ini saat memilih sudut pandang pelaku: celah '%s' sengaja dieksploitasi agar korban tidak sempat verifikasi.", sf.flaw.Title)
		userFlaws = append(userFlaws, model.FlawResult{
			ID:                     sf.flaw.ID,
			Title:                  sf.flaw.Title,
			Explanation:            sf.flaw.Explanation,
			EvidencePhrases:        sf.flaw.EvidencePhrases,
			Severity:               sf.flaw.Severity,
			UserPerspectiveReason: reason,
		})
	}

	return &model.ReflectResponse{
		ScenarioID:         scenario.ID,
		MatchedCategory:    scenario.Category,
		UserDetectedFlaws:  userFlaws,
		SafeSteps:          safeSteps,
		WarningTemplates:   warningTemplates,
		ConfidenceNote:     "Analisis ini merupakan alat bantu penalaran berdasarkan pola rekayasa sosial, bukan vonis mutlak sistem keamanan.",
		PerspectiveSummary: perspectiveSummary,
	}, nil
}`}

{activeCodeFile === "reflect_local" && `import scenariosData from "@/data/scenarios.json";
import { ReflectRequest, ReflectResponse, Scenario } from "@/types/api";

const scenarios: Scenario[] = scenariosData as Scenario[];

export function reflectLocal(req: ReflectRequest): ReflectResponse {
  // Pure TypeScript implementation tested against the exact same fixtures
  // Identical keyword normalization, tag scoring, and top-3 ranking algorithm
  const sc = resolveScenario(req);
  ...
}`}

{activeCodeFile === "api_client" && `// src/lib/api.ts: Typed Client with Timeout & Automatic Fallback
export async function reflect(
  req: ReflectRequest
): Promise<{ response: ReflectResponse; isOffline: boolean }> {
  try {
    const res = await fetchWithTimeout(\`\${API_BASE_URL}/api/reflect\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (res.ok) {
      const data = (await res.json()) as ReflectResponse;
      return { response: data, isOffline: false };
    }
  } catch {
    // API failed or offline: seamless fallback to local engine
  }

  const localRes = reflectLocal(req);
  return { response: localRes, isOffline: true };
}`}

{activeCodeFile === "soul_engine" && `package soul

import (
	"fmt"
	"prototype-ato/internal/data"
	"prototype-ato/internal/model"
)

func clamp(val, min, max int) int {
	if val < min { return min }
	if val > max { return max }
	return val
}

func (e *Engine) ProcessStep(req *model.SoulStepRequest) (*model.SoulStepResponse, error) {
	// Clamps trust, awareness, empathy in [0, 100]
	// Seamlessly transitions between dialogue nodes and ending states
	...
}`}

{activeCodeFile === "server_main" && `package main

import (
	"log"
	"net/http"
	"prototype-ato/internal/data"
	"prototype-ato/internal/handler"
	"prototype-ato/internal/middleware"
	"prototype-ato/internal/reflect"
	"prototype-ato/internal/soul"
)

func main() {
	repo, err := data.LoadEmbedded()
	if err != nil {
		log.Fatalf("Fatal: failed to load repository data: %v", err)
	}

	reflectEngine := reflect.NewEngine(repo)
	soulEngine := soul.NewEngine(repo)
	h := handler.NewHandler(repo, reflectEngine, soulEngine)

	mux := http.NewServeMux()
	h.RegisterRoutes(mux)

	handlerWithMiddleware := middleware.Chain(
		mux,
		middleware.Recovery,
		middleware.CORS,
		middleware.SecurityHeaders,
		middleware.RateLimit(120),
		middleware.BodySizeLimit(1024*1024),
	)

	log.Printf("ATO Go API Server listening on :8080")
	http.ListenAndServe(":8080", handlerWithMiddleware)
}`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: API Contract & Live Go Engine */}
        {activeTab === "api" && (
          <div className="space-y-6 text-left">
            <div className="p-6 rounded-3xl border border-white/10 bg-surface-card space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Live Go Backend Endpoint Specifications</span>
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    Seluruh endpoint di bawah ini aktif dan terverifikasi di server EC2.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                  HTTP/2 &bull; SSL Active
                </span>
              </div>

              <div className="grid gap-3">
                <div className="p-4 rounded-2xl bg-[#0B0F17] border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">GET</span>
                    <span className="text-white font-semibold">/api/health</span>
                    <span className="text-text-muted ml-auto">Health check server & Go version</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B0F17] border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">GET</span>
                    <span className="text-white font-semibold">/api/reflect/scenarios</span>
                    <span className="text-text-muted ml-auto">Katalog 6 skenario manipulasi siber</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B0F17] border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">POST</span>
                    <span className="text-white font-semibold">/api/reflect</span>
                    <span className="text-text-muted ml-auto">Memproses Perspective Inversion & ranking celah</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B0F17] border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">POST</span>
                    <span className="text-white font-semibold">/api/soul/step</span>
                    <span className="text-text-muted ml-auto">Memproses pilihan cerita narasi & perubahan state</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Architecture & Privacy Invariants */}
        {activeTab === "architecture" && (
          <div className="space-y-6 text-left">
            <div className="p-7 rounded-3xl border border-white/10 bg-surface-card space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-teal" />
                <span>Invarian Keras ATO (Non-Negotiable)</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-4 text-xs text-text-muted">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="font-semibold text-text-primary block">1. Tanpa Login & Stateless</span>
                  <p>Tidak ada database user, session, atau cookie pelacakan. Data interaksi tidak disimpan.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="font-semibold text-text-primary block">2. Zero Body Logging</span>
                  <p>Middleware server tidak pernah mencatat body input teks bebas user ke log atau disk.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="font-semibold text-text-primary block">3. Tanpa Skor Kepastian Palsu</span>
                  <p>Dilarang menggunakan persentase angka seperti &ldquo;98% aman&rdquo;. ATO adalah instrumen nalar kritis.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="font-semibold text-text-primary block">4. Semua Skenario Fiktif</span>
                  <p>Tidak ada nomor HP riil, rekening bank nyata, atau pencatutan tautan aktif berbahaya.</p>
                </div>
              </div>
            </div>

            {/* Folder Structure */}
            <div className="p-7 rounded-3xl border border-white/10 bg-surface-card space-y-3 font-mono text-xs">
              <span className="text-text-muted uppercase tracking-wider block text-[11px]">
                Struktur Monorepo Bersih:
              </span>
              <pre className="p-4 rounded-2xl bg-black/60 text-[#22D3EE] overflow-x-auto leading-relaxed">
{`├── cmd/server/main.go            # Entrypoint HTTP server Go (net/http stdlib)
├── internal/
│   ├── data/                     # Data repository (embedded scenarios.json & soul-arcs.json)
│   ├── handler/                  # HTTP route handlers & JSON encoders
│   ├── middleware/               # Rate limit, CORS, security headers, panic recovery
│   ├── model/                    # Go structs identik dengan TypeScript types
│   ├── reflect/                  # Engine murni pembalikan sudut pandang & scoring
│   └── soul/                     # Engine graf narasi & evaluasi ending
├── src/
│   ├── app/                      # Next.js 16 App Router (/, /lite, /soul, /docs)
│   ├── components/landing/       # UI modular (Hero, Problem, A20System, ReverseReflex, Trust)
│   ├── content/                  # Typed content string landing page
│   ├── data/                     # JSON skenario & arc
│   ├── lib/                      # api.ts (typed client), reflect-local.ts, soul-local.ts
│   └── types/                    # TypeScript interfaces
├── docs/                         # api-contract.md & Project Outline DOCX
└── public/docs/                  # Downloadable assets`}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
