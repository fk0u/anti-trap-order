package handler

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"unicode/utf8"

	"prototype-ato/internal/data"
	"prototype-ato/internal/ml"
	"prototype-ato/internal/model"
	"prototype-ato/internal/reflect"
	"prototype-ato/internal/soul"
)

type Server struct {
	repo          *data.Repository
	reflectEngine *reflect.Engine
	soulEngine    *soul.Engine
	mlModel       *ml.Model // nil jika model gagal dimuat
	mlScenarios   []ml.Scenario
}

func NewServer(repo *data.Repository) *Server {
	scenariosSummary := repo.ListScenarios()
	fullScenarios := make([]model.Scenario, len(scenariosSummary))
	for i, s := range scenariosSummary {
		full, _ := repo.GetScenarioByID(s.ID)
		fullScenarios[i] = full
	}

	soulArcsSummary := repo.ListSoulArcs()
	fullSoulArcs := make([]model.SoulArc, len(soulArcsSummary))
	for i, a := range soulArcsSummary {
		full, _ := repo.GetSoulArcByID(a.ID)
		fullSoulArcs[i] = full
	}

	mlModel, _ := ml.Load() // gagal -> nil; endpoint analyze membalas 500

	return &Server{
		mlModel:       mlModel,
		mlScenarios:   ml.IndexScenarios(repo),
		repo:          repo,
		reflectEngine: reflect.NewEngine(fullScenarios),
		soulEngine:    soul.NewEngine(fullSoulArcs),
	}
}

func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", s.handleHealth)
	mux.HandleFunc("GET /api/reflect/scenarios", s.handleListScenarios)
	mux.HandleFunc("GET /api/reflect/scenarios/{id}", s.handleGetScenarioByID)
	mux.HandleFunc("POST /api/reflect", s.handleReflect)
	mux.HandleFunc("GET /api/soul/arcs", s.handleListSoulArcs)
	mux.HandleFunc("POST /api/soul/step", s.handleSoulStep)
	mux.HandleFunc("POST /api/v1/lite/analyze", s.handleAnalyze)

	return mux
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, model.ErrorResponse{
		Error: model.ErrorDetail{
			Code:    code,
			Message: message,
		},
	})
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status":    "ok",
		"timestamp": "2026-10-28T00:00:00Z",
		"version":   "1.0.0",
		"system":    "Anti Trap Order (ATO) - A20 Engine",
	})
}

func (s *Server) handleListScenarios(w http.ResponseWriter, r *http.Request) {
	scenarios := s.repo.ListScenarios()
	writeJSON(w, http.StatusOK, scenarios)
}

func (s *Server) handleGetScenarioByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "INVALID_ID", "ID skenario wajib disertakan")
		return
	}

	scenario, ok := s.repo.GetScenarioByID(id)
	if !ok {
		writeError(w, http.StatusNotFound, "NOT_FOUND", "Skenario tidak ditemukan")
		return
	}

	writeJSON(w, http.StatusOK, scenario)
}

func (s *Server) handleReflect(w http.ResponseWriter, r *http.Request) {
	var req model.ReflectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_JSON", "Payload request tidak valid")
		return
	}

	// Invariant validation: free_text max 1000 characters
	if len(req.FreeText) > 1000 {
		writeError(w, http.StatusBadRequest, "TEXT_TOO_LONG", "Teks situasi tidak boleh melebihi 1000 karakter")
		return
	}

	if req.ScenarioID == "" && strings.TrimSpace(req.FreeText) == "" {
		writeError(w, http.StatusBadRequest, "MISSING_INPUT", "Wajib memilih skenario_id atau memasukkan teks situasi")
		return
	}

	resp, err := s.reflectEngine.ProcessReflection(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, "PROCESSING_ERROR", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

func (s *Server) handleListSoulArcs(w http.ResponseWriter, r *http.Request) {
	arcs := s.repo.ListSoulArcs()
	writeJSON(w, http.StatusOK, arcs)
}

func (s *Server) handleSoulStep(w http.ResponseWriter, r *http.Request) {
	var req model.SoulStepRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_JSON", "Payload request tidak valid")
		return
	}

	if req.ArcID == "" || req.NodeID == "" || req.ChoiceID == "" {
		writeError(w, http.StatusBadRequest, "MISSING_FIELDS", "arc_id, node_id, dan choice_id wajib diisi")
		return
	}

	resp, err := s.soulEngine.Step(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, "STEP_ERROR", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

const (
	analyzeMaxBody = 8 << 10
	analyzeMaxText = 2000
)

func validationError(w http.ResponseWriter, msg string) {
	writeJSON(w, http.StatusBadRequest, model.ErrorResponse{
		Error: model.ErrorDetail{Code: "VALIDATION_ERROR", Message: msg, Field: "text"},
	})
}

// handleAnalyze tidak pernah mencatat atau mengembalikan teks user, termasuk di pesan error.
func (s *Server) handleAnalyze(w http.ResponseWriter, r *http.Request) {
	if s.mlModel == nil {
		writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Ada kendala di server. Coba lagi sebentar ya.")
		return
	}
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, analyzeMaxBody))
	dec.DisallowUnknownFields()
	var req struct {
		Text *string `json:"text"`
	}
	if err := dec.Decode(&req); err != nil {
		validationError(w, "Permintaan tidak bisa dibaca. Pastikan isinya hanya teks situasi.")
		return
	}
	if _, err := dec.Token(); !errors.Is(err, io.EOF) {
		validationError(w, "Permintaan tidak bisa dibaca. Pastikan isinya hanya teks situasi.")
		return
	}
	if req.Text == nil || strings.TrimSpace(*req.Text) == "" {
		validationError(w, "Tulis dulu situasinya ya, supaya bisa kami bantu pikirkan.")
		return
	}
	if utf8.RuneCountInString(*req.Text) > analyzeMaxText {
		validationError(w, "Teksnya terlalu panjang. Ringkas jadi maksimal 2000 karakter ya.")
		return
	}
	writeJSON(w, http.StatusOK, ml.Analyze(s.mlModel, *req.Text, s.mlScenarios))
}
