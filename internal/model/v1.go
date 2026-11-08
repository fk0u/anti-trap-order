package model

// Tipe API v1 (docs/openapi.yaml). JSON snake_case.

// Daftar label bersama (KEPUTUSAN §4); sama dengan internal/ml/labels.go.
var (
	CategoryIDs = []string{"tawaran_kerja", "giveaway", "akun_menyamar", "pinjaman_investasi", "lainnya"}
	TacticIDs   = []string{"urgency", "upfront_fee", "impersonation", "isolation", "too_good", "credential_request", "link_or_apk", "authority"}
	AvatarIDs   = []string{"1-lingkar", "2-tumpuk", "3-segitiga", "4-kotak"}
)

type Category struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Icon  string `json:"icon"`
}

type TacticRef struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Icon  string `json:"icon"`
}

type Tactic struct {
	TacticRef
	Explanation string `json:"explanation"`
	Counter     string `json:"counter"`
}

// V1Option menyimpan tags untuk pencocokan celah; tags tidak pernah keluar lewat API detail.
type V1Option struct {
	ID    string   `json:"id"`
	Label string   `json:"label"`
	Tags  []string `json:"tags"`
}

type V1Question struct {
	ID             string     `json:"id"`
	Step           int        `json:"step"`
	Prompt         string     `json:"prompt"`
	MinSelect      int        `json:"min_select"`
	MaxSelect      int        `json:"max_select"`
	AllowOther     bool       `json:"allow_other"`
	OtherMaxLength int        `json:"other_max_length"`
	Options        []V1Option `json:"options"`
}

type V1Flaw struct {
	ID          string   `json:"id"`
	Tactic      string   `json:"tactic"`
	Explanation string   `json:"explanation"`
	Counter     string   `json:"counter"`
	Severity    int      `json:"severity"`
	Tags        []string `json:"tags"`
}

type ChecklistItem struct {
	ID   string `json:"id"`
	Text string `json:"text"`
}

type Warnings struct {
	Santai string `json:"santai"`
	Tegas  string `json:"tegas"`
}

type ReportChannel struct {
	Name   string  `json:"name"`
	Status string  `json:"status"`
	URL    *string `json:"url,omitempty"`
	Note   string  `json:"note"`
}

type ActionCard struct {
	CategoryLabel  string          `json:"category_label"`
	Checklist      []ChecklistItem `json:"checklist"`
	Warnings       Warnings        `json:"warnings"`
	ReportChannels []ReportChannel `json:"report_channels"`
}

// V1Scenario = isi lengkap di scenarios.json (hanya untuk server).
type V1Scenario struct {
	ID             string       `json:"id"`
	Category       string       `json:"category"`
	Title          string       `json:"title"`
	ExampleMessage string       `json:"example_message"`
	Keywords       []string     `json:"keywords"`
	IsFallback     bool         `json:"is_fallback"`
	Questions      []V1Question `json:"questions"`
	Flaws          []V1Flaw     `json:"flaws"`
	ActionCard     ActionCard   `json:"action_card"`
}

type V1ScenarioSummary struct {
	ID             string   `json:"id"`
	Category       string   `json:"category"`
	Title          string   `json:"title"`
	ExampleMessage string   `json:"example_message"`
	Keywords       []string `json:"keywords"`
	IsFallback     bool     `json:"is_fallback"`
}

type V1PublicOption struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

type V1PublicQuestion struct {
	ID             string           `json:"id"`
	Step           int              `json:"step"`
	Prompt         string           `json:"prompt"`
	MinSelect      int              `json:"min_select"`
	MaxSelect      int              `json:"max_select"`
	AllowOther     bool             `json:"allow_other"`
	OtherMaxLength int              `json:"other_max_length"`
	Options        []V1PublicOption `json:"options"`
}

type V1ScenarioDetail struct {
	ID             string             `json:"id"`
	Category       string             `json:"category"`
	Title          string             `json:"title"`
	ExampleMessage string             `json:"example_message"`
	Questions      []V1PublicQuestion `json:"questions"`
}

func (s V1Scenario) Summary() V1ScenarioSummary {
	return V1ScenarioSummary{s.ID, s.Category, s.Title, s.ExampleMessage, s.Keywords, s.IsFallback}
}

// Detail membuang tags dan celah supaya jawaban tidak bocor ke klien.
func (s V1Scenario) Detail() V1ScenarioDetail {
	d := V1ScenarioDetail{ID: s.ID, Category: s.Category, Title: s.Title, ExampleMessage: s.ExampleMessage}
	for _, q := range s.Questions {
		pq := V1PublicQuestion{q.ID, q.Step, q.Prompt, q.MinSelect, q.MaxSelect, q.AllowOther, q.OtherMaxLength, make([]V1PublicOption, len(q.Options))}
		for i, o := range q.Options {
			pq.Options[i] = V1PublicOption{o.ID, o.Label}
		}
		d.Questions = append(d.Questions, pq)
	}
	return d
}

type CharacterTemplate struct {
	ID          string `json:"id"`
	DefaultName string `json:"default_name"`
	RelationID  string `json:"relation_id"`
	Avatar      string `json:"avatar"`
	ArcID       string `json:"arc_id"`
}

type Relation struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	ArcID string `json:"arc_id"`
}

type CharacterOptions struct {
	Templates         []CharacterTemplate `json:"templates"`
	Relations         []Relation          `json:"relations"`
	NicknameMaxLength int                 `json:"nickname_max_length"`
}

type Health struct {
	Status         string `json:"status"`
	Version        string `json:"version"`
	ContentVersion string `json:"content_version"`
	Time           string `json:"time"`
}
