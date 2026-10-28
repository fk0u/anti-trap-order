"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Download,
  Share2,
  Copy,
  Check,
  X,
  Award,
  Sparkles,
  Flame,
  Star,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GuardianBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak?: number;
  xp?: number;
  rankTitle?: string;
  stageTitle?: string;
}

export function GuardianBadgeModal({
  isOpen,
  onClose,
  streak = 3,
  xp = 120,
  rankTitle = "Omega Guardian",
  stageTitle = "Kelayakan Refleks Penjaga Digital",
}: GuardianBadgeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [badgeId, setBadgeId] = useState("");

  useEffect(() => {
    // Generate deterministic session verification code
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    setBadgeId(`ATO-A20-${rand}`);
  }, [isOpen]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw high-resolution certificate card
    canvas.width = 1200;
    canvas.height = 675;

    // 1. Dark Background
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 675);
    bgGradient.addColorStop(0, "#0E131F");
    bgGradient.addColorStop(1, "#07090D");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 675);

    // 2. Cyber grid and border accent
    ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1140, 615);

    ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(45, 45, 1110, 585);

    // Decorative corner notches
    ctx.fillStyle = "#10B981";
    ctx.fillRect(26, 26, 16, 16);
    ctx.fillRect(1158, 26, 16, 16);
    ctx.fillRect(26, 633, 16, 16);
    ctx.fillRect(1158, 633, 16, 16);

    // 3. Top Tagline
    ctx.fillStyle = "#10B981";
    ctx.font = "bold 18px monospace";
    ctx.fillText("A20 CULTURE TECHNOLOGY // DIGITAL GUARDIAN SYSTEM", 80, 100);

    ctx.fillStyle = "#64748B";
    ctx.font = "16px monospace";
    ctx.fillText(`VERIFIKASI ID: ${badgeId}`, 880, 100);

    // 4. Main Title
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 48px sans-serif";
    ctx.fillText("SERTIFIKAT KELAYAKAN REFLEKS", 80, 175);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "20px sans-serif";
    ctx.fillText(
      "Diberikan sebagai bukti penguasaan analisis kritis rekayasa sosial dan pembalikan sudut pandang.",
      80,
      220
    );

    // 5. Guardian Card Box (Center)
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fillRect(80, 260, 1040, 220);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.strokeRect(80, 260, 1040, 220);

    // Sub-title & Status
    ctx.fillStyle = "#34D399";
    ctx.font = "bold 18px monospace";
    ctx.fillText("GELAR PENJAGA RUANG SIBER:", 120, 310);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText(rankTitle.toUpperCase(), 120, 365);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "18px sans-serif";
    ctx.fillText(`Spesialisasi: ${stageTitle}`, 120, 410);

    // Stat Boxes inside card
    ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
    ctx.fillRect(840, 290, 240, 160);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
    ctx.strokeRect(840, 290, 240, 160);

    ctx.fillStyle = "#10B981";
    ctx.font = "bold 16px monospace";
    ctx.fillText("DATA PRESTASI", 865, 330);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(`${xp} XP`, 865, 375);

    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(`Streak: ${streak} Hari`, 865, 415);

    // 6. Footer Disclaimer & Watermark
    ctx.fillStyle = "#64748B";
    ctx.font = "14px monospace";
    ctx.fillText(
      "Anti Trap Order (ATO) · Decision Support & Perspective Inversion Engine · ato.kousozo.tech",
      80,
      570
    );

    ctx.fillStyle = "#10B981";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("STATELESS & ZERO-DB VERIFIED", 880, 570);

    // Convert to PNG download
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `ATO-Guardian-Badge-${rankTitle.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  const shareText = `Saya baru saja menyelesaikan ujian refleks digital di Anti Trap Order (ATO) dengan gelar ${rankTitle} (${xp} XP, ${streak} Hari Streak). Latih refleksmu membedah trik penipuan online dari sudut pandang pelaku di: https://ato.kousozo.tech/drill`;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <canvas ref={canvasRef} className="hidden" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-lg w-full bg-[#0B0F17] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge Visual Card Preview */}
          <div className="relative rounded-2xl bg-gradient-to-tr from-[#0E131F] to-[#07090D] border border-emerald-500/30 p-6 space-y-4 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                A20 GUARDIAN CERTIFIED
              </span>
              <span className="text-text-muted">{badgeId}</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-text-muted">Gelar Penjaga:</span>
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Award className="w-6 h-6 text-emerald-400 shrink-0" />
                {rankTitle}
              </h3>
              <p className="text-xs text-text-muted font-mono">{stageTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 font-mono text-xs">
              <div className="flex items-center gap-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-text-muted">Latihan Aktif</div>
                  <div className="font-bold text-white">{streak} Hari Streak</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                <Star className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-text-muted">Reflex Score</div>
                  <div className="font-bold text-white">{xp} XP</div>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-text-muted text-center pt-1">
              100% Stateless &bull; Reverse Reflex Technology
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-[0_4px_0_#047857] active:shadow-none active:translate-y-1 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Kartu Badge (PNG Resolusi Tinggi)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold border border-white/10 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kirim ke WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold border border-white/10 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-text-muted" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
