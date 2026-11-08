package ml

import "prototype-ato/internal/data"

// Scenario = skenario Lite yang bisa dipilih Analyze (kategori memakai ID baru).
type Scenario struct {
	ID         string
	Category   string
	Keywords   []string
	IsFallback bool
}

// scenarioMap: pemetaan kategori lama -> baru per ID skenario (ML-SPEC §6).
var scenarioMap = map[string]struct {
	cat      string
	fallback bool
}{
	"wfh_admin_fee":                    {"tawaran_kerja", true},
	"task_scam_review_maps":            {"tawaran_kerja", false},
	"giveaway_fake_verified":           {"giveaway", true},
	"impersonate_new_number":           {"akun_menyamar", true},
	"phishing_bank_account_freeze":     {"akun_menyamar", false},
	"loan_fast_no_check":               {"pinjaman_investasi", true},
	"romance_investment_pigbutchering": {"pinjaman_investasi", false},
	"apk_wedding_invitation":           {"lainnya", false},
	"marketplace_cod_scam":             {"lainnya", false},
	"generic_emergency":                {"lainnya", true},
}

// IndexScenarios membangun daftar skenario sesuai urutan data; ID yang tidak dikenal dilewati.
func IndexScenarios(repo *data.Repository) []Scenario {
	var out []Scenario
	for _, s := range repo.ListScenarios() {
		mp, ok := scenarioMap[s.ID]
		if !ok {
			continue
		}
		full, ok := repo.GetScenarioByID(s.ID)
		if !ok {
			continue
		}
		out = append(out, Scenario{ID: s.ID, Category: mp.cat, Keywords: full.Keywords, IsFallback: mp.fallback})
	}
	return out
}
