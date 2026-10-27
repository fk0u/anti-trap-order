package middleware

import (
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type ipRateLimiter struct {
	mu      sync.Mutex
	clients map[string]*clientBucket
	limit   int
	window  time.Duration
}

type clientBucket struct {
	count     int
	resetTime time.Time
}

var limiter = &ipRateLimiter{
	clients: make(map[string]*clientBucket),
	limit:   120, // 120 requests per minute per IP
	window:  time.Minute,
}

func getClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	if xrip := r.Header.Get("X-Real-IP"); xrip != "" {
		return strings.TrimSpace(xrip)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}

func (l *ipRateLimiter) allow(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	bucket, exists := l.clients[ip]
	if !exists || now.After(bucket.resetTime) {
		l.clients[ip] = &clientBucket{
			count:     1,
			resetTime: now.Add(l.window),
		}
		return true
	}

	if bucket.count >= l.limit {
		return false
	}

	bucket.count++
	return true
}

func RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := getClientIP(r)
		if !limiter.allow(ip) {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.Header().Set("Retry-After", "60")
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"error":{"code":"RATE_LIMIT_EXCEEDED","message":"Terlalu banyak permintaan. Silakan coba lagi sebentar lagi."}}`))
			return
		}
		next.ServeHTTP(w, r)
	})
}

func RequestSizeLimit(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
			next.ServeHTTP(w, r)
		})
	}
}

func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		next.ServeHTTP(w, r)
	})
}

func CORS(next http.Handler) http.Handler {
	allowedOrigin := os.Getenv("CORS_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "*"
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if allowedOrigin == "*" {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		} else if origin != "" && strings.Contains(allowedOrigin, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// PanicRecovery recovers from panics and logs metadata ONLY (NEVER user body or inputs)
func PanicRecovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				// Strict invariant: log method and path only, ZERO body logging
				log.Printf("[PANIC_RECOVERED] %s %s - error: %v", r.Method, r.URL.Path, rec)
				w.Header().Set("Content-Type", "application/json; charset=utf-8")
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte(`{"error":{"code":"INTERNAL_ERROR","message":"Terjadi kendala pada server. Silakan coba kembali."}}`))
			}
		}()
		next.ServeHTTP(w, r)
	})
}
