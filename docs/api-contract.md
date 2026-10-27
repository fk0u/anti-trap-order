# API Contract: Anti Trap Order (ATO)

Dokumen ini mendefinisikan kontrak komunikasi data antara **Frontend (Next.js)** dan **Backend (Go)**.
Semua tipe TypeScript dan Go struct dalam sistem ATO **harus 1:1 identik** dengan dokumen ini.

---

## 1. Konvensi Umum

- Format: JSON (`Content-Type: application/json; charset=utf-8`)
- Format error konsisten:
  ```json
  {
    "error": {
      "code": "INVALID_INPUT",
      "message": "Deskripsi kesalahan yang jelas dan tidak teknis"
    }
  }
  ```
- **Invarian Privasi:** Tidak ada cookie pelacakan, tidak ada session wajib, tidak ada pencatatan body teks bebas user di server log.
- **Invarian Deteksi:** `confidence_note` dilarang mencantumkan persentase skor (misal "Akurasi 98%"). Wajib berupa catatan penjelasan indikator kualitatif.

---

## 2. Definisi Tipe & Struct

### TypeScript (`src/types/api.ts`)

```typescript
export type ScenarioCategory =
  | "job_scam"
  | "giveaway"
  | "impersonation"
  | "phishing"
  | "loan"
  | "marketplace"
  | "generic";

export type WarningTone = "casual" | "firm";

export interface VictimMessage {
  from: string;
  text: string;
}

export interface PerspectiveOption {
  id: string;
  label: string;
  tags: string[];
}

export interface PerspectiveQuestion {
  id: string;
  prompt: string;
  options: PerspectiveOption[];
}

export interface Flaw {
  id: string;
  tag: string;
  title: string;
  explanation: string;
  evidence_phrases: string[];
  severity: 1 | 2 | 3;
}

export interface SafeStep {
  id: string;
  text: string;
  applies_to_tags: string[];
}

export interface WarningTemplate {
  id: string;
  text: string;
  tone: WarningTone;
  applies_to_tags: string[];
}

export interface Scenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  difficulty: 1 | 2 | 3;
  victim_view: VictimMessage[];
  perspective_questions: PerspectiveQuestion[];
  flaws: Flaw[];
  safe_steps: SafeStep[];
  warning_templates: WarningTemplate[];
  keywords: string[];
}

export interface ScenarioSummary {
  id: string;
  title: string;
  category: ScenarioCategory;
  difficulty: 1 | 2 | 3;
  preview_text: string;
}

export interface ReflectUserAnswer {
  question_id: string;
  selected_option_id: string;
}

export interface ReflectRequest {
  scenario_id?: string;
  free_text?: string;
  answers: ReflectUserAnswer[];
}

export interface FlawResult {
  id: string;
  title: string;
  explanation: string;
  evidence_phrases: string[];
  severity: 1 | 2 | 3;
  user_perspective_reason: string;
}

export interface ReflectResponse {
  scenario_id: string;
  matched_category: ScenarioCategory;
  user_detected_flaws: FlawResult[];
  safe_steps: string[];
  warning_templates: {
    casual: string;
    firm: string;
  };
  confidence_note: string;
  perspective_summary: string;
}

// SOUL / GUARDIAN ARC TYPES
export interface GuardianState {
  trust: number;
  awareness: number;
  empathy: number;
}

export interface ChoiceEffect {
  trust: number;
  awareness: number;
  empathy: number;
}

export interface NodeChoice {
  id: string;
  label: string;
  next_node_id: string;
  effects: ChoiceEffect;
  perspective_hint?: string;
}

export interface ArcNode {
  id: string;
  speaker: string;
  narration: string;
  victim_evidence?: string;
  choices: NodeChoice[];
}

export interface ArcEnding {
  id: string;
  title: string;
  summary: string;
  reflection: string;
  guardian_archetype: string;
  condition_note: string;
}

export interface WardProfile {
  name: string;
  relationship: string;
  age: number;
  context: string;
}

export interface SoulArc {
  id: string;
  title: string;
  ward: WardProfile;
  initial_node_id: string;
  initial_state: GuardianState;
  nodes: ArcNode[];
  endings: ArcEnding[];
}

export interface SoulArcSummary {
  id: string;
  title: string;
  ward: WardProfile;
  synopsis: string;
}

export interface SoulStepRequest {
  arc_id: string;
  node_id: string;
  choice_id: string;
  state: GuardianState;
}

export interface SoulStepResponse {
  next_node?: ArcNode;
  state: GuardianState;
  ending?: ArcEnding;
}
```

---

### Go Struct (`internal/model/types.go`)

```go
package model

type ScenarioCategory string

const (
	CatJobScam      ScenarioCategory = "job_scam"
	CatGiveaway     ScenarioCategory = "giveaway"
	CatImpersonate  ScenarioCategory = "impersonation"
	CatPhishing     ScenarioCategory = "phishing"
	CatLoan         ScenarioCategory = "loan"
	CatMarketplace  ScenarioCategory = "marketplace"
	CatGeneric      ScenarioCategory = "generic"
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
	ID                     string   `json:"id"`
	Title                  string   `json:"title"`
	Explanation            string   `json:"explanation"`
	EvidencePhrases        []string `json:"evidence_phrases"`
	Severity               int      `json:"severity"`
	UserPerspectiveReason  string   `json:"user_perspective_reason"`
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
```

---

## 3. Endpoints

### 3.1 Health Check
- **Path:** `GET /api/health`
- **Response 200:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-27T15:00:00Z",
    "version": "1.0.0"
  }
  ```

### 3.2 List Scenarios
- **Path:** `GET /api/reflect/scenarios`
- **Response 200:** Array of scenario summary objects (tanpa pertanyaan/jawaban lengkap).

### 3.3 Get Single Scenario
- **Path:** `GET /api/reflect/scenarios/{id}`
- **Response 200:** Object `Scenario` lengkap.

### 3.4 Process Perspective Inversion (Core Engine)
- **Path:** `POST /api/reflect`
- **Body:** `ReflectRequest`
- **Response 200:** `ReflectResponse`

### 3.5 List Soul Arcs
- **Path:** `GET /api/soul/arcs`
- **Response 200:** Array of `SoulArcSummary`.

### 3.6 Next Step in Guardian Arc
- **Path:** `POST /api/soul/step`
- **Body:** `SoulStepRequest`
- **Response 200:** `SoulStepResponse`
