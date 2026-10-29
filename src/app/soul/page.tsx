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
    <div className="min-h-screen bg-eco-grid text-slate-900 selection:bg-sky-500/20 selection:text-sky-800">
      {/* Top Header with Aero Glass */}
      <header className="sticky top-0 z-50 border-b border-sky-200 aero-glass px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full aero-pill text-xs font-bold text-slate-800 hover:border-sky-300 shadow-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sky-600" />
              <span>[ ATO ]</span>
            </Link>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide text-slate-900">A20 Soul</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-sky-100 text-sky-800 border border-sky-200 font-bold">
                [ THE GUARDIAN ARC ]
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full aero-pill text-xs text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-all font-semibold shadow-xs"
              title="Hapus progres dan mulai ulang cerita"
            >
              <Trash2 className="w-3 h-3 text-rose-500" />
              <span className="hidden sm:inline">Hapus Progres</span>
            </button>

            <Link
              href="/lite"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full aero-btn-aqua text-xs font-bold text-white shadow-md"
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
        <div className="mb-8 space-y-2.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-sky-800 font-bold text-center">
            [ PILIH ALUR CERITA TANGGUNG JAWAB // GUARDIAN ARC ]
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {soulArcs.map((arc) => {
              const isSelected = selectedArc?.id === arc.id;
              return (
                <button
                  key={arc.id}
                  type="button"
                  onClick={() => handleSwitchArc(arc)}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all relative overflow-hidden shadow-xs",
                    isSelected
                      ? "aero-card border-sky-400 shadow-lg ring-1 ring-sky-300 border-t-2 border-white"
                      : "bg-white/80 border-sky-200 hover:border-sky-300 text-slate-600 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className={cn("w-3.5 h-3.5", isSelected ? "text-purple-600" : "text-slate-400")} />
                    <span className={cn("text-xs font-bold", isSelected ? "text-slate-900" : "text-slate-600")}>
                      {arc.ward.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 ml-auto font-bold">
                      {arc.ward.age} thn
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {arc.title}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5 font-medium">
                    {arc.ward.relationship}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Intro Banner */}
        <div className="mb-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-300 text-xs font-mono font-bold text-purple-900 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-purple-700" />
            <span>Simulasi Tanggung Jawab &bull; Membentuk Mental Penjaga</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {selectedArc?.title || "The Guardian Arc"} &mdash; Lindungi {selectedArc?.ward.name || "Keluarga"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
            {selectedArc?.ward.context}
          </p>
        </div>

        {/* State Status Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-sky-200 grid grid-cols-3 gap-3 text-center font-mono shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-600 font-bold">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-100" />
              <span>Trust</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900">{state.trust} / 100</div>
          </div>

          <div className="space-y-1 border-x border-sky-100">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-600 font-bold">
              <Eye className="w-3 h-3 text-amber-500" />
              <span>Awareness</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900">{state.awareness} / 100</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-600 font-bold">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>Empathy</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900">{state.empathy} / 100</div>
          </div>
        </div>

        {/* ================= ACTIVE DIALOGUE NODE ================= */}
        {!ending && currentNode && (
          <div className="relative rounded-3xl aero-card p-6 sm:p-8 space-y-6 shadow-xl border-t-2 border-white">
            <BorderBeam size={240} duration={14} colorFrom="#A855F7" colorTo="#3B82F6" />

            {/* Speaker Tag */}
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-300 text-purple-800 flex items-center justify-center text-xs font-bold font-mono">
                  {selectedArc?.ward.name.charAt(0) || "D"}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{selectedArc?.ward.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">{selectedArc?.ward.relationship}</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-500 font-bold">
                {isOffline ? "Offline Mode" : "Go Engine Sync"}
              </div>
            </div>

            {/* Narration */}
            <div className="space-y-3 font-mono">
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                {currentNode.narration}
              </p>

              {/* Evidence bubble if present */}
              {currentNode.victim_evidence && (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs sm:text-sm text-purple-950 leading-relaxed border-l-4 border-l-purple-500 shadow-xs">
                  <span className="text-[10px] uppercase text-purple-800 block font-bold mb-1">
                    Tangkapan Layar Pesan:
                  </span>
                  &ldquo;{currentNode.victim_evidence}&rdquo;
                </div>
              )}
            </div>

            {/* Choices */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-mono uppercase text-sky-800 font-bold tracking-wider block">
                Pilih Respons Kamu Sebagai Penjaga:
              </span>

              {currentNode.choices.map((choice, idx) => (
                <button
                  key={choice.id}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleSelectChoice(choice)}
                  className="w-full p-4 sm:p-5 rounded-2xl border border-sky-200 bg-white hover:bg-sky-50/60 hover:border-sky-400 hover:shadow-md transition-all flex items-start gap-4 text-left group shadow-xs"
                >
                  <span className="w-6 h-6 rounded-full border border-sky-300 bg-sky-50 flex items-center justify-center text-xs font-mono font-bold text-sky-700 group-hover:border-sky-500 group-hover:bg-sky-500 group-hover:text-white shrink-0 mt-0.5">
                    {idx + 1}
                  </span>

                  <div className="space-y-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-sky-950 leading-relaxed block">
                      {choice.label}
                    </span>
                    {choice.perspective_hint && (
                      <span className="text-[11px] font-mono text-slate-500 group-hover:text-sky-700 block font-medium">
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
          <div className="relative rounded-3xl aero-card p-6 sm:p-9 space-y-6 shadow-xl border-t-2 border-white">
            <BorderBeam size={280} duration={10} colorFrom="#A855F7" colorTo="#EC4899" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-300 text-xs font-mono font-bold text-purple-900 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span>Arketipe Penjaga: {ending.guardian_archetype}</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {ending.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-mono font-medium">
                {ending.summary}
              </p>
            </div>

            {/* Philosophical Reflection Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
              <span className="text-xs font-mono uppercase text-emerald-800 font-bold block">
                Refleksi Budaya Penjaga (Perspective Inversion):
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-mono italic font-medium">
                &ldquo;{ending.reflection}&rdquo;
              </p>
            </div>

            <div className="text-[11px] font-mono text-slate-500 font-bold">
              Kondisi akhir: {ending.condition_note}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-sky-100">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-sky-200 bg-white text-xs font-bold text-slate-700 hover:bg-sky-50 shadow-xs transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
                <span>Ulangi dengan Pendekatan Lain</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsBadgeModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-purple-300 bg-purple-100 text-xs font-bold text-purple-900 hover:bg-purple-200 transition-all shadow-sm"
                >
                  <Award className="w-3.5 h-3.5 text-purple-700" />
                  <span>Klaim Kartu Penjaga</span>
                </button>

                <Link
                  href="/lite"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl aero-btn-aqua text-white text-xs font-bold transition-all shadow-md active:scale-95"
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
