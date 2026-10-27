import soulArcsData from "@/data/soul-arcs.json";
import {
  GuardianState,
  SoulArc,
  SoulArcSummary,
  SoulStepRequest,
  SoulStepResponse,
} from "@/types/api";

const soulArcs: SoulArc[] = soulArcsData as SoulArc[];

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function getArcsLocal(): SoulArcSummary[] {
  return soulArcs.map((arc) => ({
    id: arc.id,
    title: arc.title,
    ward: arc.ward,
    synopsis: arc.nodes[0]?.narration || "",
  }));
}

export function getArcLocal(id: string): SoulArc | undefined {
  return soulArcs.find((a) => a.id === id);
}

export function soulStepLocal(req: SoulStepRequest): SoulStepResponse {
  const arc = soulArcs.find((a) => a.id === req.arc_id);
  if (!arc) {
    throw new Error(`arc not found: ${req.arc_id}`);
  }

  const currentNode = arc.nodes.find((n) => n.id === req.node_id);
  if (!currentNode) {
    throw new Error(`node not found: ${req.node_id}`);
  }

  const choice = currentNode.choices.find((c) => c.id === req.choice_id);
  if (!choice) {
    throw new Error(`choice not found: ${req.choice_id}`);
  }

  // Calculate new state with clamping 0-100
  const newState: GuardianState = {
    trust: clamp((req.state.trust || 0) + (choice.effects.trust || 0), 0, 100),
    awareness: clamp((req.state.awareness || 0) + (choice.effects.awareness || 0), 0, 100),
    empathy: clamp((req.state.empathy || 0) + (choice.effects.empathy || 0), 0, 100),
  };

  // Check if next node is an ending or regular node
  const nextNodeId = choice.next_node_id;

  if (nextNodeId.startsWith("ending_")) {
    const ending = arc.endings.find((e) => e.id === nextNodeId) || arc.endings[0];
    return {
      state: newState,
      ending,
    };
  }

  const nextNode = arc.nodes.find((n) => n.id === nextNodeId);
  if (!nextNode) {
    // If not found, fallback to first ending
    return {
      state: newState,
      ending: arc.endings[0],
    };
  }

  return {
    next_node: nextNode,
    state: newState,
  };
}
