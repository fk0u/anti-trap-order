package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"prototype-ato/internal/data"
	"prototype-ato/internal/handler"
	"prototype-ato/internal/model"
)

func setupTestServer(t *testing.T) http.Handler {
	repo, err := data.Load()
	if err != nil {
		t.Fatalf("failed to load repo: %v", err)
	}
	s := handler.NewServer(repo)
	return s.Routes()
}

func TestHandler_Health(t *testing.T) {
	app := setupTestServer(t)

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rec := httptest.NewRecorder()

	app.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}

	var body map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("invalid json: %v", err)
	}
	if body["status"] != "ok" {
		t.Errorf("expected status 'ok', got '%s'", body["status"])
	}
}

func TestHandler_Scenarios(t *testing.T) {
	app := setupTestServer(t)

	// 1. List scenarios
	req := httptest.NewRequest(http.MethodGet, "/api/reflect/scenarios", nil)
	rec := httptest.NewRecorder()
	app.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}

	var list []model.ScenarioSummary
	if err := json.Unmarshal(rec.Body.Bytes(), &list); err != nil {
		t.Fatalf("invalid json: %v", err)
	}
	if len(list) < 6 {
		t.Errorf("expected at least 6 scenarios, got %d", len(list))
	}

	// 2. Get Single Scenario
	targetID := list[0].ID
	reqSingle := httptest.NewRequest(http.MethodGet, "/api/reflect/scenarios/"+targetID, nil)
	recSingle := httptest.NewRecorder()
	app.ServeHTTP(recSingle, reqSingle)

	if recSingle.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", recSingle.Code)
	}

	var single model.Scenario
	if err := json.Unmarshal(recSingle.Body.Bytes(), &single); err != nil {
		t.Fatalf("invalid json: %v", err)
	}
	if single.ID != targetID {
		t.Errorf("expected ID '%s', got '%s'", targetID, single.ID)
	}
}

func TestHandler_Reflect(t *testing.T) {
	app := setupTestServer(t)

	// Test 1: Valid Reflect request
	payload := model.ReflectRequest{
		ScenarioID: "wfh_admin_fee",
		Answers: []model.ReflectUserAnswer{
			{QuestionID: "q1", SelectedOptionID: "q1_opt1"},
			{QuestionID: "q2", SelectedOptionID: "q2_opt1"},
		},
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/reflect", bytes.NewReader(body))
	rec := httptest.NewRecorder()
	app.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d. Body: %s", rec.Code, rec.Body.String())
	}

	var resp model.ReflectResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode reflect response: %v", err)
	}
	if len(resp.UserDetectedFlaws) == 0 {
		t.Error("expected non-empty flaws")
	}

	// Test 2: Invariant Check - FreeText length > 1000 rejected
	longPayload := model.ReflectRequest{
		FreeText: strings.Repeat("A", 1005),
	}
	longBody, _ := json.Marshal(longPayload)

	reqLong := httptest.NewRequest(http.MethodPost, "/api/reflect", bytes.NewReader(longBody))
	recLong := httptest.NewRecorder()
	app.ServeHTTP(recLong, reqLong)

	if recLong.Code != http.StatusBadRequest {
		t.Errorf("expected status 400 for text too long, got %d", recLong.Code)
	}
}

func TestHandler_SoulStep(t *testing.T) {
	app := setupTestServer(t)

	// List arcs
	reqList := httptest.NewRequest(http.MethodGet, "/api/soul/arcs", nil)
	recList := httptest.NewRecorder()
	app.ServeHTTP(recList, reqList)

	if recList.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", recList.Code)
	}

	// Step request
	stepReq := model.SoulStepRequest{
		ArcID:    "arc_dian_parttime",
		NodeID:   "arc1_n1",
		ChoiceID: "c1_inversion_prompt",
		State: model.GuardianState{
			Trust:     60,
			Awareness: 30,
			Empathy:   50,
		},
	}
	stepBody, _ := json.Marshal(stepReq)

	reqStep := httptest.NewRequest(http.MethodPost, "/api/soul/step", bytes.NewReader(stepBody))
	recStep := httptest.NewRecorder()
	app.ServeHTTP(recStep, reqStep)

	if recStep.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d. Body: %s", recStep.Code, recStep.Body.String())
	}

	var stepResp model.SoulStepResponse
	if err := json.Unmarshal(recStep.Body.Bytes(), &stepResp); err != nil {
		t.Fatalf("invalid json: %v", err)
	}

	if stepResp.NextNode == nil {
		t.Error("expected next node to be non-nil")
	}
}
