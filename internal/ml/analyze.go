package ml

import (
	"strings"
)

const Disclaimer = "Ini alat bantu berpikir, bukan deteksi pasti."

type Category struct {
	ID         string  `json:"id"`
	Confidence float64 `json:"confidence"`
}

type Tactic struct {
	ID        string   `json:"id"`
	Score     float64  `json:"score"`
	TopTokens []string `json:"top_tokens"`
}

// Result = AnalyzeResponse di openapi.yaml.
type Result struct {
	Masked       string   `json:"masked"`
	MaskedCount  int      `json:"masked_count"`
	TooShort     bool     `json:"too_short"`
	Category     Category `json:"category"`
	ScenarioID   string   `json:"scenario_id"`
	Tactics      []Tactic `json:"tactics"`
	ModelVersion string   `json:"model_version"`
	Disclaimer   string   `json:"disclaimer"`
}

const genericScenario = "generic_emergency"

// containsSeq: apakah kw muncul sebagai urutan kata berurutan di words.
func containsSeq(words, kw []string) bool {
	for i := 0; i+len(kw) <= len(words); i++ {
		j := 0
		for j < len(kw) && words[i+j] == kw[j] {
			j++
		}
		if j == len(kw) {
			return true
		}
	}
	return false
}

func pickScenario(masked, cat string, scenarios []Scenario) string {
	words := Normalize(masked)
	best, bestScore, fallback := "", 0, ""
	for _, s := range scenarios {
		if s.Category != cat {
			continue
		}
		if s.IsFallback && fallback == "" {
			fallback = s.ID
		}
		seen := map[string]bool{}
		score := 0
		for _, k := range s.Keywords {
			kw := Normalize(k)
			key := strings.Join(kw, " ")
			if len(kw) == 0 || seen[key] {
				continue
			}
			seen[key] = true
			if containsSeq(words, kw) {
				score++
			}
		}
		if score > bestScore {
			best, bestScore = s.ID, score
		}
	}
	switch {
	case best != "":
		return best
	case fallback != "":
		return fallback
	}
	return genericScenario
}

// Analyze murni: tidak ada I/O, log, atau penyimpanan teks.
func Analyze(m *Model, text string, scenarios []Scenario) Result {
	masked, n := Mask(text)
	r := Result{Masked: masked, MaskedCount: n, Tactics: []Tactic{}, ModelVersion: m.Version, Disclaimer: Disclaimer}
	if len(strings.Fields(masked)) < 5 {
		r.TooShort = true
		r.Category = Category{ID: "lainnya"}
		r.ScenarioID = genericScenario
		return r
	}
	toks := Tokenize(masked)
	cat, conf := m.PredictCategory(toks)
	r.Category = Category{ID: cat, Confidence: round4(conf)}
	r.ScenarioID = pickScenario(masked, cat, scenarios)
	for _, d := range m.PredictTactics(toks) {
		tt := d.TopTokens
		if tt == nil {
			tt = []string{}
		}
		r.Tactics = append(r.Tactics, Tactic{ID: d.ID, Score: round4(d.Score), TopTokens: tt})
	}
	return r
}
