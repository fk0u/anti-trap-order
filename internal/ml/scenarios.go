package ml

import "prototype-ato/internal/data"

// Scenario = skenario Lite yang bisa dipilih Analyze (kategori dan fallback dari konten v1).
type Scenario struct {
	ID         string
	Category   string
	Keywords   []string
	IsFallback bool
}

// IndexScenarios membangun daftar skenario sesuai urutan konten v1.
func IndexScenarios(repo *data.Repository) []Scenario {
	var out []Scenario
	for _, s := range repo.V1().Scenarios {
		out = append(out, Scenario{ID: s.ID, Category: s.Category, Keywords: s.Keywords, IsFallback: s.IsFallback})
	}
	return out
}
