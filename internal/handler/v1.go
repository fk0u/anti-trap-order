package handler

import (
	"net/http"
	"slices"
	"time"

	"prototype-ato/internal/data"
	"prototype-ato/internal/model"
)

const apiVersion = "1.0.0"

// registerV1 mendaftarkan endpoint GET konten v1 (analyze didaftarkan di Routes).
func (s *Server) registerV1(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/v1/health", s.v1Health)
	mux.HandleFunc("GET /api/v1/lite/categories", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, s.repo.V1().Categories)
	})
	mux.HandleFunc("GET /api/v1/lite/tactics", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, s.repo.V1().Tactics)
	})
	mux.HandleFunc("GET /api/v1/lite/scenarios", s.v1ListScenarios)
	mux.HandleFunc("GET /api/v1/lite/scenarios/{scenarioId}", s.v1GetScenario)
	mux.HandleFunc("GET /api/v1/soul/characters", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, s.repo.V1().Characters)
	})
	s.registerSoulV1(mux)
}

func (s *Server) v1Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, model.Health{
		Status:         "ok",
		Version:        apiVersion,
		ContentVersion: data.ContentVersion,
		Time:           time.Now().UTC().Format(time.RFC3339),
	})
}

func (s *Server) v1ListScenarios(w http.ResponseWriter, r *http.Request) {
	cat := r.URL.Query().Get("category")
	if r.URL.Query().Has("category") && !slices.Contains(model.CategoryIDs, cat) {
		writeJSON(w, http.StatusBadRequest, model.ErrorResponse{Error: model.ErrorDetail{
			Code: "VALIDATION_ERROR", Message: "Kategori tidak dikenal. Pilih salah satu kategori yang tersedia.", Field: "category"}})
		return
	}
	out := []model.V1ScenarioSummary{}
	for _, sc := range s.repo.V1().Scenarios {
		if cat == "" || sc.Category == cat {
			out = append(out, sc.Summary())
		}
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *Server) v1GetScenario(w http.ResponseWriter, r *http.Request) {
	sc, ok := s.repo.V1().Scenario(r.PathValue("scenarioId"))
	if !ok {
		writeError(w, http.StatusNotFound, "NOT_FOUND", "Skenario tidak ditemukan.")
		return
	}
	writeJSON(w, http.StatusOK, sc.Detail())
}
