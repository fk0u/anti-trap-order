package soul_test

import (
	"testing"

	"prototype-ato/internal/data"
	"prototype-ato/internal/model"
	"prototype-ato/internal/soul"
)

func TestSoulEngine_GraphReachabilityAndEndings(t *testing.T) {
	repo, err := data.Load()
	if err != nil {
		t.Fatalf("failed to load data: %v", err)
	}

	arcsSummary := repo.ListSoulArcs()
	arcs := make([]model.SoulArc, len(arcsSummary))
	for i, s := range arcsSummary {
		full, _ := repo.GetSoulArcByID(s.ID)
		arcs[i] = full
	}

	engine := soul.NewEngine(arcs)

	for _, arc := range arcs {
		t.Run(arc.ID, func(t *testing.T) {
			// BFS traversal to ensure all paths lead to ending
			type queueItem struct {
				nodeID string
				state  model.GuardianState
			}

			queue := []queueItem{{nodeID: arc.InitialNodeID, state: arc.InitialState}}
			endingsReached := make(map[string]bool)

			visitedCount := 0
			for len(queue) > 0 {
				item := queue[0]
				queue = queue[1:]
				visitedCount++

				var node *model.ArcNode
				for i := range arc.Nodes {
					if arc.Nodes[i].ID == item.nodeID {
						node = &arc.Nodes[i]
						break
					}
				}
				if node == nil {
					t.Fatalf("node %s not found", item.nodeID)
				}

				for _, choice := range node.Choices {
					resp, err := engine.Step(model.SoulStepRequest{
						ArcID:    arc.ID,
						NodeID:   node.ID,
						ChoiceID: choice.ID,
						State:    item.state,
					})
					if err != nil {
						t.Fatalf("step error on choice %s: %v", choice.ID, err)
					}

					// Verify state clamping
					if resp.State.Trust < 0 || resp.State.Trust > 100 {
						t.Errorf("trust state out of bounds: %d", resp.State.Trust)
					}
					if resp.State.Awareness < 0 || resp.State.Awareness > 100 {
						t.Errorf("awareness state out of bounds: %d", resp.State.Awareness)
					}

					if resp.Ending != nil {
						endingsReached[resp.Ending.ID] = true
					} else if resp.NextNode != nil {
						// Only queue if not exceeding max depth to prevent cycle loops
						if visitedCount < 50 {
							queue = append(queue, queueItem{
								nodeID: resp.NextNode.ID,
								state:  resp.State,
							})
						}
					}
				}
			}

			if len(endingsReached) < 2 {
				t.Errorf("expected at least 2 distinct endings reachable, reached %d", len(endingsReached))
			}
		})
	}
}
