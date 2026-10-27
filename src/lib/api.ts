import scenariosData from "@/data/scenarios.json";
import { reflectLocal } from "./reflect-local";
import { getArcsLocal, soulStepLocal } from "./soul-local";
import {
  ReflectRequest,
  ReflectResponse,
  Scenario,
  ScenarioSummary,
  SoulArcSummary,
  SoulStepRequest,
  SoulStepResponse,
} from "@/types/api";

const scenarios: Scenario[] = scenariosData as Scenario[];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

const DEFAULT_TIMEOUT_MS = 6000;

async function fetchWithTimeout(
  input: string,
  init?: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function getScenarios(): Promise<ScenarioSummary[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/reflect/scenarios`);
    if (res.ok) {
      return (await res.json()) as ScenarioSummary[];
    }
  } catch {
    // ignore, fallback
  }

  return scenarios.map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    difficulty: s.difficulty,
    preview_text: s.victim_view[0]?.text || "",
  }));
}

export async function getScenario(id: string): Promise<Scenario> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/reflect/scenarios/${id}`);
    if (res.ok) {
      return (await res.json()) as Scenario;
    }
  } catch {
    // ignore, fallback
  }

  const found = scenarios.find((s) => s.id === id);
  if (found) return found;
  const generic = scenarios.find((s) => s.id === "generic");
  return generic || scenarios[0];
}

export async function reflect(
  req: ReflectRequest
): Promise<{ response: ReflectResponse; isOffline: boolean }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/reflect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (res.ok) {
      const data = (await res.json()) as ReflectResponse;
      return { response: data, isOffline: false };
    }
  } catch {
    // API failed or timed out: seamless fallback to local engine
  }

  const localRes = reflectLocal(req);
  return { response: localRes, isOffline: true };
}

export async function getArcs(): Promise<SoulArcSummary[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/soul/arcs`);
    if (res.ok) {
      return (await res.json()) as SoulArcSummary[];
    }
  } catch {
    // fallback
  }

  return getArcsLocal();
}

export async function soulStep(
  req: SoulStepRequest
): Promise<{ response: SoulStepResponse; isOffline: boolean }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/soul/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (res.ok) {
      const data = (await res.json()) as SoulStepResponse;
      return { response: data, isOffline: false };
    }
  } catch {
    // fallback
  }

  const localData = soulStepLocal(req);
  return { response: localData, isOffline: true };
}
