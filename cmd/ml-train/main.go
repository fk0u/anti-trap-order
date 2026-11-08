// ml-train melatih model Naive Bayes dari data/ml/train.csv, menulis internal/ml/model.json dan data/ml/report.md.
package main

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"math"
	"math/rand/v2"
	"os"
	"sort"
	"strings"

	"prototype-ato/internal/data"
	"prototype-ato/internal/ml"
)

// minSpread: token dengan selisih log-likelihood antar kelas di bawah ini dibuang agar model.json < 300 KB.
const (
	minSpread   = 1.0
	catSpread   = 1.6
	tacMinCount = 6 // token taktik yang muncul < 6 kali diabaikan (mengurangi noise dan ukuran)
)

type row struct {
	ID, Text, Style, Category string
	Tactics                   []string
}

func (r row) has(t string) bool {
	for _, x := range r.Tactics {
		if x == t {
			return true
		}
	}
	return false
}

func die(err error) {
	fmt.Fprintln(os.Stderr, err)
	os.Exit(1)
}

func readCSV(path string) []row {
	fh, err := os.Open(path)
	if err != nil {
		die(err)
	}
	defer fh.Close()
	recs, err := csv.NewReader(fh).ReadAll()
	if err != nil {
		die(fmt.Errorf("%s: %w", path, err))
	}
	var out []row
	for _, r := range recs[1:] {
		x := row{ID: r[0], Text: r[1], Style: r[2], Category: r[3]}
		if r[4] != "" {
			x.Tactics = strings.Split(r[4], "|")
		}
		out = append(out, x)
	}
	return out
}

// prune membuang token yang total kemunculannya < 2; mengembalikan dokumen dan ukuran kosakata.
func prune(docs [][]string) ([][]string, int) {
	cnt := map[string]int{}
	for _, d := range docs {
		for _, t := range d {
			cnt[t]++
		}
	}
	vocab := 0
	for _, c := range cnt {
		if c >= 2 {
			vocab++
		}
	}
	out := make([][]string, len(docs))
	for i, d := range docs {
		for _, t := range d {
			if cnt[t] >= 2 {
				out[i] = append(out[i], t)
			}
		}
	}
	return out, vocab
}

func yesNo(rows []row, t string) []string {
	l := make([]string, len(rows))
	for i, r := range rows {
		l[i] = "no"
		if r.has(t) {
			l[i] = "yes"
		}
	}
	return l
}

func tokensOf(rows []row) [][]string {
	d := make([][]string, len(rows))
	for i, r := range rows {
		d[i] = ml.Tokenize(r.Text)
	}
	return d
}

// build melatih seluruh model pada rows (threshold taktik diisi caller).
func build(rows []row) *ml.Model {
	docs, v := prune(tokensOf(rows))
	m := &ml.Model{
		Version: "1", TokenizerVersion: ml.TokenizerVersion,
		Labels:    ml.Labels{Categories: ml.CategoryIDs, Tactics: ml.TacticIDs},
		Tactics:   map[string]ml.Classifier{},
		VocabSize: v,
		Unknown:   map[string]map[string]float64{},
	}
	cats := make([]string, len(rows))
	for i, r := range rows {
		cats[i] = r.Category
	}
	m.Category, m.Unknown["category"] = ml.Train(docs, cats, ml.CategoryIDs, v, 2)
	m.Category.Prune(m.Unknown["category"], catSpread)
	for _, t := range ml.TacticIDs {
		c, u := ml.Train(docs, yesNo(rows, t), []string{"yes", "no"}, v, tacMinCount)
		c.Prune(u, minSpread)
		m.Tactics[t], m.Unknown[t] = c, u
	}
	return m
}

// split: pembagian 80/20 berstrata (kategori + normal/bukan), seed tetap.
func split(rows []row) (tr, val []row) {
	groups := map[string][]int{}
	for i, r := range rows {
		k := r.Category + "/" + fmt.Sprint(r.Style == "normal")
		groups[k] = append(groups[k], i)
	}
	keys := make([]string, 0, len(groups))
	for k := range groups {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	rng := rand.New(rand.NewPCG(7, 7))
	isVal := map[int]bool{}
	for _, k := range keys {
		g := groups[k]
		perm := rng.Perm(len(g))
		for _, p := range perm[:int(math.Ceil(0.2*float64(len(g))))] {
			isVal[g[p]] = true
		}
	}
	for i, r := range rows {
		if isVal[i] {
			val = append(val, r)
		} else {
			tr = append(tr, r)
		}
	}
	return
}

type prf struct{ TP, FP, FN int }

func (x prf) P() float64 {
	if x.TP+x.FP == 0 {
		return 0
	}
	return float64(x.TP) / float64(x.TP+x.FP)
}
func (x prf) R() float64 {
	if x.TP+x.FN == 0 {
		return 0
	}
	return float64(x.TP) / float64(x.TP+x.FN)
}
func (x prf) F1() float64 {
	if p, r := x.P(), x.R(); p+r > 0 {
		return 2 * p * r / (p + r)
	}
	return 0
}

// chooseThresholds memilih ambang per taktik di data validasi.
func chooseThresholds(m *ml.Model, val []row) map[string]prf {
	toks := tokensOf(val)
	chosen := map[string]prf{}
	for _, t := range ml.TacticIDs {
		c := m.Tactics[t]
		pyes := make([]float64, len(val))
		for i := range val {
			_, p := c.Predict(m.Unknown[t], toks[i])
			pyes[i] = p["yes"]
		}
		best, bestTh, found := prf{}, 0.0, false
		for i := 1; i <= 19; i++ {
			th := math.Round(float64(i)*0.05*1e4) / 1e4
			var x prf
			for j, r := range val {
				switch pred, act := pyes[j] >= th, r.has(t); {
				case pred && act:
					x.TP++
				case pred && !act:
					x.FP++
				case !pred && act:
					x.FN++
				}
			}
			better := false
			switch {
			case !found:
				better = true
			case x.P() >= 0.8 && best.P() < 0.8:
				better = true
			case x.P() >= 0.8 && best.P() >= 0.8:
				better = x.F1() >= best.F1()
			case x.P() < 0.8 && best.P() < 0.8:
				better = x.P() >= best.P()
			}
			if better {
				best, bestTh, found = x, th, true
			}
		}
		c.Threshold = bestTh
		m.Tactics[t] = c
		chosen[t] = best
	}
	return chosen
}

type result struct {
	n, catOK int
	conf     [5][5]int // [benar][prediksi]
	tac      map[string]*prf
	normN    int
	normFP   int
	wrong    []string
}

func evaluate(m *ml.Model, rows []row) result {
	res := result{n: len(rows), tac: map[string]*prf{}}
	for _, t := range ml.TacticIDs {
		res.tac[t] = &prf{}
	}
	idx := map[string]int{}
	for i, c := range ml.CategoryIDs {
		idx[c] = i
	}
	var catWrong, tacWrong []string
	for _, r := range rows {
		masked, _ := ml.Mask(r.Text)
		toks := ml.Tokenize(masked)
		cat, _ := m.PredictCategory(toks)
		det := m.PredictTactics(toks)
		pred := map[string]bool{}
		var ps []string
		for _, d := range det {
			pred[d.ID] = true
			ps = append(ps, d.ID)
		}
		sort.Strings(ps)
		res.conf[idx[r.Category]][idx[cat]]++
		if cat == r.Category {
			res.catOK++
		}
		for _, t := range ml.TacticIDs {
			x := res.tac[t]
			switch act := r.has(t); {
			case pred[t] && act:
				x.TP++
			case pred[t] && !act:
				x.FP++
			case !pred[t] && act:
				x.FN++
			}
		}
		if r.Style == "normal" {
			res.normN++
			if len(det) > 0 {
				res.normFP++
			}
		}
		at := append([]string{}, r.Tactics...)
		sort.Strings(at)
		line := fmt.Sprintf("- %q — kategori benar `%s`, prediksi `%s`; taktik benar [%s], prediksi [%s]",
			r.Text, r.Category, cat, strings.Join(at, ", "), strings.Join(ps, ", "))
		if cat != r.Category {
			catWrong = append(catWrong, line)
		} else if strings.Join(at, ",") != strings.Join(ps, ",") {
			tacWrong = append(tacWrong, line)
		}
	}
	res.wrong = append(catWrong, tacWrong...)
	if len(res.wrong) > 10 {
		res.wrong = res.wrong[:10]
	}
	return res
}

func mark(ok bool) string {
	if ok {
		return "✅"
	}
	return "❌"
}

func section(b *strings.Builder, title string, res result, targets bool) {
	acc := float64(res.catOK) / float64(res.n)
	fmt.Fprintf(b, "## %s\n\nJumlah baris: %d\n\n", title, res.n)
	fmt.Fprintf(b, "### Kategori\n\nAkurasi: **%.3f** (%d dari %d)\n\nConfusion matrix (baris = kategori benar, kolom = prediksi):\n\n| benar \\ prediksi |", acc, res.catOK, res.n)
	for _, c := range ml.CategoryIDs {
		fmt.Fprintf(b, " %s |", c)
	}
	b.WriteString("\n|---|---|---|---|---|---|\n")
	for i, c := range ml.CategoryIDs {
		fmt.Fprintf(b, "| %s |", c)
		for j := range ml.CategoryIDs {
			fmt.Fprintf(b, " %d |", res.conf[i][j])
		}
		b.WriteString("\n")
	}
	b.WriteString("\n### Taktik\n\n| taktik | presisi | recall | F1 | TP | FP | FN |\n|---|---|---|---|---|---|---|\n")
	for _, t := range ml.TacticIDs {
		x := res.tac[t]
		fmt.Fprintf(b, "| %s | %.2f | %.2f | %.2f | %d | %d | %d |\n", t, x.P(), x.R(), x.F1(), x.TP, x.FP, x.FN)
	}
	fp := 0.0
	if res.normN > 0 {
		fp = float64(res.normFP) / float64(res.normN)
	}
	fmt.Fprintf(b, "\nPesan normal yang salah diberi minimal satu taktik: **%.1f%%** (%d dari %d)\n\n", 100*fp, res.normFP, res.normN)
	if targets {
		b.WriteString("### Target ML-SPEC §7\n\n| target | hasil | status |\n|---|---|---|\n")
		fmt.Fprintf(b, "| akurasi kategori ≥ 0,80 | %.3f | %s |\n", acc, mark(acc >= 0.8))
		for _, t := range []string{"upfront_fee", "credential_request"} {
			p := res.tac[t].P()
			fmt.Fprintf(b, "| presisi %s ≥ 0,75 | %.2f | %s |\n", t, p, mark(p >= 0.75))
		}
		fmt.Fprintf(b, "| pesan normal salah ditandai ≤ 15%% | %.1f%% | %s |\n\n", 100*fp, mark(fp <= 0.15))
	}
	b.WriteString("### Contoh salah prediksi (maks. 10; salah kategori didahulukan)\n\n")
	if len(res.wrong) == 0 {
		b.WriteString("Tidak ada.\n\n")
	}
	for _, w := range res.wrong {
		b.WriteString(w + "\n")
	}
	b.WriteString("\n")
}

// analyzeCases: teks tetap (fiktif) untuk fixture ml-analyze.json; urutan tidak boleh berubah tanpa alasan.
var analyzeCases = []string{
	"Halo kak, lowongan admin WFH gaji 300rb/hari. Daftar sekarang, cukup tf biaya seragam 150rb ke 1234567890123 ya!!",
	"Selamat! Kamu terpilih jadi pemenang giveaway dari akun resmi toko kami. Hadiah HP baru, klaim dengan kirim kode OTP yang masuk ke nomor kamu hari ini.",
	"Ma, ini nomor baru Dimas, HP yang lama rusak. Tolong transfer dulu 2 juta ke rekening temanku ya, penting banget jangan bilang papa.",
	"Investasi cepat untung 30 persen per minggu, modal kecil mulai 500rb, dijamin profit tanpa risiko. Hubungi mentor kami lewat 081234567890 sekarang.",
	"Pinjaman cepat cair 10 juta tanpa survei dan tanpa jaminan, cukup KTP. Bayar biaya admin 300rb dulu supaya pencairan diproses.",
	"Besok kuliah pagi jam 8 ya, jangan lupa bawa laptop dan tugas kelompok. Nanti kita makan siang bareng di kantin.",
	"Promo resmi toko kami diskon 20 persen sampai akhir bulan, belanja langsung di aplikasi resmi dan bayar di kasir.",
	"Halo bang",
	"Hubungi admin di <NOMOR> atau buka <URL> untuk daftar kerja online, transfer ke <REKENING> biaya pendaftaran 100rb ya kak!!",
	"Kak, hubungi saya di 0812-3456-7890 atau email budi@contoh.id, nanti saya kirim detail lowongannya lewat https://contoh.id/daftar",
}

func writeAnalyzeFixture(m *ml.Model) {
	repo, err := data.Load()
	if err != nil {
		die(err)
	}
	sc := ml.IndexScenarios(repo)
	type fx struct {
		Text     string    `json:"text"`
		Expected ml.Result `json:"expected"`
	}
	out := make([]fx, len(analyzeCases))
	for i, t := range analyzeCases {
		out[i] = fx{t, ml.Analyze(m, t, sc)}
	}
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.SetEscapeHTML(false)
	enc.SetIndent("", " ")
	if err := enc.Encode(out); err != nil {
		die(err)
	}
	if err := os.WriteFile("testdata/fixtures/ml-analyze.json", buf.Bytes(), 0o644); err != nil {
		die(err)
	}
}

func main() {
	rows := readCSV("data/ml/train.csv")
	tr, val := split(rows)
	m80 := build(tr)
	valStats := chooseThresholds(m80, val)

	m := build(rows)
	for _, t := range ml.TacticIDs {
		c := m.Tactics[t]
		c.Threshold = m80.Tactics[t].Threshold
		m.Tactics[t] = c
	}
	js, err := json.MarshalIndent(m, "", " ")
	if err != nil {
		die(err)
	}
	if len(js) > 250*1024 {
		if js, err = json.Marshal(m); err != nil {
			die(err)
		}
	}
	js = append(js, '\n')
	if err := os.WriteFile("internal/ml/model.json", js, 0o644); err != nil {
		die(err)
	}
	fmt.Printf("model.json: %d bytes, vocab %d\n", len(js), m.VocabSize)
	// pakai model hasil muat ulang dari bytes agar sama persis dengan yang dipakai server
	loaded := &ml.Model{}
	if err := json.Unmarshal(js, loaded); err != nil {
		die(err)
	}
	writeAnalyzeFixture(loaded)

	var b strings.Builder
	fmt.Fprintf(&b, "# Laporan model ML\n\nDibuat oleh `go run ./cmd/ml-train` (tanpa cap waktu agar hasil deterministik). Data latih: `data/ml/train.csv` (%d baris, sintetis). Ukuran `model.json`: %d byte; kosakata %d token.\n\n", len(rows), len(js), m.VocabSize)
	b.WriteString("## Pemilihan ambang taktik (validasi 20% dari train.csv)\n\nModel sementara dilatih pada 80% data (berstrata kategori, seed tetap). Ambang dipilih dari 0,05 sampai 0,95: F1 tertinggi dengan presisi ≥ 0,8, jika tidak ada maka presisi tertinggi. Catatan: validasi memakai data dari generator yang sama dengan data latih, jadi angkanya lebih optimis daripada uji di bawah.\n\n| taktik | ambang | presisi | recall | F1 |\n|---|---|---|---|---|\n")
	for _, t := range ml.TacticIDs {
		x := valStats[t]
		fmt.Fprintf(&b, "| %s | %.2f | %.2f | %.2f | %.2f |\n", t, m.Tactics[t].Threshold, x.P(), x.R(), x.F1())
	}
	b.WriteString("\n")
	section(&b, "Uji test-agen.csv (ditulis terpisah, tidak dipakai training)", evaluate(m, readCSV("data/ml/test-agen.csv")), true)
	if tim := readCSV("data/ml/test-tim.csv"); len(tim) > 3 {
		section(&b, "Uji test-tim.csv (ditulis tim)", evaluate(m, tim), true)
	} else {
		b.WriteString("## Uji test-tim.csv\n\nDilewati: baru berisi contoh (≤ 3 baris). Isi 30–50 baris oleh tim lalu jalankan ulang.\n")
	}
	if err := os.WriteFile("data/ml/report.md", bytes.TrimRight([]byte(b.String()), "\n"), 0o644); err != nil {
		die(err)
	}
	fmt.Print(b.String())
}
