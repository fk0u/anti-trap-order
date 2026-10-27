"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Sparkles,
  Lock,
  AlertTriangle,
  Heart,
  Eye,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Zap,
} from "lucide-react";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { GradientText } from "@/components/ui/GradientText";
import { cn } from "@/lib/utils";

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-[#07090D] text-[#F5F7FA] selection:bg-[#10B981]/20 selection:text-[#22D3EE]">
      {/* Top Navigation */}
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
              <span className="font-bold text-sm tracking-wide">Tentang ATO</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                A20 Philosophy
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs text-text-muted hover:text-white transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dokumentasi & API</span>
            </Link>

            <Link
              href="/lite"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-all shadow-md active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Mulai A20 Lite</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        {/* Hero Section */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Culture Technology for Digital Guardians</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Menjadikan Kewaspadaan Digital sebagai Refleks Budaya
          </h1>

          <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
            Anti Trap Order (ATO) bukan detektor penipuan otomatis dan bukan chatbot ceramah. ATO adalah sistem latihan mental untuk membentuk identitas anak muda Indonesia sebagai penjaga di ruang siber.
          </p>
        </div>

        {/* 1. Filosofi A20 & Lee Soo-man */}
        <section className="relative p-6 sm:p-9 rounded-3xl border border-white/10 bg-[#0B0F17] space-y-5">
          <BorderBeam size={260} duration={14} colorFrom="#10B981" colorTo="#22D3EE" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              01 &bull; Fondasi Konseptual
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Inspirasi Culture Technology (Lee Soo-man)
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-text-muted leading-relaxed font-mono">
            <p>
              Di industri hiburan, Lee Soo-man (pendiri SM Entertainment) tidak sekadar mencari bakat yang sudah jadi. Ia merancang sistem produksi budaya (*Culture Technology*): dari pemilihan talenta mentah (**Alpha**), pelatihan insting intensif, pembentukan persona, hingga sang artis memiliki pengaruh budaya luas yang matang (**Omega**).
            </p>
            <p>
              Kami menerapkan logika yang sama ke ranah keamanan siber anak muda. Kebanyakan aplikasi memperlakukan manusia sebagai &ldquo;korban pasif&rdquo; yang harus dipagari. Anti Trap Order membalik logika itu: <strong className="text-white">manusia diperlakukan sebagai bahan baku penjaga</strong> yang dilatih refleksnya dari keraguan pertama (Alpha di A20 Lite) hingga memiliki tanggung jawab sosial menjaga orang-orang terdekatnya (Omega di A20 Soul).
            </p>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-2">
            <h3 className="text-sm font-semibold text-white">Makna &ldquo;Order&rdquo; (Tatanan Orde)</h3>
            <p className="text-xs text-text-muted leading-relaxed font-mono">
              Kata &ldquo;Order&rdquo; terinspirasi dari penggunaan kata &ldquo;orde&rdquo; dalam tatanan sosiologis Indonesia. Kami memimpikan tatanan baru di mana generasi muda tidak lagi gugup saat menerima chat manipulatif, melainkan refleks membedah motif pelaku dan melindungi sesama.
            </p>
          </div>
        </section>

        {/* 2. Perspective Inversion Machine */}
        <section className="p-6 sm:p-9 rounded-3xl border border-white/10 bg-[#0B0F17] space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
              02 &bull; Mesin Berpikir
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Perspective Inversion (Pembalikan Sudut Pandang)
          </h2>

          <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-mono">
            Ketika orang ditanya &ldquo;Apakah pesan ini penipuan?&rdquo;, mereka cenderung menebak-nebak atau mencari pembenaran. Namun ketika mereka dipaksa bertanya:
          </p>

          <div className="p-4 rounded-2xl bg-white/[0.03] border-l-4 border-l-emerald-500 font-mono text-xs sm:text-sm text-emerald-300 italic leading-relaxed">
            &ldquo;Kalau kamu pelaku penipuan ini, celah apa yang sedang kamu manfaatkan dari korban agar mereka buru-buru transfer uang?&rdquo;
          </div>

          <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-mono">
            Saat itu juga, nalar kritis aktif. Mereka melihat urgensi palsu, rekening perorangan, dan biaya aktivasi bukan sebagai kebetulan, melainkan sebagai jebakan terencana.
          </p>
        </section>

        {/* 3. Batasan Radikal Jujur (Radical Limitations) */}
        <section className="p-6 sm:p-9 rounded-3xl border border-white/10 bg-[#0B0F17] space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              03 &bull; Batasan Jujur & Transparansi
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Yang ATO Tidak Bisa (dan Tidak Boleh) Lakukan
          </h2>

          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Kami menolak segala bentuk *security theater* atau klaim palsu yang meninabobokan publik:
          </p>

          <div className="grid gap-3 text-xs sm:text-sm font-mono">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-text-muted">
                <strong className="text-white">ATO tidak bisa mengembalikan dana</strong> yang sudah kamu transfer ke rekening penipu. Pencegahan sebelum transfer adalah kunci mutlak.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-text-muted">
                <strong className="text-white">ATO tidak menggantikan verifikasi resmi.</strong> Jika mengatasnamakan bank atau pihak instansi, telepon selalu call center resmi yang tertera di kartu ATM atau website berbadan hukum.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-text-muted">
                <strong className="text-white">ATO menolak mengeluarkan skor angka seperti &ldquo;89% aman&rdquo;.</strong> Rekayasa sosial bersifat psikologis dan dinamis; menyederhanakannya jadi angka persentase justru memberi rasa aman palsu.
              </span>
            </div>
          </div>
        </section>

        {/* 4. Invarian Privasi Tanpa Kompromi */}
        <section className="p-6 sm:p-9 rounded-3xl border border-white/10 bg-[#0B0F17] space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-teal">
              04 &bull; Komitmen Privasi
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Stateless Privacy by Design
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono text-text-muted">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white">Tanpa Login & Registrasi</h3>
              <p>Kamu tidak butuh membuat akun, memasukkan email, atau login Google untuk menggunakan seluruh fitur ATO.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <Shield className="w-4 h-4 text-brand-teal" />
              <h3 className="font-semibold text-white">Zero Body Logging</h3>
              <p>Server backend Go kami dirancang stateless total: tidak ada database, cookie pelacak, maupun pencatatan isi pesan yang kamu tempelkan.</p>
            </div>
          </div>
        </section>

        {/* 5. Tim & Hackathon Context */}
        <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div>
            <span className="text-text-muted block text-[10px] uppercase">Konteks Proyek</span>
            <span className="font-bold text-white">MIT-Week 2026 &bull; Guardians of the Digital Space</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] transition-all"
            >
              <span>Spesifikasi & Outline</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/lite"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition-all shadow-md active:scale-95"
            >
              <span>Buka A20 Lite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
