"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Heart,
  Eye,
  Sparkles,
  RotateCcw,
  User,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Trash2,
  Server,
  WifiOff,
  ExternalLink,
  Award,
  Share2,
} from "lucide-react";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/utils";
import { getArcs, soulStep } from "@/lib/api";
import {
  ArcEnding,
  ArcNode,
  GuardianState,
  NodeChoice,
  SoulArc,
  SoulArcSummary,
} from "@/types/api";
import soulArcsData from "@/data/soul-arcs.json";
import { GuardianBadgeModal } from "@/components/guardian/GuardianBadgeModal";

const soulArcs = soulArcsData as SoulArc[];
const LOCAL_STORAGE_KEY = "ato_soul_progress_v1";

interface SavedProgress {
  arcId: string;
  currentNodeId: string;
  state: GuardianState;
  history: string[];
}

export default function SoulPage() {
  const [arcs, setArcs] = useState<SoulArcSummary[]>([]);
  const [selectedArc, setSelectedArc] = useState<SoulArc | null>(null);
  const [currentNode, setCurrentNode] = useState<ArcNode | null>(null);
  const [state, setState] = useState<GuardianState>({ trust: 50, awareness: 50, empathy: 50 });
  const [history, setHistory] = useState<string[]>([]);
  const [ending, setEnding] = useState<ArcEnding | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState<boolean>(false);

  // Switch between different soul arcs
  const handleSwitchArc = (arc: SoulArc) => {
    setSelectedArc(arc);
    setCurrentNode(arc.nodes[0] || null);
    setState(arc.initial_state);
    setHistory([]);
    setEnding(null);
  };

  // Load arcs
  useEffect(() => {
    getArcs().then((list) => {
      setArcs(list);
    });

    const defaultArc = soulArcs[0];
    if (defaultArc) {
      setSelectedArc(defaultArc);

      // Check localStorage for saved progress
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as SavedProgress;
          if (parsed.arcId === defaultArc.id) {
            const foundNode = defaultArc.nodes.find((n) => n.id === parsed.currentNodeId);
            if (foundNode) {
              setCurrentNode(foundNode);
              setState(parsed.state);
              setHistory(parsed.history || []);
              return;
            }
          }
        }
      } catch {
        // ignore storage error
      }

      // Default start
      setCurrentNode(defaultArc.nodes[0] || null);
      setState(defaultArc.initial_state);
    }
  }, []);

  // Save progress on state/node change
  useEffect(() => {
    if (selectedArc && currentNode && !ending) {
      const data: SavedProgress = {
        arcId: selectedArc.id,
        currentNodeId: currentNode.id,
        state,
        history,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
    }
  }, [selectedArc, currentNode, state, history, ending]);

  // Reset progress
  const handleReset = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }

    if (selectedArc) {
      setCurrentNode(selectedArc.nodes[0] || null);
      setState(selectedArc.initial_state);
      setHistory([]);
      setEnding(null);
    }
  }, [selectedArc]);

  // Handle choice selection
  const handleSelectChoice = async (choice: NodeChoice) => {
    if (!selectedArc || !currentNode || isProcessing) return;

    setIsProcessing(true);
    const newHistory = [...history, `${currentNode.speaker}: ${choice.label}`];
    setHistory(newHistory);

    try {
      const res = await soulStep({
        arc_id: selectedArc.id,
        node_id: currentNode.id,
        choice_id: choice.id,
        state,
      });

      setIsOffline(res.isOffline);
      setState(res.response.state);

      if (res.response.ending) {
        setEnding(res.response.ending);
        setCurrentNode(null);
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch {
          // ignore
        }
      } else if (res.response.next_node) {
        setCurrentNode(res.response.next_node);
      }
    } catch (err) {
      console.error("Soul step failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-[#F5F7FA] selection:bg-[#8B5CF6]/20 selection:text-[#C084FC]">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090D]/85 backdrop-blur-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-text-muted hover:text-text-primary hover:border-white/20 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>

            <span className="text-white/20 hidden sm:inline">|</span>

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">A20 Soul</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                The Guardian Arc
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs text-text-muted hover:text-rose-400 hover:border-rose-500/30 transition-all"
              title="Hapus progres dan mulai ulang cerita"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Hapus Progres</span>
            </button>

            <Link
              href="/lite"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-all"
            >
              <span className="hidden sm:inline">Beralih ke</span>
              <span>A20 Lite</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Arc Selector Tabs */}
        <div className="mb-8 space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted text-center">
            Pilih Alur Cerita Tanggung Jawab (The Guardian Arc):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {soulArcs.map((arc) => {
              const isSelected = selectedArc?.id === arc.id;
              return (
                <button
                  key={arc.id}
                  type="button"
                  onClick={() => handleSwitchArc(arc)}
                  className={cn(
                    "p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden",
                    isSelected
                      ? "bg-purple-500/15 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30"
                      : "bg-white/[0.02] border-white/5 hover:border-white/15 text-text-muted hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className={cn("w-3.5 h-3.5", isSelected ? "text-purple-400" : "text-text-muted")} />
                    <span className={cn("text-xs font-bold", isSelected ? "text-white" : "text-text-muted")}>
                      {arc.ward.name}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted ml-auto">
                      {arc.ward.age} thn
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white/95 truncate">
                    {arc.title}
                  </div>
                  <div className="text-[10px] font-mono text-text-muted truncate mt-0.5">
                    {arc.ward.relationship}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Intro Banner */}
        <div className="mb-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Simulasi Tanggung Jawab &bull; Membentuk Mental Penjaga</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            {selectedArc?.title || "The Guardian Arc"} &mdash; Lindungi {selectedArc?.ward.name || "Keluarga"}
          </h1>

          <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
            {selectedArc?.ward.context}
          </p>
        </div>

        {/* State Status Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-3 gap-3 text-center font-mono">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[11px] text-text-muted">
              <Heart className="w-3 h-3 text-rose-400" />
              <span>Trust (Kepercayaan)</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white">{state.trust} / 100</div>
          </div>

          <div className="space-y-1 border-x border-white/5">
            <div className="flex items-center justify-center gap-1 text-[11px] text-text-muted">
              <Eye className="w-3 h-3 text-amber-400" />
              <span>Awareness (Kewaspadaan)</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white">{state.awareness} / 100</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[11px] text-text-muted">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Empathy (Empati)</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white">{state.empathy} / 100</div>
          </div>
        </div>

        {/* ================= ACTIVE DIALOGUE NODE ================= */}
        {!ending && currentNode && (
          <div className="relative rounded-3xl border border-white/10 bg-[#0B0F17] p-6 sm:p-8 space-y-6">
            <BorderBeam size={240} duration={14} colorFrom="#A855F7" colorTo="#3B82F6" />

            {/* Speaker Tag */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold font-mono">
                  D
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Dian (Adik Perantauan)</span>
                  <span className="text-[10px] text-text-muted font-mono">19 Tahun &bull; Mahasiswi Baru</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-text-muted">
                {isOffline ? "Offline Mode" : "Go Engine Sync"}
              </div>
            </div>

            {/* Narration */}
            <div className="space-y-3 font-mono">
              <p className="text-sm sm:text-base text-white leading-relaxed">
                {currentNode.narration}
              </p>

              {/* Evidence bubble if present */}
              {currentNode.victim_evidence && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-emerald-300 leading-relaxed border-l-4 border-l-purple-500">
                  <span className="text-[10px] uppercase text-text-muted block font-bold mb-1">
                    Tangkapan Layar Pesan Dian:
                  </span>
                  &ldquo;{currentNode.victim_evidence}&rdquo;
                </div>
              )}
            </div>

            {/* Choices */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-mono uppercase text-purple-400 font-bold tracking-wider block">
                Pilih Respons Kamu Sebagai Penjaga:
              </span>

              {currentNode.choices.map((choice, idx) => (
                <button
                  key={choice.id}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleSelectChoice(choice)}
                  className="w-full p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all flex items-start gap-4 text-left group"
                >
                  <span className="w-6 h-6 rounded-full border border-white/20 bg-white/[0.05] flex items-center justify-center text-xs font-mono text-text-muted group-hover:border-purple-400 group-hover:text-purple-400 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>

                  <div className="space-y-1">
                    <span className="text-xs sm:text-sm font-medium text-text-primary group-hover:text-white leading-relaxed block">
                      {choice.label}
                    </span>
                    {choice.perspective_hint && (
                      <span className="text-[11px] font-mono text-text-muted group-hover:text-purple-300/80 block">
                        &rarr; {choice.perspective_hint}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= ENDING STATE ================= */}
        {ending && (
          <div className="relative rounded-3xl border border-purple-500/30 bg-[#0B0F17] p-6 sm:p-9 space-y-6">
            <BorderBeam size={280} duration={10} colorFrom="#A855F7" colorTo="#EC4899" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-mono text-purple-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Arketipe Penjaga: {ending.guardian_archetype}</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                {ending.title}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-mono">
                {ending.summary}
              </p>
            </div>

            {/* Philosophical Reflection Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold block">
                Refleksi Budaya Penjaga (Perspective Inversion):
              </span>
              <p className="text-xs sm:text-sm text-white leading-relaxed font-mono italic">
                &ldquo;{ending.reflection}&rdquo;
              </p>
            </div>

            <div className="text-[11px] font-mono text-text-muted">
              Kondisi akhir: {ending.condition_note}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-white hover:bg-white/[0.08] transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulangi dengan Pendekatan Lain</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsBadgeModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-purple-500/40 bg-purple-500/20 text-xs font-semibold text-purple-300 hover:bg-purple-500/30 transition-all shadow-md"
                >
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span>Klaim Kartu Penjaga</span>
                </button>

                <Link
                  href="/lite"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-all shadow-md active:scale-95"
                >
                  <span>Coba A20 Lite</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <GuardianBadgeModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        streak={Math.max(1, Math.floor((state.trust + state.awareness + state.empathy) / 40))}
        xp={state.awareness * 2 + state.empathy * 2}
        rankTitle={ending?.guardian_archetype || "Guardian of the Digital Space"}
        stageTitle={ending ? `${ending.title} (${selectedArc?.ward.name})` : "The Guardian Arc"}
      />
    </div>
  );
}
