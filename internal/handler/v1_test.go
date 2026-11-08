package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func getV1(t *testing.T, path string) (int, []byte) {
	t.Helper()
	rec := httptest.NewRecorder()
	setupTestServer(t).ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
	return rec.Code, rec.Body.Bytes()
}

func TestV1Health(t *testing.T) {
	code, body := getV1(t, "/api/v1/health")
	var h map[string]string
	if code != 200 || json.Unmarshal(body, &h) != nil {
		t.Fatalf("code %d body %s", code, body)
	}
	if _, err := time.Parse(time.RFC3339, h["time"]); err != nil || h["status"] != "ok" || h["version"] == "" || h["content_version"] == "" {
		t.Errorf("health salah: %v", h)
	}
}

func TestV1CategoriesAndTactics(t *testing.T) {
	var cats []map[string]string
	code, body := getV1(t, "/api/v1/lite/categories")
	if code != 200 || json.Unmarshal(body, &cats) != nil || len(cats) != 5 || cats[0]["id"] != "tawaran_kerja" || cats[0]["icon"] != "briefcase" {
		t.Errorf("kategori salah: %d %s", code, body)
	}
	var tacs []map[string]string
	code, body = getV1(t, "/api/v1/lite/tactics")
	if code != 200 || json.Unmarshal(body, &tacs) != nil || len(tacs) != 8 {
		t.Fatalf("taktik salah: %d %s", code, body)
	}
	for _, k := range []string{"id", "label", "icon", "explanation", "counter"} {
		if tacs[0][k] == "" {
			t.Errorf("taktik tanpa %s", k)
		}
	}
}

func TestV1ScenariosListAndFilter(t *testing.T) {
	var all []map[string]any
	code, body := getV1(t, "/api/v1/lite/scenarios")
	if code != 200 || json.Unmarshal(body, &all) != nil || len(all) != 10 {
		t.Fatalf("daftar salah: %d %s", code, body)
	}
	for _, k := range []string{"id", "category", "title", "example_message", "keywords", "is_fallback"} {
		if _, ok := all[0][k]; !ok {
			t.Errorf("ringkasan tanpa %s", k)
		}
	}
	var lain []map[string]any
	_, body = getV1(t, "/api/v1/lite/scenarios?category=lainnya")
	if json.Unmarshal(body, &lain) != nil || len(lain) != 3 {
		t.Errorf("filter lainnya mau 3, dapat %s", body)
	}

	code, body = getV1(t, "/api/v1/lite/scenarios?category=ngawur")
	var e struct{ Error struct{ Code, Field string } }
	if code != 400 || json.Unmarshal(body, &e) != nil || e.Error.Code != "VALIDATION_ERROR" || e.Error.Field != "category" {
		t.Errorf("kategori invalid: %d %s", code, body)
	}
}

func TestV1ScenarioDetail(t *testing.T) {
	code, body := getV1(t, "/api/v1/lite/scenarios/wfh_admin_fee")
	if code != 200 {
		t.Fatalf("code %d", code)
	}
	for _, leak := range []string{`"tags"`, `"flaws"`, `"counter"`, `"action_card"`, `"severity"`, "biaya_di_depan"} {
		if strings.Contains(string(body), leak) {
			t.Errorf("detail membocorkan %s", leak)
		}
	}
	var d struct {
		Questions []struct {
			Step    int
			Options []struct{ ID, Label string }
		}
	}
	if json.Unmarshal(body, &d) != nil || len(d.Questions) != 3 {
		t.Fatalf("pertanyaan salah: %s", body)
	}
	for i, q := range d.Questions {
		if q.Step != i+1 || len(q.Options) != 5 {
			t.Errorf("q%d: step %d, %d opsi", i+1, q.Step, len(q.Options))
		}
	}

	code, body = getV1(t, "/api/v1/lite/scenarios/tidak_ada")
	if code != 404 || !strings.Contains(string(body), "NOT_FOUND") || !strings.Contains(string(body), "Skenario tidak ditemukan.") {
		t.Errorf("404 salah: %d %s", code, body)
	}
}

func TestV1Characters(t *testing.T) {
	var c struct {
		Templates []struct{ ID, Avatar string }
		Relations []struct{ ID string }
		Max       int `json:"nickname_max_length"`
	}
	code, body := getV1(t, "/api/v1/soul/characters")
	if code != 200 || json.Unmarshal(body, &c) != nil || c.Max != 20 || len(c.Templates) < 2 || len(c.Relations) < 4 {
		t.Errorf("karakter salah: %d %s", code, body)
	}
}
