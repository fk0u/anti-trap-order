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
	canonicalTokens := NLPTokenize(freeText)
	canonicalSet := make(map[string]struct{}, len(canonicalTokens))
	for _, t := range canonicalTokens {
		canonicalSet[t] = struct{}{}
	}

	vectors := DetectManipulationVectors(freeText)
	vectorSet := make(map[ManipulationVector]struct{}, len(vectors))
	for _, v := range vectors {
		vectorSet[v] = struct{}{}
	}

	var bestScenario model.Scenario
	var highestScore int

	// Prefer specific scenarios first
	for _, s := range e.scenarios {
		if s.ID == "generic_emergency" {
			continue
		}
		score := 0

		// Keyword matching with raw text and canonical tokens
		for _, kw := range s.Keywords {
			kwNorm := NormalizeText(kw)
			if strings.Contains(normalized, kwNorm) {
				score += 3
			} else {
				for _, part := range strings.Fields(kwNorm) {
					if _, ok := canonicalSet[part]; ok {
						score += 2
					}
				}
			}
		}

		// Psychological vector alignment bonus
		switch s.Category {
		case "job_scam":
			if _, ok := vectorSet[VectorUpfrontFee]; ok {
				score += 4
			}
			if _, ok := vectorSet[VectorTooGood]; ok {
				score += 3
			}
		case "giveaway":
			if _, ok := vectorSet[VectorTooGood]; ok {
				score += 4
			}
			if _, ok := vectorSet[VectorUpfrontFee]; ok {
				score += 2
			}
		case "impersonation":
			if _, ok := vectorSet[VectorImpersonation]; ok {
				score += 5
			}
			if _, ok := vectorSet[VectorUrgency]; ok {
				score += 2
			}
		case "phishing":
			if _, ok := vectorSet[VectorUrgency]; ok {
				score += 3
			}
			if _, ok := vectorSet[VectorImpersonation]; ok {
				score += 3
			}
		case "loan":
			if _, ok := vectorSet[VectorTooGood]; ok {
				score += 3
			}
			if _, ok := vectorSet[VectorUrgency]; ok {
				score += 2
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

	// Also boost tags if free text triggers manipulation vectors
	detectedVectors := []string{}
	if req.FreeText != "" {
		vectors := DetectManipulationVectors(req.FreeText)
		for _, v := range vectors {
			detectedVectors = append(detectedVectors, string(v))
			switch v {
			case VectorUrgency:
				selectedTagsMap["urgensi"]++
			case VectorUpfrontFee:
				selectedTagsMap["uang_muka"]++
			case VectorImpersonation:
				selectedTagsMap["rekayasa_identitas"]++
			case VectorIsolation:
				selectedTagsMap["isolasi"]++
			case VectorTooGood:
				selectedTagsMap["imbalan_berlebih"]++
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
	for _, tpl := range scenario.WarningTemplates {
		if tpl.Tone == "casual" && casualText == "" {
			casualText = tpl.Text
		}
		if tpl.Tone == "firm" && firmText == "" {
			firmText = tpl.Text
		}
	}

	perspectiveSummary := "Berdasarkan sudut pandang pelaku yang kamu telaah, manipulasi ini sengaja membatasi waktu verifikasi korban."
	if len(perspectiveReasons) > 0 {
		perspectiveSummary = fmt.Sprintf("Melalui sudut pandang pelaku, kamu mengidentifikasi fokus pada: %s.", strings.Join(perspectiveReasons, "; "))
	}
	if len(detectedVectors) > 0 {
		perspectiveSummary += fmt.Sprintf(" NLP Engine mendeteksi indikator manipulasi psikologis: %s.", strings.Join(detectedVectors, ", "))
	}

	return model.ReflectResponse{
		ScenarioID:         scenario.ID,
		MatchedCategory:    scenario.Category,
		UserDetectedFlaws:  flawResults,
		SafeSteps:          safeSteps,
		WarningTemplates: model.WarningTemplatesResponse{
			Casual: casualText,
			Firm:   firmText,
		},
		ConfidenceNote:     "Ini alat bantu berpikir dan analisa rekayasa sosial, bukan deteksi pasti.",
		PerspectiveSummary: perspectiveSummary,
	}, nil
}
