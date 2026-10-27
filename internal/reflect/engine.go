package reflect

import (
	"fmt"
	"sort"
	"strings"
	"unicode"

	"prototype-ato/internal/model"
)

type Engine struct {
	scenarios []model.Scenario
}

func NewEngine(scenarios []model.Scenario) *Engine {
	return &Engine{scenarios: scenarios}
}

func NormalizeText(text string) string {
	var b strings.Builder
	for _, r := range strings.ToLower(text) {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || unicode.IsSpace(r) {
			b.WriteRune(r)
		} else {
			b.WriteRune(' ')
		}
	}
	return strings.Join(strings.Fields(b.String()), " ")
}

func (e *Engine) MatchScenarioByKeyword(freeText string) model.Scenario {
	normalized := NormalizeText(freeText)
	words := strings.Fields(normalized)
	wordSet := make(map[string]struct{}, len(words))
	for _, w := range words {
		wordSet[w] = struct{}{}
	}

	var bestScenario model.Scenario
	var highestScore int

	// Prefer specific scenarios first (indices 0..4)
	for _, s := range e.scenarios {
		if s.ID == "generic_emergency" {
			continue
		}
		score := 0
		for _, kw := range s.Keywords {
			kwNorm := NormalizeText(kw)
			if strings.Contains(normalized, kwNorm) {
				score += 3
			} else {
				for _, part := range strings.Fields(kwNorm) {
					if _, ok := wordSet[part]; ok {
						score += 1
					}
				}
			}
		}
		if score > highestScore {
			highestScore = score
			bestScenario = s
		}
	}

	// Threshold check: need at least 2 points to claim specific scenario match
	if highestScore >= 2 && bestScenario.ID != "" {
		return bestScenario
	}

	// Fallback to generic_emergency
	for _, s := range e.scenarios {
		if s.ID == "generic_emergency" {
			return s
		}
	}

	if len(e.scenarios) > 0 {
		return e.scenarios[0]
	}
	return model.Scenario{}
}

func (e *Engine) ProcessReflection(req model.ReflectRequest) (model.ReflectResponse, error) {
	var scenario model.Scenario
	found := false

	if req.ScenarioID != "" {
		for _, s := range e.scenarios {
			if s.ID == req.ScenarioID {
				scenario = s
				found = true
				break
			}
		}
		if !found {
			return model.ReflectResponse{}, fmt.Errorf("scenario ID '%s' not found", req.ScenarioID)
		}
	} else if req.FreeText != "" {
		scenario = e.MatchScenarioByKeyword(req.FreeText)
		found = true
	} else {
		return model.ReflectResponse{}, fmt.Errorf("either scenario_id or free_text must be provided")
	}

	// Collect tags from chosen options
	selectedTagsMap := make(map[string]int)
	perspectiveReasons := make([]string, 0)

	for _, ans := range req.Answers {
		for _, q := range scenario.PerspectiveQuestions {
			if q.ID == ans.QuestionID {
				for _, opt := range q.Options {
					if opt.ID == ans.SelectedOptionID {
						for _, tag := range opt.Tags {
							selectedTagsMap[tag]++
						}
						perspectiveReasons = append(perspectiveReasons, opt.Label)
					}
				}
			}
		}
	}

	// Rank flaws based on tag match and severity
	type scoredFlaw struct {
		flaw  model.Flaw
		score int
	}

	scored := make([]scoredFlaw, len(scenario.Flaws))
	for i, f := range scenario.Flaws {
		matchWeight := selectedTagsMap[f.Tag] * 10
		severityWeight := f.Severity * 2
		scored[i] = scoredFlaw{
			flaw:  f,
			score: matchWeight + severityWeight,
		}
	}

	// Deterministic sorting: highest score first; tie-break by ID
	sort.Slice(scored, func(i, j int) bool {
		if scored[i].score != scored[j].score {
			return scored[i].score > scored[j].score
		}
		return scored[i].flaw.ID < scored[j].flaw.ID
	})

	topFlawsCount := 3
	if len(scored) < topFlawsCount {
		topFlawsCount = len(scored)
	}

	flawResults := make([]model.FlawResult, topFlawsCount)
	for i := 0; i < topFlawsCount; i++ {
		sf := scored[i]
		reason := "Terdeteksi dari analisis kacamata pelaku yang kamu pilih."
		if i < len(perspectiveReasons) {
			reason = fmt.Sprintf("Kamu tadi memilih taktik '%s', yang berkorelasi langsung dengan celah ini.", perspectiveReasons[i])
		}

		flawResults[i] = model.FlawResult{
			ID:                    sf.flaw.ID,
			Title:                 sf.flaw.Title,
			Explanation:           sf.flaw.Explanation,
			EvidencePhrases:       sf.flaw.EvidencePhrases,
			Severity:              sf.flaw.Severity,
			UserPerspectiveReason: reason,
		}
	}

	// Safe steps
	safeSteps := make([]string, 0, len(scenario.SafeSteps))
	for _, step := range scenario.SafeSteps {
		safeSteps = append(safeSteps, step.Text)
	}

	// Warning templates
	casualText := ""
	firmText := ""
	for _, wt := range scenario.WarningTemplates {
		if wt.Tone == model.ToneCasual && casualText == "" {
			casualText = wt.Text
		}
		if wt.Tone == model.ToneFirm && firmText == "" {
			firmText = wt.Text
		}
	}
	if casualText == "" && len(scenario.WarningTemplates) > 0 {
		casualText = scenario.WarningTemplates[0].Text
	}
	if firmText == "" && len(scenario.WarningTemplates) > 0 {
		firmText = scenario.WarningTemplates[0].Text
	}

	summaryReason := "Kamu membongkar skenario ini dengan memeriksa celah psikologis yang sengaja disamarkan pelaku."
	if len(perspectiveReasons) > 0 {
		summaryReason = fmt.Sprintf("Dengan mengidentifikasi taktik '%s', kamu mematahkan ilusi manipulasi sebelum terjadi kerugian.", perspectiveReasons[0])
	}

	confidenceNote := "Hasil analisis ini didasarkan pada kecocokan indikator taktik manipulasi dan bukti linguistik dari skenario, sebagai panduan nalar kritis mandiri (bukan skor pasti)."

	return model.ReflectResponse{
		ScenarioID:        scenario.ID,
		MatchedCategory:   scenario.Category,
		UserDetectedFlaws: flawResults,
		SafeSteps:         safeSteps,
		WarningTemplates: model.WarningTemplatesResponse{
			Casual: casualText,
			Firm:   firmText,
		},
		ConfidenceNote:     confidenceNote,
		PerspectiveSummary: summaryReason,
	}, nil
}
