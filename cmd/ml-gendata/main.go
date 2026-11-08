// ml-gendata membangun data/ml/train.csv dari handwritten.csv + fragments.json (seed tetap, deterministik).
package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"math/rand/v2"
	"os"
	"strings"

	"prototype-ato/internal/ml"
)

type pair struct{ Tempel, Cerita []string }

type fragments struct {
	Categories map[string]pair     `json:"categories"`
	Tactics    map[string]pair     `json:"tactics"`
	Normal     []string            `json:"normal"`
	Frames     map[string][]string `json:"frames"`
	Style      struct {
		WaAbbrev  map[string]string  `json:"wa_abbrev"`
		TypoSwaps [][]string         `json:"typo_swaps"`
		Emoji     []string           `json:"emoji"`
		Money     []string           `json:"money"`
		Probs     map[string]float64 `json:"probs"`
	} `json:"style"`
}

type row struct{ ID, Text, Style, Category, Tactics, Source string }

const (
	nTempel = 400
	nCerita = 280
	nNormal = 160
)

func die(f string, a ...any) {
	fmt.Fprintf(os.Stderr, f+"\n", a...)
	os.Exit(1)
}

type gen struct {
	r *rand.Rand
	f fragments
}

func (g *gen) pick(s []string) string { return s[g.r.IntN(len(s))] }
func (g *gen) chance(k string) bool   { return g.r.Float64() < g.f.Style.Probs[k] }

func (g *gen) expand(s string) string {
	for strings.Contains(s, "{uang}") {
		m := g.pick(g.f.Style.Money)
		n := []int{50, 75, 100, 150, 200, 250, 300, 350, 500}[g.r.IntN(9)]
		m = strings.NewReplacer("{n}", fmt.Sprint(n), "{m}", fmt.Sprint(1+g.r.IntN(20))).Replace(m)
		s = strings.Replace(s, "{uang}", m, 1)
	}
	return strings.NewReplacer("{nomor}", "<NOMOR>", "{url}", "<URL>", "{rek}", "<REKENING>", "{email}", "<EMAIL>").Replace(s)
}

func (g *gen) style(s string) string {
	words := strings.Fields(s)
	if g.chance("wa_abbrev") {
		for i, w := range words {
			core := strings.TrimRight(w, ".,!?:;")
			if ab, ok := g.f.Style.WaAbbrev[strings.ToLower(core)]; ok && g.r.Float64() < 0.7 {
				words[i] = ab + w[len(core):]
			}
		}
	}
	if g.chance("typo") && len(g.f.Style.TypoSwaps) > 0 {
		for k := 0; k < 1+g.r.IntN(2); k++ {
			i, sw := g.r.IntN(len(words)), g.f.Style.TypoSwaps[g.r.IntN(len(g.f.Style.TypoSwaps))]
			if !strings.HasPrefix(words[i], "<") {
				words[i] = strings.Replace(words[i], sw[0], sw[1], 1)
			}
		}
	}
	s = strings.Join(words, " ")
	if g.chance("strip_punct") {
		s = strings.NewReplacer(".", "", ",", "", "!", "", "?", "", ":", "", ";", "").Replace(s)
	} else if g.chance("seru") {
		s = strings.TrimRight(s, ".!?") + "!!!"
	}
	if g.chance("emoji") {
		e := g.pick(g.f.Style.Emoji)
		if g.r.IntN(2) == 0 {
			s += " " + e
		} else {
			s = e + " " + s
		}
	}
	if g.chance("caps") {
		s = strings.ToUpper(s)
	}
	return strings.TrimSpace(s)
}

func upperFirst(s string) string {
	if s == "" {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

func join(parts ...string) string {
	var out []string
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return strings.Join(out, " ")
}

func (g *gen) positive(i int, st string) row {
	cat := ml.CategoryIDs[i%5]
	k := []int{1, 2, 2, 3}[g.r.IntN(4)]
	perm := g.r.Perm(len(ml.TacticIDs))[:k]
	pick := func(p pair) string {
		if st == "tempel" {
			return g.pick(p.Tempel)
		}
		return g.pick(p.Cerita)
	}
	ctx := pick(g.f.Categories[cat])
	var phrases, tacs []string
	for _, ti := range perm {
		t := ml.TacticIDs[ti]
		tacs = append(tacs, t)
		phrases = append(phrases, pick(g.f.Tactics[t]))
	}
	var text string
	if st == "tempel" {
		text = join(g.pick(g.f.Frames["tempel_open"]), upperFirst(ctx)+".", strings.Join(phrases, ". ")+".", g.pick(g.f.Frames["tempel_close"]))
	} else {
		text = join(g.pick(g.f.Frames["cerita_open"]), ctx+".", upperFirst(strings.Join(phrases, ". "))+".", g.pick(g.f.Frames["cerita_close"]))
	}
	return row{Text: g.style(g.expand(text)), Style: st, Category: cat, Tactics: strings.Join(tacs, "|"), Source: "sintetis"}
}

func (g *gen) normal() row {
	k := []int{1, 1, 2, 2, 3}[g.r.IntN(5)]
	var parts []string
	for _, i := range g.r.Perm(len(g.f.Normal))[:k] {
		parts = append(parts, g.f.Normal[i])
	}
	return row{Text: g.style(g.expand(strings.Join(parts, ". ") + ".")), Style: "normal", Category: "lainnya", Source: "sintetis"}
}

func readRows(path string) []row {
	fh, err := os.Open(path)
	if err != nil {
		die("%v", err)
	}
	defer fh.Close()
	recs, err := csv.NewReader(fh).ReadAll()
	if err != nil {
		die("%s: %v", path, err)
	}
	var out []row
	for _, r := range recs[1:] {
		out = append(out, row{r[0], r[1], r[2], r[3], r[4], r[5]})
	}
	return out
}

func validate(r row) error {
	if !ml.ValidCategory(r.Category) {
		return fmt.Errorf("kategori tidak valid")
	}
	if r.Style != "tempel" && r.Style != "cerita" && r.Style != "normal" {
		return fmt.Errorf("style tidak valid")
	}
	n := 0
	if r.Tactics != "" {
		for _, t := range strings.Split(r.Tactics, "|") {
			if !ml.ValidTactic(t) {
				return fmt.Errorf("taktik %q tidak valid", t)
			}
			n++
		}
	}
	if (r.Style == "normal") != (n == 0) {
		return fmt.Errorf("normal harus tanpa taktik dan sebaliknya")
	}
	if w := len(strings.Fields(r.Text)); w < 5 || w > 80 {
		return fmt.Errorf("panjang %d kata di luar 5-80", w)
	}
	return nil
}

func main() {
	var f fragments
	b, err := os.ReadFile("data/ml/fragments.json")
	if err == nil {
		err = json.Unmarshal(b, &f)
	}
	if err != nil {
		die("fragments.json: %v", err)
	}
	g := &gen{r: rand.New(rand.NewPCG(42, 42)), f: f}
	rows := readRows("data/ml/handwritten.csv")
	seen := map[string]bool{}
	for _, r := range rows {
		seen[r.Text] = true
	}
	add := func(n int, mk func(i int) row) {
		for i, made := 0, 0; made < n; i++ {
			r := mk(i)
			if seen[r.Text] {
				continue
			}
			seen[r.Text] = true
			made++
			r.ID = fmt.Sprintf("gen-%04d", len(rows)+1)
			rows = append(rows, r)
		}
	}
	add(nTempel, func(i int) row { return g.positive(i, "tempel") })
	add(nCerita, func(i int) row { return g.positive(i, "cerita") })
	add(nNormal, func(int) row { return g.normal() })

	for _, r := range rows {
		if err := validate(r); err != nil {
			die("baris %s tidak valid: %v", r.ID, err)
		}
	}
	out, err := os.Create("data/ml/train.csv")
	if err != nil {
		die("%v", err)
	}
	w := csv.NewWriter(out)
	w.Write([]string{"id", "text", "style", "category", "tactics", "source"})
	styles, cats, tacs := map[string]int{}, map[string]int{}, map[string]int{}
	for _, r := range rows {
		w.Write([]string{r.ID, r.Text, r.Style, r.Category, r.Tactics, r.Source})
		styles[r.Style]++
		cats[r.Category]++
		if r.Tactics != "" {
			for _, t := range strings.Split(r.Tactics, "|") {
				tacs[t]++
			}
		}
	}
	w.Flush()
	if err := w.Error(); err != nil {
		die("%v", err)
	}
	out.Close()
	fmt.Printf("train.csv: %d baris\n", len(rows))
	for _, s := range []string{"tempel", "cerita", "normal"} {
		fmt.Printf("  style %-7s %4d (%.1f%%)\n", s, styles[s], 100*float64(styles[s])/float64(len(rows)))
	}
	for _, c := range ml.CategoryIDs {
		fmt.Printf("  kategori %-19s %4d\n", c, cats[c])
	}
	for _, t := range ml.TacticIDs {
		fmt.Printf("  positif %-19s %4d\n", t, tacs[t])
	}
}
