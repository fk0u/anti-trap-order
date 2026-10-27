package soul

import (
	"fmt"

	"prototype-ato/internal/model"
)

type Engine struct {
	arcs []model.SoulArc
}

func NewEngine(arcs []model.SoulArc) *Engine {
	return &Engine{arcs: arcs}
}

func clamp(val, min, max int) int {
	if val < min {
		return min
	}
	if val > max {
		return max
	}
	return val
}

func (e *Engine) Step(req model.SoulStepRequest) (model.SoulStepResponse, error) {
	var targetArc *model.SoulArc
	for i := range e.arcs {
		if e.arcs[i].ID == req.ArcID {
			targetArc = &e.arcs[i]
			break
		}
	}
	if targetArc == nil {
		return model.SoulStepResponse{}, fmt.Errorf("arc ID '%s' not found", req.ArcID)
	}

	var currentNode *model.ArcNode
	for i := range targetArc.Nodes {
		if targetArc.Nodes[i].ID == req.NodeID {
			currentNode = &targetArc.Nodes[i]
			break
		}
	}
	if currentNode == nil {
		return model.SoulStepResponse{}, fmt.Errorf("node ID '%s' not found in arc '%s'", req.NodeID, req.ArcID)
	}

	var chosenChoice *model.NodeChoice
	for i := range currentNode.Choices {
		if currentNode.Choices[i].ID == req.ChoiceID {
			chosenChoice = &currentNode.Choices[i]
			break
		}
	}
	if chosenChoice == nil {
		return model.SoulStepResponse{}, fmt.Errorf("choice ID '%s' not found in node '%s'", req.ChoiceID, req.NodeID)
	}

	// Calculate and clamp new state
	newState := model.GuardianState{
		Trust:     clamp(req.State.Trust+chosenChoice.Effects.Trust, 0, 100),
		Awareness: clamp(req.State.Awareness+chosenChoice.Effects.Awareness, 0, 100),
		Empathy:   clamp(req.State.Empathy+chosenChoice.Effects.Empathy, 0, 100),
	}

	// Check if this choice resolves the ending
	if chosenChoice.NextNodeID == "resolve_ending" {
		ending := e.resolveEnding(*targetArc, newState)
		return model.SoulStepResponse{
			State:  newState,
			Ending: &ending,
		}, nil
	}

	// Otherwise, find the next node
	var nextNode *model.ArcNode
	for i := range targetArc.Nodes {
		if targetArc.Nodes[i].ID == chosenChoice.NextNodeID {
			nextNode = &targetArc.Nodes[i]
			break
		}
	}
	if nextNode == nil {
		return model.SoulStepResponse{}, fmt.Errorf("target node ID '%s' not found in arc", chosenChoice.NextNodeID)
	}

	return model.SoulStepResponse{
		NextNode: nextNode,
		State:    newState,
	}, nil
}

func (e *Engine) resolveEnding(arc model.SoulArc, state model.GuardianState) model.ArcEnding {
	// Evaluasi ending berdasarkan state:
	// 1. Ending Partnership: Trust >= 55 && Awareness >= 55
	// 2. Ending Silencing Shield: Awareness >= 55 && Trust < 55
	// 3. Ending Delayed: Awareness < 55

	var targetEndingID string
	if state.Awareness >= 55 && state.Trust >= 55 {
		targetEndingID = "ending_guardian_partnership"
	} else if state.Awareness >= 55 && state.Trust < 55 {
		targetEndingID = "ending_overprotective_silence"
	} else {
		targetEndingID = "ending_delayed_intervention"
	}

	for _, ending := range arc.Endings {
		if ending.ID == targetEndingID {
			return ending
		}
	}

	if len(arc.Endings) > 0 {
		return arc.Endings[0]
	}
	return model.ArcEnding{}
}
