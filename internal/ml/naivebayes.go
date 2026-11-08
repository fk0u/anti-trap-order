package ml

import (
	"math"
	"sort"
)

const alpha = 1.0 // smoothing Laplace

// Classifier: satu model Naive Bayes multinomial. Semua angka sudah dibulatkan 4 desimal
// (nilai tersimpan inilah yang dipakai saat prediksi, jadi server dan FE identik).
// Likelihoods hanya menyimpan token yang pernah muncul di kelas itu; token lain di kosakata
// memakai nilai Unknown[kelas]; token yang tidak ada di kosakata model diabaikan.
type Classifier struct {
	Threshold   float64                       `json:"threshold,omitempty"`
	Priors      map[string]float64            `json:"priors"`
	Likelihoods map[string]map[string]float64 `json:"likelihoods"`
	Totals      map[string]int                `json:"totals"`
}

func round4(x float64) float64 { return math.Round(x*1e4) / 1e4 }

// Train melatih satu Classifier dari daftar token per dokumen. vocab = ukuran kosakata (V).
// Token yang total kemunculannya (semua kelas) < minCount tidak disimpan di Likelihoods
// (jadi diabaikan saat prediksi), tetapi tetap dihitung di Totals.
// Mengembalikan juga Unknown per kelas: log(alpha/(total+alpha*V)).
func Train(docs [][]string, labels, classes []string, vocab, minCount int) (Classifier, map[string]float64) {
	all := map[string]int{}
	for _, d := range docs {
		for _, t := range d {
			all[t]++
		}
	}
	n := map[string]int{}
	counts := map[string]map[string]int{}
	totals := map[string]int{}
	for _, c := range classes {
		counts[c] = map[string]int{}
	}
	for i, d := range docs {
		c := labels[i]
		n[c]++
		for _, t := range d {
			counts[c][t]++
			totals[c]++
		}
	}
	cl := Classifier{Priors: map[string]float64{}, Likelihoods: map[string]map[string]float64{}, Totals: totals}
	unk := map[string]float64{}
	for _, c := range classes {
		cl.Priors[c] = round4(math.Log((float64(n[c]) + alpha) / (float64(len(docs)) + alpha*float64(len(classes)))))
		den := float64(totals[c]) + alpha*float64(vocab)
		cl.Likelihoods[c] = map[string]float64{}
		for t, k := range counts[c] {
			if all[t] < minCount {
				continue
			}
			cl.Likelihoods[c][t] = round4(math.Log((float64(k) + alpha) / den))
		}
		unk[c] = round4(math.Log(alpha / den))
	}
	return cl, unk
}

func (c *Classifier) classes() []string {
	out := make([]string, 0, len(c.Priors))
	for k := range c.Priors {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

func (c *Classifier) inVocab(t string) bool {
	for _, m := range c.Likelihoods {
		if _, ok := m[t]; ok {
			return true
		}
	}
	return false
}

// Predict mengembalikan skor log dan probabilitas softmax per kelas.
func (c *Classifier) Predict(unk map[string]float64, tokens []string) (scores, probs map[string]float64) {
	cls := c.classes()
	scores, probs = map[string]float64{}, map[string]float64{}
	for _, k := range cls {
		scores[k] = c.Priors[k]
	}
	for _, t := range tokens {
		if !c.inVocab(t) {
			continue
		}
		for _, k := range cls {
			if v, ok := c.Likelihoods[k][t]; ok {
				scores[k] += v
			} else {
				scores[k] += unk[k]
			}
		}
	}
	mx := math.Inf(-1)
	for _, k := range cls {
		mx = math.Max(mx, scores[k])
	}
	sum := 0.0
	for _, k := range cls {
		probs[k] = math.Exp(scores[k] - mx)
		sum += probs[k]
	}
	for _, k := range cls {
		probs[k] /= sum
	}
	return
}

// TopTokens: maksimal k token berbeda dari teks dengan log-rasio terbesar "yes" vs "no" (hanya yang positif).
func (c *Classifier) TopTokens(unk map[string]float64, tokens []string, k int) []string {
	ll := func(cls, t string) float64 {
		if v, ok := c.Likelihoods[cls][t]; ok {
			return v
		}
		return unk[cls]
	}
	type tr struct {
		t string
		r float64
	}
	seen := map[string]bool{}
	var cand []tr
	for _, t := range tokens {
		if seen[t] || !c.inVocab(t) {
			continue
		}
		seen[t] = true
		if r := ll("yes", t) - ll("no", t); r > 0 {
			cand = append(cand, tr{t, r})
		}
	}
	sort.Slice(cand, func(i, j int) bool {
		if cand[i].r != cand[j].r {
			return cand[i].r > cand[j].r
		}
		return cand[i].t < cand[j].t
	})
	var out []string
	for i := 0; i < len(cand) && i < k; i++ {
		out = append(out, cand[i].t)
	}
	return out
}

// Prune membuang token yang hampir tidak membedakan kelas (selisih log-likelihood terbesar-terkecil
// antar kelas < minSpread). Token itu lalu dianggap di luar kosakata model dan diabaikan; ini
// menjaga model.json tetap kecil.
func (c *Classifier) Prune(unk map[string]float64, minSpread float64) {
	cls := c.classes()
	toks := map[string]bool{}
	for _, m := range c.Likelihoods {
		for t := range m {
			toks[t] = true
		}
	}
	for t := range toks {
		lo, hi := math.Inf(1), math.Inf(-1)
		for _, k := range cls {
			v, ok := c.Likelihoods[k][t]
			if !ok {
				v = unk[k]
			}
			lo, hi = math.Min(lo, v), math.Max(hi, v)
		}
		if hi-lo < minSpread {
			for _, k := range cls {
				delete(c.Likelihoods[k], t)
			}
		}
	}
}
