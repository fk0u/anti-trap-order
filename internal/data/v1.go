package data

import (
	"embed"
	"encoding/json"
	"fmt"
	"slices"
	"strings"
	"unicode/utf8"

	"prototype-ato/internal/model"
)

// ContentVersion = versi konten v1 (Health.content_version).
const ContentVersion = "2026-11-08"

//go:embed v1/*.json
var v1FS embed.FS

// V1Content = konten API v1 yang sudah divalidasi.
type V1Content struct {
	Categories []model.Category
	Tactics    []model.Tactic
	Scenarios  []model.V1Scenario
	Characters model.CharacterOptions
	scenarioBy map[string]int
}

func (c *V1Content) Scenario(id string) (model.V1Scenario, bool) {
	i, ok := c.scenarioBy[id]
	if !ok {
		return model.V1Scenario{}, false
	}
	return c.Scenarios[i], true
}

func (c *V1Content) CategoryByID(id string) (model.Category, bool) {
	for _, x := range c.Categories {
		if x.ID == id {
			return x, true
		}
	}
	return model.Category{}, false
}

// LoadV1 membaca file embed dan gagal cepat jika kontennya tidak valid.
func LoadV1() (*V1Content, error) {
	read := func(name string) []byte {
		b, _ := v1FS.ReadFile("v1/" + name)
		return b
	}
	return ParseV1(read("categories.json"), read("tactics.json"), read("scenarios.json"), read("characters.json"))
}

func strictUnmarshal(raw []byte, name string, v any) error {
	dec := json.NewDecoder(strings.NewReader(string(raw)))
	dec.DisallowUnknownFields()
	if err := dec.Decode(v); err != nil {
		return fmt.Errorf("v1/%s: %w", name, err)
	}
	return nil
}

// ParseV1 memvalidasi dan merakit konten dari JSON mentah (dipakai juga oleh test).
func ParseV1(categories, tactics, scenarios, characters []byte) (*V1Content, error) {
	c := &V1Content{scenarioBy: map[string]int{}}
	if err := strictUnmarshal(categories, "categories.json", &c.Categories); err != nil {
		return nil, err
	}
	if err := strictUnmarshal(tactics, "tactics.json", &c.Tactics); err != nil {
		return nil, err
	}
	if err := strictUnmarshal(scenarios, "scenarios.json", &c.Scenarios); err != nil {
		return nil, err
	}
	if err := strictUnmarshal(characters, "characters.json", &c.Characters); err != nil {
		return nil, err
	}

	catIDs := make([]string, len(c.Categories))
	for i, x := range c.Categories {
		if x.Label == "" || x.Icon == "" {
			return nil, fmt.Errorf("kategori %q: label dan icon wajib", x.ID)
		}
		catIDs[i] = x.ID
	}
	if err := sameSet("kategori", catIDs, model.CategoryIDs); err != nil {
		return nil, err
	}
	tacIDs := make([]string, len(c.Tactics))
	for i, x := range c.Tactics {
		if x.Label == "" || x.Icon == "" || x.Explanation == "" || x.Counter == "" {
			return nil, fmt.Errorf("taktik %q: label, icon, explanation, counter wajib", x.ID)
		}
		tacIDs[i] = x.ID
	}
	if err := sameSet("taktik", tacIDs, model.TacticIDs); err != nil {
		return nil, err
	}

	fallbacks := map[string]int{}
	for i, s := range c.Scenarios {
		if s.ID == "" {
			return nil, fmt.Errorf("skenario ke-%d tanpa id", i)
		}
		if _, dup := c.scenarioBy[s.ID]; dup {
			return nil, fmt.Errorf("skenario %q ganda", s.ID)
		}
		c.scenarioBy[s.ID] = i
		if err := validateScenario(s); err != nil {
			return nil, fmt.Errorf("skenario %q: %w", s.ID, err)
		}
		if s.IsFallback {
			fallbacks[s.Category]++
		}
	}
	for _, id := range model.CategoryIDs {
		if fallbacks[id] != 1 {
			return nil, fmt.Errorf("kategori %q harus punya tepat 1 skenario fallback, dapat %d", id, fallbacks[id])
		}
	}
	return c, validateCharacters(c.Characters)
}

func sameSet(what string, got, want []string) error {
	seen := map[string]bool{}
	for _, g := range got {
		if !slices.Contains(want, g) || seen[g] {
			return fmt.Errorf("%s %q tidak dikenal atau ganda", what, g)
		}
		seen[g] = true
	}
	if len(got) != len(want) {
		return fmt.Errorf("%s: mau %d, dapat %d", what, len(want), len(got))
	}
	return nil
}

func validateScenario(s model.V1Scenario) error {
	if !slices.Contains(model.CategoryIDs, s.Category) {
		return fmt.Errorf("kategori %q tidak valid", s.Category)
	}
	if s.Title == "" || s.ExampleMessage == "" {
		return fmt.Errorf("title dan example_message wajib")
	}
	if len(s.Flaws) == 0 {
		return fmt.Errorf("celah kosong")
	}
	flawTags := map[string]bool{}
	flawIDs := map[string]bool{}
	for _, f := range s.Flaws {
		if f.ID == "" || flawIDs[f.ID] {
			return fmt.Errorf("celah %q kosong atau ganda", f.ID)
		}
		flawIDs[f.ID] = true
		if !slices.Contains(model.TacticIDs, f.Tactic) {
			return fmt.Errorf("celah %q: taktik %q tidak valid", f.ID, f.Tactic)
		}
		if f.Explanation == "" || f.Counter == "" || f.Severity < 1 || f.Severity > 3 || len(f.Tags) == 0 {
			return fmt.Errorf("celah %q: explanation, counter, severity 1-3, tags wajib", f.ID)
		}
		for _, t := range f.Tags {
			if t == "" {
				return fmt.Errorf("celah %q: tag kosong", f.ID)
			}
			flawTags[t] = true
		}
	}
	if len(s.Questions) != 3 {
		return fmt.Errorf("harus 3 pertanyaan, dapat %d", len(s.Questions))
	}
	reached := map[string]bool{}
	qIDs := map[string]bool{}
	for qi, q := range s.Questions {
		if q.ID == "" || qIDs[q.ID] || q.Step != qi+1 || q.Prompt == "" {
			return fmt.Errorf("pertanyaan %q: id, step berurutan, prompt wajib", q.ID)
		}
		qIDs[q.ID] = true
		if q.MinSelect != 1 || q.MaxSelect != 2 || q.OtherMaxLength != 80 {
			return fmt.Errorf("pertanyaan %q: min_select 1, max_select 2, other_max_length 80", q.ID)
		}
		if len(q.Options) != 5 {
			return fmt.Errorf("pertanyaan %q: harus 5 opsi, dapat %d", q.ID, len(q.Options))
		}
		unmatched := 0
		oIDs := map[string]bool{}
		for _, o := range q.Options {
			if o.ID == "" || o.Label == "" || oIDs[o.ID] || len(o.Tags) == 0 {
				return fmt.Errorf("opsi %q di %s: id unik, label, tags wajib", o.ID, q.ID)
			}
			oIDs[o.ID] = true
			hit := false
			for _, t := range o.Tags {
				if t == "" {
					return fmt.Errorf("opsi %q: tag kosong", o.ID)
				}
				if flawTags[t] {
					hit, reached[t] = true, true
				}
			}
			if !hit {
				unmatched++
			}
		}
		if unmatched == 0 {
			return fmt.Errorf("pertanyaan %q: harus ada opsi yang tidak cocok celah mana pun", q.ID)
		}
	}
	for _, f := range s.Flaws {
		ok := false
		for _, t := range f.Tags {
			ok = ok || reached[t]
		}
		if !ok {
			return fmt.Errorf("celah %q tidak terjangkau oleh opsi mana pun", f.ID)
		}
	}
	a := s.ActionCard
	if a.CategoryLabel == "" || len(a.Checklist) == 0 || a.Warnings.Santai == "" || a.Warnings.Tegas == "" || len(a.ReportChannels) == 0 {
		return fmt.Errorf("action_card tidak lengkap")
	}
	for _, ch := range a.ReportChannels {
		if (ch.Status != "placeholder" && ch.Status != "verified") || ch.Name == "" || ch.Note == "" {
			return fmt.Errorf("report_channel %q tidak valid", ch.Name)
		}
	}
	return nil
}

func validateCharacters(o model.CharacterOptions) error {
	if o.NicknameMaxLength != 20 {
		return fmt.Errorf("nickname_max_length harus 20")
	}
	rel := map[string]bool{}
	for _, r := range o.Relations {
		if r.ID == "" || r.Label == "" || r.ArcID == "" || rel[r.ID] {
			return fmt.Errorf("relasi %q tidak valid", r.ID)
		}
		rel[r.ID] = true
	}
	ids := map[string]bool{}
	for _, t := range o.Templates {
		if t.ID == "" || ids[t.ID] || !rel[t.RelationID] || !slices.Contains(model.AvatarIDs, t.Avatar) || t.ArcID == "" {
			return fmt.Errorf("template %q tidak valid", t.ID)
		}
		ids[t.ID] = true
		if n := utf8.RuneCountInString(t.DefaultName); n == 0 || n > 20 || strings.ContainsAny(t.DefaultName, "0123456789@") {
			return fmt.Errorf("template %q: nama bawaan melanggar aturan nama", t.ID)
		}
	}
	if len(o.Templates) == 0 || len(o.Relations) == 0 {
		return fmt.Errorf("templates dan relations wajib")
	}
	return nil
}
