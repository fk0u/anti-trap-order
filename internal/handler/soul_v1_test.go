package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"reflect"
	"strings"
	"testing"
)

const fixturePath = "../../testdata/fixtures/soul-v1.json"

type soulFixture struct {
	Name     string          `json:"name"`
	Endpoint string          `json:"endpoint"`
	Request  json.RawMessage `json:"request"`
	Status   int             `json:"status"`
	Response json.RawMessage `json:"response"`
}

func postSoul(t *testing.T, path, body string) (int, map[string]any) {
	t.Helper()
	rec := httptest.NewRecorder()
	setupTestServer(t).ServeHTTP(rec, httptest.NewRequest(http.MethodPost, path, strings.NewReader(body)))
	var out map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("respons bukan JSON: %v", err)
	}
	return rec.Code, out
}

// UPDATE_FIXTURES=1 go test ./internal/handler -run SoulV1Fixture mengisi ulang response; periksa diff-nya.
func TestSoulV1Fixture(t *testing.T) {
	raw, err := os.ReadFile(fixturePath)
	if err != nil {
		t.Fatal(err)
	}
	var cases []soulFixture
	if err := json.Unmarshal(raw, &cases); err != nil {
		t.Fatal(err)
	}
	if len(cases) < 10 {
		t.Fatal("fixture kurang dari 10 kasus")
	}
	update := os.Getenv("UPDATE_FIXTURES") == "1"
	app := setupTestServer(t)
	for i, c := range cases {
		t.Run(c.Name, func(t *testing.T) {
			path := strings.TrimPrefix(c.Endpoint, "POST ")
			rec := httptest.NewRecorder()
			app.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, path, bytes.NewReader(c.Request)))
			if rec.Code != c.Status {
				t.Fatalf("status %d, mau %d: %s", rec.Code, c.Status, rec.Body)
			}
			if update {
				cases[i].Response = bytes.TrimSpace(rec.Body.Bytes())
				return
			}
			var got, want any
			_ = json.Unmarshal(rec.Body.Bytes(), &got)
			if err := json.Unmarshal(c.Response, &want); err != nil || !reflect.DeepEqual(got, want) {
				t.Errorf("respons beda dari fixture:\n got %s\nwant %s", rec.Body, c.Response)
			}
		})
	}
	if update {
		var buf bytes.Buffer
		enc := json.NewEncoder(&buf)
		enc.SetIndent("", "  ")
		enc.SetEscapeHTML(false)
		if err := enc.Encode(cases); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(fixturePath, buf.Bytes(), 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

func TestSoulV1Handler(t *testing.T) {
	valid := `{"arc_id":"arc_investasi","mission_id":"m1","choice_id":"B","meters":{"kepercayaan":60,"kewaspadaan":40,"keamanan":60}}`
	cases := []struct {
		name, path, body string
		status           int
		field            string
	}{
		{"ok", "/api/v1/soul/step", valid, 200, ""},
		{"data sisa", "/api/v1/soul/step", valid + `{"x":1}`, 400, ""},
		{"bukan json", "/api/v1/soul/start", `arc`, 400, ""},
		{"body kosong", "/api/v1/soul/start", ``, 400, ""},
		{"body > 8 KB", "/api/v1/soul/start", `{"arc_id":"` + strings.Repeat("a", 9000) + `"}`, 400, ""},
		{"tipe salah", "/api/v1/soul/step", strings.Replace(valid, `"kepercayaan":60`, `"kepercayaan":"60"`, 1), 400, "meters.kepercayaan"},
		{"meter desimal", "/api/v1/soul/step", strings.Replace(valid, `"keamanan":60`, `"keamanan":60.5`, 1), 400, "meters.keamanan"},
		{"meter negatif", "/api/v1/soul/step", strings.Replace(valid, `"kewaspadaan":40`, `"kewaspadaan":-1`, 1), 400, "meters.kewaspadaan"},
		{"arc kosong", "/api/v1/soul/start", `{}`, 400, "arc_id"},
		{"nama di step", "/api/v1/soul/step", strings.Replace(valid, `"arc_id"`, `"nama":"Nadia","arc_id"`, 1), 400, "nama"},
		{"choice null", "/api/v1/soul/step", strings.Replace(valid, `"choice_id":"B"`, `"choice_id":null`, 1), 400, "choice_id"},
		{"mission kosong", "/api/v1/soul/step", strings.Replace(valid, `"mission_id":"m1"`, `"mission_id":""`, 1), 400, "mission_id"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			code, out := postSoul(t, c.path, c.body)
			if code != c.status {
				t.Fatalf("status %d, mau %d: %v", code, c.status, out)
			}
			if code == 400 {
				e, _ := out["error"].(map[string]any)
				f, _ := e["field"].(string)
				if e["code"] != "VALIDATION_ERROR" || e["message"] == "" || f != c.field {
					t.Errorf("error salah: %v", e)
				}
				if b, _ := json.Marshal(out); strings.Contains(string(b), "Nadia") {
					t.Error("galat memantulkan isi body")
				}
			}
		})
	}
}
