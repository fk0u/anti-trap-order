// Package lite = logika murni endpoint Lite v1 (POST /api/v1/lite/reflect).
// Tidak ada I/O, tidak ada log, dan teks user tidak pernah ikut ke pesan error.
package lite

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"slices"
	"sort"

	"prototype-ato/internal/data"
	"prototype-ato/internal/model"
)

const (
	Disclaimer = "Ini alat bantu berpikir, bukan deteksi pasti."
	// Teks tetap yang sama untuk semua skenario (contoh di openapi).
	WhyItWorks = "Saat kamu memposisikan diri sebagai pelaku, pola yang tadinya samar jadi jelas — dan itu bisa kamu kenali lagi lain kali."
)

type Answer struct {
	QuestionID  string   `json:"question_id"`
	OptionIDs   []string `json:"option_ids"`
	OtherFilled bool     `json:"other_filled"`
}

type Request struct {
	ScenarioID string   `json:"scenario_id"`
	Answers    []Answer `json:"answers"`
}

type GapCard struct {
	FlawID      string          `json:"flaw_id"`
	Kind        string          `json:"kind"`
	Tactic      model.TacticRef `json:"tactic"`
	UserQuote   *string         `json:"user_quote"`
	Explanation string          `json:"explanation"`
	Counter     string          `json:"counter"`
	Severity    int             `json:"severity"`
}

type Response struct {
	ScenarioID       string           `json:"scenario_id"`
	Category         model.Category   `json:"category"`
	FoundCount       int              `json:"found_count"`
	Found            []GapCard        `json:"found"`
	MissedCandidates []GapCard        `json:"missed_candidates"`
	WhyItWorks       string           `json:"why_it_works"`
	ActionCard       model.ActionCard `json:"action_card"`
	Disclaimer       string           `json:"disclaimer"`
}

type ValidationError struct {
	Status  int
	Code    string
	Field   string
	Message string
}

func (e *ValidationError) Body() model.ErrorResponse {
	return model.ErrorResponse{Error: model.ErrorDetail{Code: e.Code, Message: e.Message, Field: e.Field}}
}

func bad(field, msg string) *ValidationError {
	return &ValidationError{http.StatusBadRequest, "VALIDATION_ERROR", field, msg}
}

// Handle memproses body mentah: decode ketat lalu Reflect. Mengembalikan status + body JSON-able.
func Handle(c *data.V1Content, body []byte) (int, any) {
	const unreadable = "Permintaan tidak bisa dibaca. Pastikan isinya hanya ID skenario dan pilihanmu."
	dec := json.NewDecoder(bytes.NewReader(body))
	dec.DisallowUnknownFields()
	var req Request
	if err := dec.Decode(&req); err != nil {
		return http.StatusBadRequest, bad("", unreadable).Body()
	}
	if _, err := dec.Token(); err != io.EOF {
		return http.StatusBadRequest, bad("", unreadable).Body()
	}
	resp, verr := Reflect(c, req)
	if verr != nil {
		return verr.Status, verr.Body()
	}
	return http.StatusOK, resp
}

func Reflect(c *data.V1Content, req Request) (Response, *ValidationError) {
	if req.ScenarioID == "" {
		return Response{}, bad("scenario_id", "Pilih skenario dulu ya.")
	}
	sc, ok := c.Scenario(req.ScenarioID)
	if !ok {
		return Response{}, &ValidationError{http.StatusNotFound, "NOT_FOUND", "", "Skenario tidak ditemukan."}
	}
	if len(req.Answers) != 3 {
		return Response{}, bad("answers", "Jawab ketiga pertanyaan dulu ya.")
	}

	// Opsi terpilih dikumpulkan berurutan (urutan jawaban, lalu urutan option_ids).
	var picked []model.V1Option
	seenQ := map[string]bool{}
	for i, a := range req.Answers {
		f := fmt.Sprintf("answers[%d]", i)
		qi := slices.IndexFunc(sc.Questions, func(q model.V1Question) bool { return q.ID == a.QuestionID })
		if qi < 0 || seenQ[a.QuestionID] {
			return Response{}, bad(f+".question_id", "Pertanyaan tidak dikenali atau terisi dua kali.")
		}
		seenQ[a.QuestionID] = true
		if a.OptionIDs == nil || len(a.OptionIDs) > 2 || (len(a.OptionIDs) == 0 && !a.OtherFilled) {
			return Response{}, bad(f+".option_ids", "Pilih 1 atau 2 jawaban untuk tiap pertanyaan.")
		}
		seenO := map[string]bool{}
		for j, id := range a.OptionIDs {
			oi := slices.IndexFunc(sc.Questions[qi].Options, func(o model.V1Option) bool { return o.ID == id })
			if oi < 0 || seenO[id] {
				return Response{}, bad(fmt.Sprintf("%s.option_ids[%d]", f, j), "Pilihan tidak dikenali atau terpilih dua kali.")
			}
			seenO[id] = true
			picked = append(picked, sc.Questions[qi].Options[oi])
		}
	}

	tactics := map[string]model.Tactic{}
	for _, t := range c.Tactics {
		tactics[t.ID] = t
	}
	card := func(f model.V1Flaw, kind string, quote *string) GapCard {
		return GapCard{f.ID, kind, tactics[f.Tactic].TacticRef, quote, f.Explanation, f.Counter, f.Severity}
	}

	found, missed := []GapCard{}, []model.V1Flaw{}
	foundTactics := map[string]bool{}
	for _, f := range sc.Flaws {
		var quote *string
		for _, o := range picked {
			if slices.ContainsFunc(o.Tags, func(t string) bool { return slices.Contains(f.Tags, t) }) {
				l := o.Label
				quote = &l
				break
			}
		}
		if quote == nil {
			missed = append(missed, f)
			continue
		}
		found = append(found, card(f, "found", quote))
		foundTactics[f.Tactic] = true
	}
	sort.SliceStable(found, func(i, j int) bool { return found[i].Severity > found[j].Severity })
	// Celah missed tidak cocok dengan opsi mana pun (0 tag cocok), jadi skor 10×cocok + 2×severity
	// jatuh ke 2×severity; urutan stabil menjaga urutan data saat seri.
	sort.SliceStable(missed, func(i, j int) bool { return missed[i].Severity > missed[j].Severity })
	cands := make([]GapCard, 0, len(missed)+1)
	for _, f := range missed {
		cands = append(cands, card(f, "missed", nil))
	}
	if len(cands) == 0 {
		// Semua celah skenario ditemukan, tapi openapi mewajibkan >=1 kandidat. Aturan deterministik:
		// ambil taktik katalog yang tidak ada di found, dengan severity tertinggi di seluruh celah
		// konten (seri -> urutan model.TacticIDs); kartu dibangun dari penjelasan katalog.
		best, bestSev := "", -1
		for _, id := range model.TacticIDs {
			if foundTactics[id] {
				continue
			}
			sev := 1
			for _, s := range c.Scenarios {
				for _, f := range s.Flaws {
					if f.Tactic == id && f.Severity > sev {
						sev = f.Severity
					}
				}
			}
			if sev > bestSev {
				best, bestSev = id, sev
			}
		}
		if best != "" {
			t := tactics[best]
			cands = append(cands, GapCard{"tactic_" + best, "missed", t.TacticRef, nil, t.Explanation, t.Counter, bestSev})
		}
	}

	cat, _ := c.CategoryByID(sc.Category)
	return Response{sc.ID, cat, len(found), found, cands, WhyItWorks, sc.ActionCard, Disclaimer}, nil
}
