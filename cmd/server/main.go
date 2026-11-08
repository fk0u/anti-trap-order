package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"prototype-ato/internal/data"
	"prototype-ato/internal/handler"
	"prototype-ato/internal/middleware"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("==> Initializing Anti Trap Order (ATO) - A20 Backend Engine...")

	// 1. Load data repository (fail-fast)
	repo, err := data.Load()
	if err != nil {
		log.Fatalf("FATAL: failed to load embedded scenario datasets: %v", err)
	}

	scenarios := repo.ListScenarios()
	soulArcs := repo.ListSoulArcs()
	log.Printf("✓ Dataset loaded: %d scenarios, %d soul arcs ready.", len(scenarios), len(soulArcs))
	v1 := repo.V1() // sudah divalidasi fail-fast di data.Load
	log.Printf("✓ Konten v1 %s: %d kategori, %d taktik, %d skenario.", data.ContentVersion, len(v1.Categories), len(v1.Tactics), len(v1.Scenarios))

	// 2. Setup handlers and routes
	server := handler.NewServer(repo)
	routes := server.Routes()

	// 3. Assemble middleware chain
	var h http.Handler = routes
	h = middleware.RateLimit(h)
	h = middleware.RequestSizeLimit(1 << 20)(h) // 1MB limit
	h = middleware.CORS(h)
	h = middleware.SecurityHeaders(h)
	h = middleware.PanicRecovery(h)

	addr := fmt.Sprintf(":%s", port)
	httpServer := &http.Server{
		Addr:              addr,
		Handler:           h,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	// 4. Run server in background goroutine
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("🚀 ATO A20 Backend listening on %s (ready for Next.js & external clients)", addr)
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// 5. Wait for shutdown signal
	sig := <-shutdownChan
	log.Printf("Received signal '%v'. Initiating graceful shutdown...", sig)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(ctx); err != nil {
		log.Printf("Error during server shutdown: %v", err)
	} else {
		log.Println("✓ ATO server gracefully stopped.")
	}
}
