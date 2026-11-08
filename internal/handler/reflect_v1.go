package handler

import (
	"io"
	"net/http"

	"prototype-ato/internal/lite"
)

const reflectMaxBody = 8 << 10

// v1Reflect tidak pernah mencatat body request.
func (s *Server) v1Reflect(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, reflectMaxBody))
	if err != nil {
		body = nil // body terlalu besar/putus -> jatuh ke 400 "tidak bisa dibaca"
	}
	status, out := lite.Handle(s.repo.V1(), body)
	writeJSON(w, status, out)
}
