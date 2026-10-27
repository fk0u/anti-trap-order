package reflect

import (
	"strings"
	"unicode"
)

// ManipulationVector represents psychological social engineering tactics detected via NLP
type ManipulationVector string

const (
	VectorUrgency       ManipulationVector = "urgency"
	VectorUpfrontFee    ManipulationVector = "upfront_fee"
	VectorImpersonation ManipulationVector = "impersonation"
	VectorIsolation     ManipulationVector = "isolation"
	VectorTooGood       ManipulationVector = "too_good_to_be_true"
)

// IndonesianSlangMap maps informal chat slang, abbreviations, and common typos to canonical stems
var IndonesianSlangMap = map[string]string{
	// Transaksi & Finansial
	"tf":         "transfer",
	"trf":        "transfer",
	"trsf":       "transfer",
	"transferan": "transfer",
	"rek":        "rekening",
	"rekk":       "rekening",
	"norek":      "rekening",
	"depo":       "deposit",
	"dpo":        "deposit",
	"topup":      "deposit",
	"byr":        "bayar",
	"byar":       "bayar",
	"dp":         "uang_muka",
	"pinjol":     "pinjaman_online",
	"pnjm":       "pinjam",
	"cair":       "pencairan_dana",
	"bunga":      "bunga_pinjaman",

	// Pekerjaan & Tugas
	"loker":     "lowongan_kerja",
	"lwngan":    "lowongan_kerja",
	"krja":      "kerja",
	"parttime":  "paruh_waktu",
	"freelance": "paruh_waktu",
	"komisi":    "komisi",
	"kms":       "komisi",
	"fee":       "komisi",
	"gaji":      "komisi",
	"sub":       "subscribe",
	"subs":      "subscribe",
	"likers":    "like",

	// Urgensi & Waktu
	"skrg":    "sekarang",
	"skrng":   "sekarang",
	"segera":  "segera",
	"sgra":    "segera",
	"buruan":  "segera",
	"cpt":     "cepat",
	"cepet":   "cepat",
	"hangus":  "hangus_kedaluwarsa",
	"exp":     "hangus_kedaluwarsa",
	"expired": "hangus_kedaluwarsa",
	"urgent":  "darurat",
	"drt":     "darurat",
	"limit":   "batas_waktu",

	// Komunikasi & Chat
	"wa":       "whatsapp",
	"tele":     "telegram",
	"tlg":      "tolong",
	"tlp":      "telepon",
	"telfon":   "telepon",
	"nomor":    "nomor_telepon",
	"no":       "nomor_telepon",
	"hp":       "nomor_telepon",
	"apk":      "unduh_aplikasi",
	"app":      "unduh_aplikasi",
	"aplikasi": "unduh_aplikasi",
	"link":     "tautan_link",
	"klik":     "tautan_link",

	// Hadiah & Giveaway
	"mng":      "menang",
	"mnang":    "menang",
	"giveaway": "giveaway_hadiah",
	"gw":       "giveaway_hadiah",
	"undian":   "giveaway_hadiah",
	"selamat":  "ucapan_selamat",
	"hadiah":   "giveaway_hadiah",
	"voucher":  "voucher_gratis",
	"kupon":    "voucher_gratis",

	// Relasi & Impersonasi
	"kk":   "kakak",
	"kak":  "kakak",
	"adek": "adik",
	"adk":  "adik",
	"temen": "teman",
	"tmn":  "teman",
	"bca":  "bank_bca",
	"bri":  "bank_bri",
	"bni":  "bank_bni",
	"mandiri": "bank_mandiri",
	"dana": "ewallet_dana",
	"gopay": "ewallet_gopay",
	"ovo":  "ewallet_ovo",
	"cs":   "customer_service",
	"hrd":  "hrd_perusahaan",
}

// N-Gram Pattern phrases indicative of manipulation vectors
var vectorPatterns = map[ManipulationVector][]string{
	VectorUrgency: {
		"sebelum hangus",
		"kuota terbatas",
		"hanya hari ini",
		"dalam 1 jam",
		"sekarang juga",
		"segera konfirmasi",
		"1x24 jam",
		"kesempatan terakhir",
		"batas waktu",
		"jangan tunda",
	},
	VectorUpfrontFee: {
		"transfer deposit",
		"biaya pendaftaran",
		"biaya aktivasi",
		"biaya admin",
		"modal awal",
		"transfer dulu",
		"uang jaminan",
		"bayar materai",
		"top up saldo member",
	},
	VectorImpersonation: {
		"ini nomor baru",
		"hp ku hilang",
		"pinjam nomor rekening",
		"customer service resmi",
		"tim verifikasi akun",
		"selamat nomor anda terpilih",
		"kami dari hrd",
		"dari pihak shopee",
		"dari pihak whatsapp",
	},
	VectorIsolation: {
		"jangan beritahu siapa-siapa",
		"transaksi rahasia",
		"jangan bilang orang rumah",
		"khusus untuk kamu saja",
		"konfirmasi pribadi",
	},
	VectorTooGood: {
		"gaji jutaan per hari",
		"kerja santai modal like",
		"hanya like dan subscribe",
		"tanpa jaminan langsung cair",
		"tanpa bunga tanpa ribet",
		"hadiah ratusan juta",
	},
}

// NLPTokenize normalizes raw Indonesian text, expands slang, and returns canonical tokens
func NLPTokenize(text string) []string {
	var b strings.Builder
	for _, r := range strings.ToLower(text) {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || unicode.IsSpace(r) {
			b.WriteRune(r)
		} else {
			b.WriteRune(' ')
		}
	}

	rawTokens := strings.Fields(b.String())
	canonicalTokens := make([]string, 0, len(rawTokens))

	for _, token := range rawTokens {
		if canonical, exists := IndonesianSlangMap[token]; exists {
			canonicalTokens = append(canonicalTokens, canonical)
		} else {
			canonicalTokens = append(canonicalTokens, token)
		}
	}

	return canonicalTokens
}

// DetectManipulationVectors scans the normalized text for social engineering n-gram patterns
func DetectManipulationVectors(text string) []ManipulationVector {
	norm := NormalizeText(text)
	var detected []ManipulationVector

	for vec, patterns := range vectorPatterns {
		for _, p := range patterns {
			if strings.Contains(norm, p) {
				detected = append(detected, vec)
				break
			}
		}
	}

	return detected
}
