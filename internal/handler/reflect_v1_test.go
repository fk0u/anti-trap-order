package handler_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestV1Reflect(t *testing.T) {
	postReflect := func(body string) *httptest.ResponseRecorder {
		rec := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/api/v1/lite/reflect", strings.NewReader(body))
		setupTestServer(t).ServeHTTP(rec, req)
		return rec
	}
	good := `{"scenario_id":"wfh_admin_fee","answers":[{"question_id":"q1","option_ids":["q1_a"]},{"question_id":"q2","option_ids":["q2_a","q2_b"]},{"question_id":"q3","option_ids":["q3_e"]}]}`
	rec := postReflect(good)
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"found_count":3`) || !strings.Contains(rec.Body.String(), "bukan deteksi pasti") {
		t.Errorf("200 salah: %d %s", rec.Code, rec.Body)
	}
	if rec := postReflect(strings.Replace(good, "wfh_admin_fee", "nope", 1)); rec.Code != 404 {
		t.Errorf("404 salah: %d", rec.Code)
	}
	if rec := postReflect(`{"scenario_id":"wfh_admin_fee","answers":[],"x":1}`); rec.Code != 400 || !strings.Contains(rec.Body.String(), "VALIDATION_ERROR") {
		t.Errorf("400 salah: %d %s", rec.Code, rec.Body)
	}
	rec = postReflect(`{"scenario_id":"` + strings.Repeat("a", 9000) + `"}`)
	if rec.Code != 400 {
		t.Errorf("body besar: %d", rec.Code)
	}
}
