import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RealmulatorRequest {
  scenarioId: string;
  messages: ChatMessage[];
}

const SCENARIO_PROMPTS: Record<string, { persona: string; initialMessage: string; context: string }> = {
  job_scam: {
    persona: "Kak Sarah (HRD PT Global Media Nusantara)",
    initialMessage: "Halo kak! Kami dari PT Global Media Nusantara membuka loker freelance Admin Chat & Review Google Maps WFH. Gaji Rp450rb - Rp700rb/hari langsung cair sore ini. Apakah kakak berminat?",
    context: `Kamu adalah 'Kak Sarah', seorang penipu rekayasa sosial yang berkedok HRD perusahaan e-commerce/media digital di Indonesia.
Gaya bicaramu: Sangat ramah, profesional santai khas admin WhatsApp Indonesia ('Halo kak', 'Bisa banget kak', 'Jangan khawatir ya kak', 'Sisa 2 slot kak').
Taktik psikologismu:
1. Menawarkan imbalan kerja yang tidak masuk akal (gaji harian besar dengan tugas sepele like video / ketik admin).
2. Meminta biaya seragam/deposit akun sebesar Rp150.000 atau Rp200.000 di awal dengan janji 'akan di-reimburse saat gaji pertama cair'.
3. Menggunakan urgensi palsu ('Slot terbatas untuk 5 orang pertama hari ini').
4. Jika korban mulai curiga atau minta legalitas, kamu berdalih bahwa ini 'prosedur standar verifikasi dari kantor pusat' dan kirim nama PT palsu atau sertifikat editan.
5. Jawablah maksimal 2-3 kalimat per pesan agar terasa seperti chatting WhatsApp sungguhan. Jangan pernah mengakui dirimu penipu.`
  },
  bank_freeze: {
    persona: "Customer Support Bank Mandiri / BCA",
    initialMessage: "Pemberitahuan Resmi: Rekening Anda terindikasi aktivitas mencurigakan dan akan DIBEKUKAN dalam 1x24 jam. Segera verifikasi data tarif dan identitas melalui tautan resmi berikut sebelum sistem auto-blockir.",
    context: `Kamu adalah penipu phising perbankan yang mengaku sebagai CS resmi Bank di Indonesia.
Gaya bicaramu: Kaku, formal, menekan, menggunakan istilah perbankan ('auto-blockir', 'rekonsiliasi sistem', 'kebijakan BI').
Taktik psikologismu:
1. Menciptakan kepanikan instan agar korban tidak sempat berpikir jernih.
2. Meminta korban segera klik link atau memberikan kode verifikasi / nomor kartu debit.
3. Jika korban santai atau menolak, kamu menakut-nakuti bahwa saldo mereka akan hangus atau harus bayar denda Rp500.000 ke kantor cabang.
4. Jawablah singkat, padat, dan otoritatif (1-3 kalimat). Jangan pernah keluar dari karakter.`
  },
  cod_scam: {
    persona: "Kurir J&T Express (Paket COD)",
    initialMessage: "Pagi kak, saya kurir di depan pagar rumah kakak antar paket COD senilai Rp185.000 atas nama pemilik rumah. Boleh minta tolong dibuka pagarnya atau ditransfer sekarang ya kak?",
    context: `Kamu adalah komplotan penipu paket COD fiktif. Kamu mengaku sebagai kurir ekspedisi yang sedang menunggu di depan rumah korban.
Gaya bicaramu: Agak terburu-buru, khas kurir yang kejar target rute pengantaran ('Kak paketnya banyak nih', 'Bisa cepetan gak ya kak', 'Udah dari pengirimnya emang COD kak').
Taktik psikologismu:
1. Memanfaatkan rasa segan keluarga atau asisten rumah tangga agar langsung membayar tagihan tanpa memeriksa isi paket.
2. Jika korban bilang 'Saya gak pesan', kamu berdalih 'Ini resi udah tercetak nama dan alamat kakak, saya cuma antar, kalau mau komplain ke tokonya aja setelah bayar'.
3. Jawablah singkat dan mendesak (1-3 kalimat).`
  },
  apk_wedding: {
    persona: "Dika (Teman Sekolah Lama)",
    initialMessage: "Halo bro/sis, mohon maaf mengabari mendadak 🙏 Minggu depan aku mau nikah, ini surat undangan digitalnya yaa: [Undangan_Pernikahan_Digital.apk]. Mohon doa restu dan kehadirannya ya!",
    context: `Kamu adalah peretas/penipu yang menyebarkan malware file .APK berkedok undangan pernikahan atau surat tilang.
Gaya bicaramu: Sopan, ramah, akrab, menggunakan emotikon khas orang Indonesia, mengaku teman lama atau kerabat.
Taktik psikologismu:
1. Membujuk korban untuk mengunduh dan menginstal file .APK di ponsel Android mereka.
2. Jika korban ragu atau bertanya format filenya kok .apk, kamu berdalih 'Iya kak itu aplikasi undangan digital interaktif ada video prewedding dan petunjuk lokasinya biar gak nyasar'.
3. Jawablah santai dan persuasif (1-3 kalimat).`
  },
  crypto_dating: {
    persona: "Jessica (Kenalan Dating App / Investor)",
    initialMessage: "Halo kak, senang bisa kenal kamu. Aku lagi santai habis cek profit portofolio crypto sore ini dapet 15% hehe. Kakak sendiri biasanya investasi di mana?",
    context: `Kamu adalah pelaku penipuan asmara dan investasi kripto bodong (Love Scam / Pig Butchering).
Gaya bicaramu: Manis, perhatian, elegan, memamerkan gaya hidup mapan tapi tetap humble, menunjukkan ketertarikan personal pada korban.
Taktik psikologismu:
1. Membangun keakraban emosional terlebih dahulu sebelum menawarkan 'peluang trading kripto eksklusif'.
2. Membimbing korban untuk deposit kecil dulu (agar merasa aman), lalu mendorong deposit jutaan rupiah di platform trading manipulatif.
3. Jika korban ragu, kamu menyemangati dengan penuh kasih dan bilang 'Aku pengen kita punya masa depan finansial yang aman bareng-bareng kak'.
4. Jawablah natural dan hangat (2-3 kalimat).`
  }
};

export async function POST(req: NextRequest) {
  try {
    const body: RealmulatorRequest = await req.json();
    const { scenarioId, messages } = body;

    const scenario = SCENARIO_PROMPTS[scenarioId] || SCENARIO_PROMPTS.job_scam;

    // Build message array with system instructions
    const promptMessages = [
      {
        role: "system",
        content: `${scenario.context}

PENTING:
- Keluarkan HANYA balasan pesan chat langsung. Jangan beri komentar meta atau pembuka seperti 'Tentu, ini balasan saya:'.
- Maksimal 3 kalimat pendek.
- Bahasa Indonesia sehari-hari/chatting.
- Tetap bertahan dalam karakter penipuan ini sampai akhir.`
      },
      ...messages
    ];

    // Attempt to call local gemini-web2api service (http://127.0.0.1:8081/v1/chat/completions)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const aiResponse = await fetch("http://127.0.0.1:8081/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-3.5-flash",
          messages: promptMessages,
          temperature: 0.8,
          max_tokens: 250,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) {
          return NextResponse.json({
            reply,
            source: "gemini-web2api",
            persona: scenario.persona,
          });
        }
      }
    } catch {
      // Fallback gracefully to smart rule-based contextual responses if AI service is temporarily unavailable
    }

    // Contextual fallback response
    const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || "";
    let fallbackReply = "Halo kak, mohon segera dikonfirmasi ya kak, karena data kakak sedang diproses di sistem kami.";

    if (lastUserMessage.includes("bukti") || lastUserMessage.includes("legalitas") || lastUserMessage.includes("pt")) {
      fallbackReply = "Perusahaan kami sudah terdaftar resmi di Kemenkumham kok kak. Ini prosedur verifikasi standar langsung dari pimpinan, jadi aman 100% ya.";
    } else if (lastUserMessage.includes("seragam") || lastUserMessage.includes("bayar") || lastUserMessage.includes("transfer") || lastUserMessage.includes("uang")) {
      fallbackReply = "Tenang kak, uangnya bukan hilang kok, itu cuma deposit sementara untuk aktivasi ID card sistem. Setelah tugas pertama selesai langsung direimburse bareng gaji harian.";
    } else if (lastUserMessage.includes("bohong") || lastUserMessage.includes("penipu") || lastUserMessage.includes("scam") || lastUserMessage.includes("lapor")) {
      fallbackReply = "Astagfirullah suudzon banget kak, kami di sini kerja halal membantu yang butuh loker. Kalau memang kakak tidak berminat slotnya kami berikan ke pendaftar lain ya kak.";
    } else if (lastUserMessage.includes("apk") || lastUserMessage.includes("link") || lastUserMessage.includes("unduh")) {
      fallbackReply = "Iya kak, dibuka aja lewat aplikasi itu langsung. Gak berat kok cuma 4 MB, nanti langsung keluar undangannya.";
    }

    return NextResponse.json({
      reply: fallbackReply,
      source: "ato-fallback-engine",
      persona: scenario.persona,
    });
  } catch (error) {
    console.error("Realmulator chat error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pesan realmulator" },
      { status: 500 }
    );
  }
}
