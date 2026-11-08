package data

import (
	"fmt"
	"slices"
	"strings"

	"prototype-ato/internal/model"
)

// SoulMeters = tiga meter 0-100 (openapi Meters).
type SoulMeters struct {
	Kepercayaan int `json:"kepercayaan"`
	Kewaspadaan int `json:"kewaspadaan"`
	Keamanan    int `json:"keamanan"`
}

// SoulDeltas = perubahan meter per pilihan (openapi MeterDeltas).
type SoulDeltas = SoulMeters

func (m SoulMeters) Total() int { return m.Kepercayaan + m.Kewaspadaan + m.Keamanan }

type SoulConsequence struct {
	Kind         string `json:"kind"`
	WhatHappened string `json:"what_happened"`
	Why          string `json:"why"`
}

type SoulChoiceContent struct {
	ID          string          `json:"id"`
	Label       string          `json:"label"`
	Consequence SoulConsequence `json:"consequence"`
	Deltas      SoulDeltas      `json:"deltas"`
}

type SoulMissionContent struct {
	ID      string              `json:"id"`
	Story   string              `json:"story"`
	Choices []SoulChoiceContent `json:"choices"`
}

type SoulArcContent struct {
	ID       string               `json:"id"`
	Missions []SoulMissionContent `json:"missions"`
}

// SoulRank: peringkat dipilih dari total meter akhir (MinTotal tertinggi yang terpenuhi).
type SoulRank struct {
	ID          string   `json:"id"`
	Label       string   `json:"label"`
	MinTotal    int      `json:"min_total"`
	Description string   `json:"description"`
	Insights    []string `json:"insights"`
}

type SoulV1Content struct {
	Notes         string           `json:"notes"`
	InitialMeters SoulMeters       `json:"initial_meters"`
	Ranks         []SoulRank       `json:"ranks"` // urut naik menurut MinTotal
	Arcs          []SoulArcContent `json:"arcs"`
}

func (c *SoulV1Content) Arc(id string) (SoulArcContent, bool) {
	for _, a := range c.Arcs {
		if a.ID == id {
			return a, true
		}
	}
	return SoulArcContent{}, false
}

var (
	soulKinds   = []string{"positif", "negatif", "campuran"}
	soulRankIDs = []string{"pemula_waspada", "penjaga_siaga", "penjaga_teguh"}
	soulChoices = []string{"A", "B", "C"}
	soulMissIDs = []string{"m1", "m2", "m3"}
)

// LoadSoulV1 membaca v1/soul-arcs.json dan gagal cepat jika tidak valid.
func LoadSoulV1(chars model.CharacterOptions) (*SoulV1Content, error) {
	raw, err := v1FS.ReadFile("v1/soul-arcs.json")
	if err != nil {
		return nil, err
	}
	return ParseSoulV1(raw, chars)
}

func inRange(v int) bool { return v >= 0 && v <= 100 }

// ParseSoulV1 memvalidasi konten Soul terhadap characters.json dan batas openapi.
func ParseSoulV1(raw []byte, chars model.CharacterOptions) (*SoulV1Content, error) {
	c := &SoulV1Content{}
	if err := strictUnmarshal(raw, "soul-arcs.json", c); err != nil {
		return nil, err
	}
	m := c.InitialMeters
	if !inRange(m.Kepercayaan) || !inRange(m.Kewaspadaan) || !inRange(m.Keamanan) {
		return nil, fmt.Errorf("soul: initial_meters di luar 0-100")
	}
	if len(c.Ranks) != 3 {
		return nil, fmt.Errorf("soul: harus 3 peringkat")
	}
	for i, r := range c.Ranks {
		if r.ID != soulRankIDs[i] || r.Label == "" || r.Description == "" || len(r.Insights) == 0 {
			return nil, fmt.Errorf("soul: peringkat ke-%d harus %q dengan label, description, insights", i, soulRankIDs[i])
		}
		if i == 0 && r.MinTotal != 0 || i > 0 && r.MinTotal <= c.Ranks[i-1].MinTotal {
			return nil, fmt.Errorf("soul: min_total peringkat %q harus menaik (pertama 0)", r.ID)
		}
		if r.MinTotal > 300 {
			return nil, fmt.Errorf("soul: min_total peringkat %q > 300", r.ID)
		}
	}

	arcIDs := map[string]bool{}
	for _, a := range c.Arcs {
		if arcIDs[a.ID] {
			return nil, fmt.Errorf("soul: arc %q ganda", a.ID)
		}
		arcIDs[a.ID] = true
		if err := validateSoulArc(a); err != nil {
			return nil, fmt.Errorf("soul: arc %q: %w", a.ID, err)
		}
	}
	// arc_id di characters.json harus ada, dan setiap arc dipakai.
	used := map[string]bool{}
	for _, id := range charArcIDs(chars) {
		if !arcIDs[id] {
			return nil, fmt.Errorf("soul: characters.json merujuk arc %q yang tidak ada", id)
		}
		used[id] = true
	}
	for id := range arcIDs {
		if !used[id] {
			return nil, fmt.Errorf("soul: arc %q tidak dirujuk characters.json", id)
		}
	}
	return c, nil
}

func charArcIDs(o model.CharacterOptions) []string {
	var ids []string
	for _, t := range o.Templates {
		ids = append(ids, t.ArcID)
	}
	for _, r := range o.Relations {
		ids = append(ids, r.ArcID)
	}
	return ids
}

func validateSoulArc(a SoulArcContent) error {
	if len(a.Missions) != 3 {
		return fmt.Errorf("harus 3 misi, dapat %d", len(a.Missions))
	}
	for i, ms := range a.Missions {
		if ms.ID != soulMissIDs[i] || strings.TrimSpace(ms.Story) == "" {
			return fmt.Errorf("misi ke-%d: id harus %q dan story wajib", i+1, soulMissIDs[i])
		}
		if len(ms.Choices) != 3 {
			return fmt.Errorf("misi %s: harus 3 pilihan", ms.ID)
		}
		for j, ch := range ms.Choices {
			if ch.ID != soulChoices[j] {
				return fmt.Errorf("misi %s: pilihan ke-%d harus %q", ms.ID, j+1, soulChoices[j])
			}
			cs := ch.Consequence
			if strings.TrimSpace(ch.Label) == "" || strings.TrimSpace(cs.WhatHappened) == "" || strings.TrimSpace(cs.Why) == "" {
				return fmt.Errorf("misi %s pilihan %s: label, what_happened, why wajib", ms.ID, ch.ID)
			}
			if !slices.Contains(soulKinds, cs.Kind) {
				return fmt.Errorf("misi %s pilihan %s: kind %q tidak valid", ms.ID, ch.ID, cs.Kind)
			}
			// Meter dijepit 0-100, jadi delta di luar -100..100 tidak bermakna.
			d := ch.Deltas
			for _, v := range []int{d.Kepercayaan, d.Kewaspadaan, d.Keamanan} {
				if v < -100 || v > 100 {
					return fmt.Errorf("misi %s pilihan %s: delta di luar -100..100", ms.ID, ch.ID)
				}
			}
		}
	}
	return nil
}
