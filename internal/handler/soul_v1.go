package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"

	"prototype-ato/internal/data"
	"prototype-ato/internal/model"
	"prototype-ato/internal/soulv1"
)

const soulMaxBody = 8 << 10

var unknownFieldRe = regexp.MustCompile(`^json: unknown field "([a-z_]{1,30})"$`)

// registerSoulV1 memuat konten Soul dan panik saat start jika tidak valid (fail-fast).
func (s *Server) registerSoulV1(mux *http.ServeMux) {
	c, err := data.LoadSoulV1(s.repo.V1().Characters)
	if err != nil {
		panic(fmt.Sprintf("konten soul v1 tidak valid: %v", err))
	}
	e := soulv1.New(c)
	mux.HandleFunc("POST /api/v1/soul/start", func(w http.ResponseWriter, r *http.Request) {
		var req soulv1.StartRequest
		if !decodeSoul(w, r, &req) {
			return
		}
		resp, serr := e.Start(req)
		writeSoul(w, resp, serr)
	})
	mux.HandleFunc("POST /api/v1/soul/step", func(w http.ResponseWriter, r *http.Request) {
		var req soulv1.StepRequest
		if !decodeSoul(w, r, &req) {
			return
		}
		resp, serr := e.Step(req)
		writeSoul(w, resp, serr)
	})
}

func writeSoul(w http.ResponseWriter, resp any, err *soulv1.Error) {
	if err != nil {
		writeJSON(w, err.Status, model.ErrorResponse{Error: model.ErrorDetail{Code: err.Code, Message: err.Message, Field: err.Field}})
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

// decodeSoul: batas 8 KB, field tak dikenal ditolak, data sisa ditolak. Isi body tidak pernah dicatat
// atau dikembalikan; pesan galat hanya memuat nama field.
func decodeSoul(w http.ResponseWriter, r *http.Request, v any) bool {
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, soulMaxBody))
	dec.DisallowUnknownFields()
	err := dec.Decode(v)
	if err == nil {
		if _, terr := dec.Token(); !errors.Is(terr, io.EOF) {
			err = errors.New("trailing")
		}
	}
	if err == nil {
		return true
	}
	field, msg := "", "Permintaan tidak bisa dibaca. Pastikan isinya hanya pilihan ceritamu."
	var te *json.UnmarshalTypeError
	var mb *http.MaxBytesError
	switch {
	case errors.As(err, &te):
		field = te.Field
	case errors.As(err, &mb):
		msg = "Permintaan terlalu besar."
	default:
		if m := unknownFieldRe.FindStringSubmatch(err.Error()); m != nil {
			field, msg = m[1], "Ada isian yang tidak dikenal. Server hanya menerima ID pilihan, bukan nama atau teks."
		}
	}
	writeJSON(w, http.StatusBadRequest, model.ErrorResponse{Error: model.ErrorDetail{Code: "VALIDATION_ERROR", Message: msg, Field: field}})
	return false
}
