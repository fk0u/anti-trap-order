package ml

import (
	_ "embed"
	"encoding/json"
	"sort"
	"sync"
)

type Labels struct {
	Categories []string `json:"categories"`
	Tactics    []string `json:"tactics"`
}

// Model = isi model.json. Unknown berkunci "category" atau ID taktik, lalu nama kelas.
type Model struct {
	Version          string                        `json:"version"`
	TokenizerVersion int                           `json:"tokenizer_version"`
	Labels           Labels                        `json:"labels"`
	Category         Classifier                    `json:"category"`
	Tactics          map[string]Classifier         `json:"tactics"`
	VocabSize        int                           `json:"vocab_size"`
	Unknown          map[string]map[string]float64 `json:"unknown"`
}

//go:embed model.json
var modelJSON []byte

var (
	once   sync.Once
	loaded *Model
	lerr   error
)

// Load membaca model.json yang di-embed (di-cache).
func Load() (*Model, error) {
	once.Do(func() {
		m := &Model{}
		if lerr = json.Unmarshal(modelJSON, m); lerr == nil {
			loaded = m
		}
	})
	return loaded, lerr
}

// PredictCategory: kelas dengan softmax tertinggi; keyakinan < 0,5 -> lainnya.
func (m *Model) PredictCategory(tokens []string) (string, float64) {
	_, probs := m.Category.Predict(m.Unknown["category"], tokens)
	best, bp := "", -1.0
	for _, k := range m.Category.classes() {
		if probs[k] > bp {
			best, bp = k, probs[k]
		}
	}
	if bp < 0.5 {
		return "lainnya", bp
	}
	return best, bp
}

type Detected struct {
	ID        string
	Score     float64
	TopTokens []string
}

// PredictTactics: taktik yang P(yes) >= ambangnya, urut skor menurun (seri: urutan TacticIDs).
func (m *Model) PredictTactics(tokens []string) []Detected {
	var out []Detected
	for _, id := range TacticIDs {
		c, ok := m.Tactics[id]
		if !ok {
			continue
		}
		_, p := c.Predict(m.Unknown[id], tokens)
		if p["yes"] >= c.Threshold {
			out = append(out, Detected{id, p["yes"], c.TopTokens(m.Unknown[id], tokens, 3)})
		}
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].Score > out[j].Score })
	return out
}
