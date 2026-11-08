package ml

import (
	"encoding/json"
	"testing"
)

func toy() ([][]string, []string) {
	return [][]string{
		{"biaya", "transfer", "biaya_transfer"}, {"transfer", "dulu"}, {"biaya", "admin"},
		{"kuliah", "besok"}, {"makan", "malam"}, {"kuliah", "jam"},
	}, []string{"yes", "yes", "yes", "no", "no", "no"}
}

func TestToyPredict(t *testing.T) {
	d, l := toy()
	c, unk := Train(d, l, []string{"yes", "no"}, 9, 1)
	_, p := c.Predict(unk, []string{"biaya", "transfer"})
	if p["yes"] < 0.8 {
		t.Errorf("yes=%v", p["yes"])
	}
	_, p = c.Predict(unk, []string{"kuliah", "makan"})
	if p["no"] < 0.8 {
		t.Errorf("no=%v", p["no"])
	}
	if top := c.TopTokens(unk, []string{"kuliah", "biaya", "transfer", "biaya"}, 3); len(top) != 2 {
		t.Errorf("top=%v", top)
	}
}

func TestTrainDeterministic(t *testing.T) {
	d, l := toy()
	var prev []byte
	for i := 0; i < 2; i++ {
		c, unk := Train(d, l, []string{"yes", "no"}, 9, 1)
		b, _ := json.Marshal(map[string]any{"c": c, "u": unk})
		if prev != nil && string(prev) != string(b) {
			t.Fatal("hasil training berbeda")
		}
		prev = b
	}
}
