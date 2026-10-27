package model

type ScenarioCategory string

const (
	CatJobScam     ScenarioCategory = "job_scam"
	CatGiveaway    ScenarioCategory = "giveaway"
	CatImpersonate ScenarioCategory = "impersonation"
	CatPhishing    ScenarioCategory = "phishing"
	CatLoan        ScenarioCategory = "loan"
	CatMarketplace ScenarioCategory = "marketplace"
	CatGeneric     ScenarioCategory = "generic"
)

type WarningTone string

const (
	ToneCasual WarningTone = "casual"
	ToneFirm   WarningTone = "firm"
)

type VictimMessage struct {
	From string `json:"from"`
	Text string `json:"text"`
}

type PerspectiveOption struct {
	ID    string   `json:"id"`
	Label string   `json:"label"`
	Tags  []string `json:"tags"`
}

type PerspectiveQuestion struct {
	ID      string              `json:"id"`
	Prompt  string              `json:"prompt"`
	Options []PerspectiveOption `json:"options"`
}

type Flaw struct {
	ID              string   `json:"id"`
	Tag             string   `json:"tag"`
	Title           string   `json:"title"`
	Explanation     string   `json:"explanation"`
	EvidencePhrases []string `json:"evidence_phrases"`
	Severity        int      `json:"severity"`
}

type SafeStep struct {
	ID            string   `json:"id"`
	Text          string   `json:"text"`
	AppliesToTags []string `json:"applies_to_tags"`
}

type WarningTemplate struct {
	ID            string      `json:"id"`
	Text          string      `json:"text"`
	Tone          WarningTone `json:"tone"`
	AppliesToTags []string    `json:"applies_to_tags"`
}

type Scenario struct {
	ID                   string                `json:"id"`
	Title                string                `json:"title"`
	Category             ScenarioCategory      `json:"category"`
	Difficulty           int                   `json:"difficulty"`
	VictimView           []VictimMessage       `json:"victim_view"`
	PerspectiveQuestions []PerspectiveQuestion `json:"perspective_questions"`
	Flaws                []Flaw                `json:"flaws"`
	SafeSteps            []SafeStep            `json:"safe_steps"`
	WarningTemplates     []WarningTemplate     `json:"warning_templates"`
	Keywords             []string              `json:"keywords"`
}

type ScenarioSummary struct {
	ID          string           `json:"id"`
	Title       string           `json:"title"`
	Category    ScenarioCategory `json:"category"`
	Difficulty  int              `json:"difficulty"`
	PreviewText string           `json:"preview_text"`
}

type ReflectUserAnswer struct {
	QuestionID       string `json:"question_id"`
	SelectedOptionID string `json:"selected_option_id"`
}

type ReflectRequest struct {
	ScenarioID string              `json:"scenario_id,omitempty"`
	FreeText   string              `json:"free_text,omitempty"`
	Answers    []ReflectUserAnswer `json:"answers"`
}

type FlawResult struct {
	ID                    string   `json:"id"`
	Title                 string   `json:"title"`
	Explanation           string   `json:"explanation"`
	EvidencePhrases       []string `json:"evidence_phrases"`
	Severity              int      `json:"severity"`
	UserPerspectiveReason string   `json:"user_perspective_reason"`
}

type WarningTemplatesResponse struct {
	Casual string `json:"casual"`
	Firm   string `json:"firm"`
}

type ReflectResponse struct {
	ScenarioID         string                   `json:"scenario_id"`
	MatchedCategory    ScenarioCategory         `json:"matched_category"`
	UserDetectedFlaws  []FlawResult             `json:"user_detected_flaws"`
	SafeSteps          []string                 `json:"safe_steps"`
	WarningTemplates   WarningTemplatesResponse `json:"warning_templates"`
	ConfidenceNote     string                   `json:"confidence_note"`
	PerspectiveSummary string                   `json:"perspective_summary"`
}

// SOUL / GUARDIAN ARC TYPES
type GuardianState struct {
	Trust     int `json:"trust"`
	Awareness int `json:"awareness"`
	Empathy   int `json:"empathy"`
}

type ChoiceEffect struct {
	Trust     int `json:"trust"`
	Awareness int `json:"awareness"`
	Empathy   int `json:"empathy"`
}

type NodeChoice struct {
	ID              string       `json:"id"`
	Label           string       `json:"label"`
	NextNodeID      string       `json:"next_node_id"`
	Effects         ChoiceEffect `json:"effects"`
	PerspectiveHint string       `json:"perspective_hint,omitempty"`
}

type ArcNode struct {
	ID             string       `json:"id"`
	Speaker        string       `json:"speaker"`
	Narration      string       `json:"narration"`
	VictimEvidence string       `json:"victim_evidence,omitempty"`
	Choices        []NodeChoice `json:"choices"`
}

type ArcEnding struct {
	ID                string `json:"id"`
	Title             string `json:"title"`
	Summary           string `json:"summary"`
	Reflection        string `json:"reflection"`
	GuardianArchetype string `json:"guardian_archetype"`
	ConditionNote     string `json:"condition_note"`
}

type WardProfile struct {
	Name         string `json:"name"`
	Relationship string `json:"relationship"`
	Age          int    `json:"age"`
	Context      string `json:"context"`
}

type SoulArc struct {
	ID            string        `json:"id"`
	Title         string        `json:"title"`
	Ward          WardProfile   `json:"ward"`
	InitialNodeID string        `json:"initial_node_id"`
	InitialState  GuardianState `json:"initial_state"`
	Nodes         []ArcNode     `json:"nodes"`
	Endings       []ArcEnding   `json:"endings"`
}

type SoulArcSummary struct {
	ID       string      `json:"id"`
	Title    string      `json:"title"`
	Ward     WardProfile `json:"ward"`
	Synopsis string      `json:"synopsis"`
}

type SoulStepRequest struct {
	ArcID    string        `json:"arc_id"`
	NodeID   string        `json:"node_id"`
	ChoiceID string        `json:"choice_id"`
	State    GuardianState `json:"state"`
}

type SoulStepResponse struct {
	NextNode *ArcNode      `json:"next_node,omitempty"`
	State    GuardianState `json:"state"`
	Ending   *ArcEnding    `json:"ending,omitempty"`
}

type ErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type ErrorResponse struct {
	Error ErrorDetail `json:"error"`
}
