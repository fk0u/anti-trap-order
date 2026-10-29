"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Send,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Check,
  Copy,
  Terminal,
  Eye,
  Briefcase,
  CreditCard,
  Package,
  FileCode,
  Heart,
  Share2,
} from "lucide-react";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "scammer" | "user" | "system";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  attachment?: {
    type: "apk" | "invoice" | "card";
    title: string;
    subtitle: string;
    size?: string;
  };
}

interface ScenarioContact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  category: string;
  threatLevel: "Tinggi" | "Kritis" | "Sedang";
  initialMessage: string;
  attachment?: Message["attachment"];
  quickReplies: string[];
}

const SCENARIOS: ScenarioContact[] = [
  {
    id: "job_scam",
    name: "Kak Sarah - HRD Global Media",
    role: "Freelance Recruiter & Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    phone: "+62 821-4452-9901",
    category: "Lowongan Kerja WFH",
    threatLevel: "Tinggi",
    initialMessage: "Halo kak! Kami dari PT Global Media Nusantara membuka loker freelance Admin Chat & Review Google Maps WFH. Gaji Rp450rb - Rp700rb/hari langsung cair sore ini. Apakah kakak berminat?",
    quickReplies: [
      "Boleh minta info alamat kantor fisik & surat legalitas PT?",
      "Apakah ada biaya pendaftaran atau seragam di awal?",
      "Tugasnya persisnya seperti apa ya kak?",
      "Kenapa rekrutmen perusahaan resmi pakai WhatsApp nomor pribadi?"
    ]
  },
  {
    id: "bank_freeze",
    name: "BCA Customer Care VIP",
    role: "Pemberitahuan Sistem Otomatis",
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&h=100&fit=crop&crop=faces",
    phone: "+62 811-9876-002",
    category: "Rekening Dibekukan",
    threatLevel: "Kritis",
    initialMessage: "PEMBERITAHUAN RESMI: Rekening Anda terindikasi transaksi mencurigakan dan akan DIBEKUKAN dalam 1x24 jam. Segera verifikasi data tarif dan identitas melalui tautan resmi sebelum sistem auto-blockir.",
    quickReplies: [
      "Saya akan konfirmasi langsung ke nomor HaloBCA 1500888 resmi.",
      "Kenapa notifikasi resmi bank dikirim dari nomor GSM WhatsApp?",
      "Boleh sebutkan 4 digit terakhir nomor rekening saya yang dibekukan?",
      "Saya tidak pernah mengajukan perubahan tarif apapun."
    ]
  },
  {
    id: "cod_scam",
    name: "Andi - Kurir J&T Express",
    role: "Kurir Lapangan Rute 04",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    phone: "+62 857-3312-8871",
    category: "Paket COD Fiktif",
    threatLevel: "Sedang",
    initialMessage: "Pagi kak, saya kurir di depan pagar rumah antar paket COD senilai Rp185.000 atas nama pemilik rumah. Boleh minta tolong dibuka pagarnya atau ditransfer sekarang ya kak?",
    attachment: {
      type: "invoice",
      title: "Resi Tagihan COD: #JT-992184-ID",
      subtitle: "Barang: Set Perawatan Wajah Premium (Tagihan: Rp185.000)",
      size: "COD Fee Rp185.000"
    },
    quickReplies: [
      "Saya dan keluarga sama sekali tidak merasa pesan barang COD ini.",
      "Tolong foto label pengirim dan marketplace asalnya.",
      "Jangan bayar dulu, saya cek riwayat pesanan di akun e-commerce saya.",
      "Kalau saya tolak, silakan lakukan retur ke pengirim ya mas."
    ]
  },
  {
    id: "apk_wedding",
    name: "Dika (Teman Sekolah)",
    role: "Kontak Kontak WhatsApp",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
    phone: "+62 813-2290-7711",
    category: "Malware File .APK",
    threatLevel: "Kritis",
    initialMessage: "Halo bro/sis, mohon maaf mengabari mendadak 🙏 Minggu depan aku mau nikah, ini surat undangan digitalnya yaa: mohon doa restu dan kehadirannya!",
    attachment: {
      type: "apk",
      title: "Surat_Undangan_Pernikahan_Digital.apk",
      subtitle: "Aplikasi Android Berbahaya &bull; Mencuri SMS/OTP",
      size: "4.8 MB"
    },
    quickReplies: [
      "Kok format undangannya .APK bukan link website atau PDF?",
      "Coba telepon suara dulu bro, mau ngobrol langsung.",
      "Hati-hati HP kamu kena bajak malware APK nih.",
      "Saya pakai iPhone jadi gak bisa buka file APK Android."
    ]
  },
  {
    id: "crypto_dating",
    name: "Jessica (Investor & Trader)",
    role: "Kenalan Dating App",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    phone: "+62 812-7711-4432",
    category: "Romansa & Crypto (Pig Butchering)",
    threatLevel: "Tinggi",
    initialMessage: "Halo kak, senang bisa ngobrol lagi. Aku baru selesai cek profit trading crypto sore ini dapet 15% hehe. Kakak sendiri biasanya investasi di instrumen apa?",
    quickReplies: [
      "Platform trading yang kamu pakai berizin Bappebti gak?",
      "Saya lebih nyaman investasi di reksadana dan emas fisik.",
      "Kenapa kamu sangat antusias ngajak orang lain ikut deposit?",
      "Boleh sharing portofolio resmi atau kamu cuma dapet komisi referral?"
    ]
  }
];

export default function RealmulatorPage() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioContact>(SCENARIOS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isActionCardOpen, setIsActionCardOpen] = useState<boolean>(false);
  const [detectedTraps, setDetectedTraps] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize or reset chat when scenario changes
  useEffect(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const initialMsgs: Message[] = [
      {
        id: "msg-0",
        sender: "scammer",
        text: selectedScenario.initialMessage,
        time: timeStr,
        attachment: selectedScenario.attachment
      }
    ];

    setMessages(initialMsgs);
    setDetectedTraps([selectedScenario.category, "Umpan Awal"]);
    setIsActionCardOpen(false);
  }, [selectedScenario]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Send user message and fetch AI reply
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      time: timeStr,
      status: "read"
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText("");
    setIsTyping(true);

    // Trap Detection Heuristics based on conversation
    const lower = textToSend.toLowerCase();
    const newTraps = [...detectedTraps];
    if (lower.includes("biaya") || lower.includes("seragam") || lower.includes("bayar")) {
      if (!newTraps.includes("Pungutan Di Depan")) newTraps.push("Pungutan Di Depan");
    }
    if (lower.includes("buru") || lower.includes("cepat") || lower.includes("segera")) {
      if (!newTraps.includes("Tekanan Waktu")) newTraps.push("Tekanan Waktu");
    }
    if (lower.includes("kantor") || lower.includes("legalitas") || lower.includes("resmi")) {
      if (!newTraps.includes("Verifikasi Otoritas")) newTraps.push("Verifikasi Otoritas");
    }
    setDetectedTraps(newTraps);

    try {
      const response = await fetch("/api/realmulator/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          messages: nextMessages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiReply = data.reply;

        const replyTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        const scammerMsg: Message = {
          id: `scam-${Date.now()}`,
          sender: "scammer",
          text: aiReply,
          time: replyTime
        };
        setMessages((prev) => [...prev, scammerMsg]);
      }
    } catch (err) {
      console.error("AI chat error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyWarningTemplate = () => {
    const warningText = `[PERINGATAN DINI // ATO REFLEX] Waspada modus "${selectedScenario.category}" mengatasnamakan "${selectedScenario.name}". Pelaku memancing dengan pesan: "${selectedScenario.initialMessage}". Celah taktik: jangan pernah transfer biaya di muka atau instal file sebelum verifikasi kanal resmi!`;
    navigator.clipboard?.writeText(warningText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] bg-eco-grid text-slate-800 pb-28 md:pb-12 selection:bg-cyan-200 selection:text-cyan-900">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/90 aero-glass px-4 sm:px-8 py-3 shadow-[0_4px_24px_rgba(186,230,253,0.35)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-200 bg-white/80 text-xs font-bold text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-white transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sky-600" />
              <span>[ ATO ]</span>
            </Link>

            <span className="text-sky-300 hidden sm:inline">|</span>

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-slate-900">A20 Realmulator</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase candy-badge text-sky-800">
                [ AI REAL-WORLD CHAT ]
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsActionCardOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full aero-btn-emerald text-xs font-bold text-white shadow-md"
            >
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>Bongkar Modus</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Realmulator OS Arena */}
      <main className="max-w-6xl mx-auto px-2 sm:px-6 py-4 sm:py-8">
        {/* Main Messenger Window Shell */}
        <div className="relative rounded-3xl aero-card overflow-hidden shadow-[0_24px_60px_-10px_rgba(14,165,233,0.25)] border-white flex flex-col lg:flex-row h-[calc(100vh-140px)] min-h-[640px]">
          <BorderBeam duration={18} borderWidth={1.5} colorFrom="#0284C7" colorTo="#10B981" />

          {/* Left Sidebar: Contacts & Scenarios */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-sky-100 bg-white/70 backdrop-blur-xl flex flex-col shrink-0">
            {/* Sidebar Top: Search & Category */}
            <div className="p-4 border-b border-sky-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                  Target Modus Aktif
                </span>
              </div>
              <span className="text-[10px] font-mono text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200 font-bold">
                5 Skenario
              </span>
            </div>

            {/* Contacts Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-sky-100/60 p-2 space-y-1">
              {SCENARIOS.map((sc) => {
                const isSelected = selectedScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenario(sc)}
                    className={cn(
                      "w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 relative",
                      isSelected
                        ? "bg-sky-100/80 border border-sky-300/80 shadow-sm"
                        : "hover:bg-sky-50/70 text-slate-700"
                    )}
                  >
                    <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-sky-200 shadow-sm">
                      <img src={sc.avatar} alt={sc.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn("text-xs font-bold truncate", isSelected ? "text-sky-950 font-extrabold" : "text-slate-800")}>
                          {sc.name}
                        </span>
                        <span className="text-[9px] font-mono text-sky-600 shrink-0 font-medium">Baru saja</span>
                      </div>

                      <div className="text-[11px] text-slate-500 truncate font-medium">
                        {sc.category}
                      </div>
                      <span className="inline-block mt-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                        Bahaya: {sc.threatLevel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Arena: Active Messenger Chat */}
          <div className="flex-1 flex flex-col bg-sky-50/40 relative overflow-hidden">
            {/* Window Top Titlebar */}
            <div className="p-3.5 sm:p-4 border-b border-sky-100 aero-glass flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-sky-200 shadow-sm">
                  <img src={selectedScenario.avatar} alt={selectedScenario.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {selectedScenario.name}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 uppercase font-bold">
                      {selectedScenario.threatLevel} Threat
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 font-medium">
                    <span>{selectedScenario.phone}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-600 font-bold">
                      {isTyping ? "Sedang mengetik..." : "Online"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-full aero-pill">
                  {detectedTraps.map((trap, idx) => (
                    <span key={idx} className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full candy-badge text-sky-800">
                      [{trap}]
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsActionCardOpen(true)}
                  className="p-2 rounded-full border border-sky-200 bg-white/80 text-sky-700 hover:text-sky-900 hover:bg-white shadow-sm"
                  title="Analisis Celah"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Disclaimer Watermark Header */}
              <div className="text-center my-2">
                <span className="inline-block px-3.5 py-1 rounded-full bg-white/80 border border-sky-200 text-[10px] font-mono font-medium text-slate-500 shadow-sm">
                  Simulasi Rekayasa Sosial &bull; Respons didukung AI Gemini Web
                </span>
              </div>

              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col max-w-[85%] sm:max-w-[70%]",
                      isUser ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "p-3.5 sm:p-4 rounded-2xl relative shadow-md",
                        isUser
                          ? "phoning-bubble-outgoing text-white"
                          : "phoning-bubble-incoming text-slate-900"
                      )}
                    >
                      {/* Attachment Card if present */}
                      {msg.attachment && (
                        <div className="mb-3 p-3 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center gap-3 shadow-inner">
                          <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-300">
                            {msg.attachment.type === "apk" ? <FileCode className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {msg.attachment.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-600 block truncate font-medium">
                              {msg.attachment.subtitle}
                            </span>
                          </div>
                          {msg.attachment.size && (
                            <span className="text-[9px] font-mono text-sky-800 shrink-0 font-bold bg-sky-100 px-1.5 py-0.5 rounded">
                              {msg.attachment.size}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.text}
                      </p>

                      <div className={cn(
                        "mt-1 flex items-center justify-end gap-1 text-[9px] font-mono",
                        isUser ? "text-sky-100" : "text-slate-400"
                      )}>
                        <span>{msg.time}</span>
                        {isUser && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing Animation */}
              {isTyping && (
                <div className="flex items-center gap-2 p-3 rounded-2xl phoning-bubble-incoming w-24">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Tactical Pills */}
            <div className="px-4 py-2 border-t border-sky-100 bg-white/70 overflow-x-auto flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono text-sky-800 uppercase shrink-0 font-bold">
                [ Taktik Balasan ]:
              </span>
              {selectedScenario.quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isTyping}
                  onClick={() => handleSendMessage(reply)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-medium text-slate-700 bg-white border border-sky-200 hover:border-sky-400 hover:text-sky-800 hover:bg-sky-50/50 shadow-sm transition-all text-left whitespace-nowrap"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-sky-100 aero-glass flex items-center gap-2 shrink-0 shadow-sm">
              <input
                type="text"
                value={inputText}
                disabled={isTyping}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputText);
                  }
                }}
                placeholder={`Balas pesan ${selectedScenario.name}...`}
                className="flex-1 rounded-full px-4 py-3 bg-white border border-sky-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all font-mono shadow-inner"
              />

              <button
                type="button"
                disabled={!inputText.trim() || isTyping}
                onClick={() => handleSendMessage(inputText)}
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center aero-btn-aqua disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Action Card Modal (Bongkar Modus) */}
      <AnimatePresence>
        {isActionCardOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-xl aero-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden border-white"
            >
              <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-extrabold text-slate-900 tracking-wide">
                    ACTION CARD // BONGKAR MODUS PELAKU
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActionCardOpen(false)}
                  className="w-8 h-8 rounded-full border border-sky-200 bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center shadow-sm"
                >
                  ✕
                </button>
              </div>

              {/* Modus Analysis */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5 shadow-sm">
                  <span className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider block">
                    Modus Terdeteksi: {selectedScenario.category}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-mono font-medium">
                    Pelaku memanfaatkan manipulasi psikologis agar korban mengambil keputusan terburu-buru sebelum sempat memverifikasi ke kanal resmi.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-sky-100 space-y-2 shadow-sm">
                  <span className="text-xs font-mono font-bold text-sky-800 uppercase tracking-wider block">
                    Langkah Proteksi Mandiri:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-mono font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">1.</span>
                      <span>Jangan pernah transfer uang di awal untuk alasan seragam, verifikasi, atau biaya pendaftaran kerja.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">2.</span>
                      <span>Jangan instal file berakhiran .APK di ponsel Android Anda.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">3.</span>
                      <span>Konfirmasi ke nomor resmi bank atau pengirim asli sebelum melakukan tindakan apapun.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Ready to share warning copy */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-600 uppercase tracking-wider block font-bold">
                  Format Pesan Peringatan untuk Dibagikan ke Grup:
                </span>
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs font-mono text-slate-800 leading-relaxed italic shadow-inner">
                  &ldquo;Waspada modus {selectedScenario.category} mengatasnamakan {selectedScenario.name}. Pelaku memancing dengan imbalan tidak wajar / urgensi palsu. Tetap tenang dan jangan kirim biaya apapun!&rdquo;
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyWarningTemplate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold aero-btn-emerald text-white shadow-md"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Tersalin ke Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white" />
                      <span>Salin Pesan Peringatan</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsActionCardOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold border border-sky-200 bg-white text-slate-700 hover:bg-sky-50 shadow-sm"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
