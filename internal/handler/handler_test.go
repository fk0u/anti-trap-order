package handler_test

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
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

func postAnalyze(app http.Handler, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodPost, "/api/v1/lite/analyze", strings.NewReader(body))
	rec := httptest.NewRecorder()
	app.ServeHTTP(rec, req)
	return rec
}

func TestHandler_Analyze_OK(t *testing.T) {
	app := setupTestServer(t)
	var logBuf bytes.Buffer
	log.SetOutput(&logBuf)
	defer log.SetOutput(os.Stderr)

	const secret = "rahasiaunikxyz lowongan admin WFH tf biaya seragam 150rb sekarang juga ya kak"
	rec := postAnalyze(app, `{"text":"`+secret+`"}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d: %s", rec.Code, rec.Body)
	}
	var body map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if _, ok := body["tactics"].([]any); !ok {
		t.Errorf("tactics harus array: %v", body["tactics"])
	}
	if body["disclaimer"] != "Ini alat bantu berpikir, bukan deteksi pasti." || body["model_version"] == "" {
		t.Errorf("disclaimer/model_version salah: %v", body)
	}
	if strings.Contains(logBuf.String(), "rahasiaunikxyz") {
		t.Error("teks user muncul di log")
	}
}

func TestHandler_Analyze_Invalid(t *testing.T) {
	app := setupTestServer(t)
	var logBuf bytes.Buffer
	log.SetOutput(&logBuf)
	defer log.SetOutput(os.Stderr)

	cases := map[string]string{
		"field tak dikenal": `{"text":"rahasiaunikxyz halo semua","extra":1}`,
		"kosong":            `{"text":""}`,
		"spasi saja":        `{"text":"   \n  "}`,
		"tanpa text":        `{}`,
		"2001 rune":         `{"text":"` + strings.Repeat("é", 2001) + `"}`,
		"json rusak":        `{"text":"rahasiaunikxyz`,
		"data tambahan":     `{"text":"rahasiaunikxyz halo"}{"text":"x"}`,
	}
	for name, body := range cases {
		rec := postAnalyze(app, body)
		if rec.Code != http.StatusBadRequest {
			t.Errorf("%s: status %d", name, rec.Code)
			continue
		}
		var er model.ErrorResponse
		if err := json.Unmarshal(rec.Body.Bytes(), &er); err != nil || er.Error.Code != "VALIDATION_ERROR" || er.Error.Field != "text" || er.Error.Message == "" {
			t.Errorf("%s: error salah: %s", name, rec.Body)
		}
		if strings.Contains(rec.Body.String(), "rahasiaunikxyz") {
			t.Errorf("%s: teks user ada di respons", name)
		}
	}
	// 2000 rune persis masih boleh
	if rec := postAnalyze(app, `{"text":"`+strings.Repeat("é", 2000)+`"}`); rec.Code != http.StatusOK {
		t.Errorf("2000 rune harus 200, dapat %d", rec.Code)
	}
	if strings.Contains(logBuf.String(), "rahasiaunikxyz") {
		t.Error("teks user muncul di log")
	}
}
