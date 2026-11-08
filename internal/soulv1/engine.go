// Package soulv1 = mesin Soul API v1 (stateless): klien mengirim ulang meter terakhir.
// Tidak ada nama karakter di sini (K5); narasi memuat {{nama}}/{{relasi}} apa adanya.
package soulv1

import (
	"net/http"

	"prototype-ato/internal/data"
)

type Meters = data.SoulMeters

type Choice struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

type Mission struct {
	ID      string   `json:"id"`
	Index   int      `json:"index"`
	Story   string   `json:"story"`
	Choices []Choice `json:"choices"`
}

type StartRequest struct {
	ArcID *string `json:"arc_id"`
}

type StartResponse struct {
	ArcID         string  `json:"arc_id"`
	TotalMissions int     `json:"total_missions"`
	Meters        Meters  `json:"meters"`
	Mission       Mission `json:"mission"`
}

// MetersIn memakai pointer supaya field yang hilang terdeteksi.
type MetersIn struct {
	Kepercayaan *int `json:"kepercayaan"`
	Kewaspadaan *int `json:"kewaspadaan"`
	Keamanan    *int `json:"keamanan"`
}

type StepRequest struct {
	ArcID     *string   `json:"arc_id"`
	MissionID *string   `json:"mission_id"`
	ChoiceID  *string   `json:"choice_id"`
	Meters    *MetersIn `json:"meters"`
}

type Consequence = data.SoulConsequence

type Summary struct {
	RankID      string   `json:"rank_id"`
	RankLabel   string   `json:"rank_label"`
	Description string   `json:"description"`
	Insights    []string `json:"insights"`
	FinalMeters Meters   `json:"final_meters"`
}

type StepResponse struct {
	MissionIndex int         `json:"mission_index"`
	ChoiceID     string      `json:"choice_id"`
	Consequence  Consequence `json:"consequence"`
	Deltas       Meters      `json:"deltas"`
	Meters       Meters      `json:"meters"`
	NextMission  *Mission    `json:"next_mission"`
	Summary      *Summary    `json:"summary"`
}

// Error dipetakan handler ke ErrorResponse. Pesan tidak pernah memuat nilai dari klien.
type Error struct {
	Status  int
	Code    string
	Message string
	Field   string
}

func (e *Error) Error() string { return e.Code + ": " + e.Message }

func invalid(field, msg string) *Error {
	return &Error{http.StatusBadRequest, "VALIDATION_ERROR", msg, field}
}

var errArc = &Error{Status: http.StatusNotFound, Code: "NOT_FOUND", Message: "Alur cerita tidak ditemukan."}

type Engine struct{ c *data.SoulV1Content }

func New(c *data.SoulV1Content) *Engine { return &Engine{c} }

func mission(a data.SoulArcContent, i int) *Mission {
	ms := a.Missions[i]
	m := &Mission{ID: ms.ID, Index: i + 1, Story: ms.Story, Choices: make([]Choice, len(ms.Choices))}
	for j, ch := range ms.Choices {
		m.Choices[j] = Choice{ch.ID, ch.Label}
	}
	return m
}

func (e *Engine) arc(id *string) (data.SoulArcContent, *Error) {
	if id == nil || *id == "" {
		return data.SoulArcContent{}, invalid("arc_id", "Pilih alur cerita dulu ya.")
	}
	a, ok := e.c.Arc(*id)
	if !ok {
		return a, errArc
	}
	return a, nil
}

func (e *Engine) Start(req StartRequest) (StartResponse, *Error) {
	a, err := e.arc(req.ArcID)
	if err != nil {
		return StartResponse{}, err
	}
	return StartResponse{a.ID, len(a.Missions), e.c.InitialMeters, *mission(a, 0)}, nil
}

func clamp(v int) int { return min(100, max(0, v)) }

func (e *Engine) Step(req StepRequest) (StepResponse, *Error) {
	a, err := e.arc(req.ArcID)
	if err != nil {
		return StepResponse{}, err
	}
	if req.MissionID == nil || *req.MissionID == "" {
		return StepResponse{}, invalid("mission_id", "Misi belum dipilih.")
	}
	mi := -1
	for i, m := range a.Missions {
		if m.ID == *req.MissionID {
			mi = i
		}
	}
	if mi < 0 {
		return StepResponse{}, invalid("mission_id", "Misi ini tidak dikenal. Mulai ulang ceritanya ya.")
	}
	if req.ChoiceID == nil {
		return StepResponse{}, invalid("choice_id", "Pilih salah satu jawaban dulu ya.")
	}
	var ch *data.SoulChoiceContent
	for i := range a.Missions[mi].Choices {
		if c := &a.Missions[mi].Choices[i]; c.ID == *req.ChoiceID {
			ch = c
		}
	}
	if ch == nil {
		return StepResponse{}, invalid("choice_id", "Pilihan harus A, B, atau C.")
	}
	cur, err := meters(req.Meters)
	if err != nil {
		return StepResponse{}, err
	}

	next := Meters{
		Kepercayaan: clamp(cur.Kepercayaan + ch.Deltas.Kepercayaan),
		Kewaspadaan: clamp(cur.Kewaspadaan + ch.Deltas.Kewaspadaan),
		Keamanan:    clamp(cur.Keamanan + ch.Deltas.Keamanan),
	}
	resp := StepResponse{MissionIndex: mi + 1, ChoiceID: ch.ID, Consequence: ch.Consequence, Deltas: ch.Deltas, Meters: next}
	if mi+1 < len(a.Missions) {
		resp.NextMission = mission(a, mi+1)
	} else {
		resp.Summary = e.summary(next)
	}
	return resp, nil
}

// meters memvalidasi meter kiriman klien. openapi tidak mendefinisikan aturan konsistensi
// selain rentang 0-100, jadi hanya rentang yang diperiksa.
func meters(in *MetersIn) (Meters, *Error) {
	if in == nil {
		return Meters{}, invalid("meters", "Data meter belum lengkap.")
	}
	fields := []struct {
		name string
		v    *int
	}{{"meters.kepercayaan", in.Kepercayaan}, {"meters.kewaspadaan", in.Kewaspadaan}, {"meters.keamanan", in.Keamanan}}
	for _, f := range fields {
		if f.v == nil {
			return Meters{}, invalid(f.name, "Data meter belum lengkap.")
		}
		if *f.v < 0 || *f.v > 100 {
			return Meters{}, invalid(f.name, "Nilai meter harus antara 0 dan 100.")
		}
	}
	return Meters{Kepercayaan: *in.Kepercayaan, Kewaspadaan: *in.Kewaspadaan, Keamanan: *in.Keamanan}, nil
}

func (e *Engine) summary(m Meters) *Summary {
	r := e.c.Ranks[0]
	for _, x := range e.c.Ranks {
		if m.Total() >= x.MinTotal {
			r = x
		}
	}
	return &Summary{r.ID, r.Label, r.Description, r.Insights, m}
}
