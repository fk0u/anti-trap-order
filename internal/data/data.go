package data

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"sync"

	"prototype-ato/internal/model"
)

//go:embed scenarios.json
var scenariosRaw []byte

//go:embed soul-arcs.json
var soulArcsRaw []byte

type Repository struct {
	mu           sync.RWMutex
	scenarios    []model.Scenario
	scenarioMap  map[string]model.Scenario
	soulArcs     []model.SoulArc
	soulArcMap   map[string]model.SoulArc
}

var (
	defaultRepo *Repository
	once        sync.Once
)

func Load() (*Repository, error) {
	var scenarios []model.Scenario
	if err := json.Unmarshal(scenariosRaw, &scenarios); err != nil {
		return nil, fmt.Errorf("failed to parse scenarios.json: %w", err)
	}

	var soulArcs []model.SoulArc
	if err := json.Unmarshal(soulArcsRaw, &soulArcs); err != nil {
		return nil, fmt.Errorf("failed to parse soul-arcs.json: %w", err)
	}

	scenarioMap := make(map[string]model.Scenario, len(scenarios))
	for _, s := range scenarios {
		if s.ID == "" {
			return nil, fmt.Errorf("scenario missing ID: %+v", s)
		}
		scenarioMap[s.ID] = s
	}

	soulArcMap := make(map[string]model.SoulArc, len(soulArcs))
	for _, a := range soulArcs {
		if a.ID == "" {
			return nil, fmt.Errorf("soul arc missing ID: %+v", a)
		}
		soulArcMap[a.ID] = a
	}

	repo := &Repository{
		scenarios:   scenarios,
		scenarioMap: scenarioMap,
		soulArcs:    soulArcs,
		soulArcMap:  soulArcMap,
	}

	return repo, nil
}

func GetDefault() *Repository {
	once.Do(func() {
		var err error
		defaultRepo, err = Load()
		if err != nil {
			panic(fmt.Sprintf("fatal: failed to initialize data repository: %v", err))
		}
	})
	return defaultRepo
}

func (r *Repository) ListScenarios() []model.ScenarioSummary {
	r.mu.RLock()
	defer r.mu.RUnlock()

	summaries := make([]model.ScenarioSummary, len(r.scenarios))
	for i, s := range r.scenarios {
		preview := ""
		if len(s.VictimView) > 0 {
			preview = s.VictimView[0].Text
		}
		summaries[i] = model.ScenarioSummary{
			ID:          s.ID,
			Title:       s.Title,
			Category:    s.Category,
			Difficulty:  s.Difficulty,
			PreviewText: preview,
		}
	}
	return summaries
}

func (r *Repository) GetScenarioByID(id string) (model.Scenario, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	s, ok := r.scenarioMap[id]
	return s, ok
}

func (r *Repository) ListSoulArcs() []model.SoulArcSummary {
	r.mu.RLock()
	defer r.mu.RUnlock()

	summaries := make([]model.SoulArcSummary, len(r.soulArcs))
	for i, a := range r.soulArcs {
		synopsis := a.Ward.Context
		if len(a.Nodes) > 0 {
			synopsis = a.Nodes[0].Narration
		}
		summaries[i] = model.SoulArcSummary{
			ID:       a.ID,
			Title:    a.Title,
			Ward:     a.Ward,
			Synopsis: synopsis,
		}
	}
	return summaries
}

func (r *Repository) GetSoulArcByID(id string) (model.SoulArc, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	a, ok := r.soulArcMap[id]
	return a, ok
}
