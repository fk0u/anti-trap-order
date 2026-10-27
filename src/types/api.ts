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
