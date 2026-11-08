package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

var ok = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })

func TestRateLimit_RetryAfter20(t *testing.T) {
	h := RateLimit(ok)
	var rec *httptest.ResponseRecorder
	for i := 0; i <= limiter.limit; i++ {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.RemoteAddr = "203.0.113.7:1234"
		rec = httptest.NewRecorder()
		h.ServeHTTP(rec, req)
	}
	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("status = %d, mau 429", rec.Code)
	}
	if got := rec.Header().Get("Retry-After"); got != "20" {
		t.Fatalf("Retry-After = %q, mau 20", got)
	}
	if !strings.Contains(rec.Body.String(), `"code":"RATE_LIMITED"`) || !strings.Contains(rec.Body.String(), `"retry_after":20`) {
		t.Fatalf("body tidak sesuai openapi: %s", rec.Body.String())
	}
}

func TestCORS(t *testing.T) {
	t.Setenv("CORS_ORIGIN", "https://ato.contoh.id, http://localhost:3000")
	h := CORS(ok)

	cases := []struct {
		origin, method string
		wantAllow      string
		wantCode       int
	}{
		{"https://ato.contoh.id", http.MethodGet, "https://ato.contoh.id", 200},
		{"http://localhost:3000", http.MethodOptions, "http://localhost:3000", 204},
		{"https://ato.contoh.id.jahat.id", http.MethodGet, "", 200}, // dulu lolos via strings.Contains
		{"https://contoh.id", http.MethodGet, "", 200},
		{"", http.MethodGet, "", 200},
	}
	for _, c := range cases {
		req := httptest.NewRequest(c.method, "/", nil)
		if c.origin != "" {
			req.Header.Set("Origin", c.origin)
		}
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if got := rec.Header().Get("Access-Control-Allow-Origin"); got != c.wantAllow {
			t.Errorf("origin %q: Allow-Origin = %q, mau %q", c.origin, got, c.wantAllow)
		}
		if rec.Code != c.wantCode {
			t.Errorf("origin %q %s: status %d, mau %d", c.origin, c.method, rec.Code, c.wantCode)
		}
	}
}

func TestCORS_DefaultLocalhost(t *testing.T) {
	t.Setenv("CORS_ORIGIN", "")
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	CORS(ok).ServeHTTP(rec, req)
	if rec.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
		t.Fatal("default dev origin harus diizinkan")
	}
}
