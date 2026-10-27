package reflect_test

import (
	"testing"

	"prototype-ato/internal/data"
	"prototype-ato/internal/model"
	"prototype-ato/internal/reflect"
)

func TestEngine_KeywordScoring(t *testing.T) {
	repo, err := data.Load()
	if err != nil {
		t.Fatalf("failed to load repo: %v", err)
	}

	scenarios := repo.ListScenarios()
	fullScenarios := make([]model.Scenario, len(scenarios))
	for i, s := range scenarios {
		full, _ := repo.GetScenarioByID(s.ID)
		fullScenarios[i] = full
	}

	engine := reflect.NewEngine(fullScenarios)

	tests := []struct {
		name         string
		input        string
		expectedID   string
		expectedCat  model.ScenarioCategory
	}{
		{
			name:        "Job scam matching keywords",
			input:       "Halo kak kami buka lowongan kerja admin wfh gaji harian bayar seragam",
			expectedID:  "wfh_admin_fee",
			expectedCat: model.CatJobScam,
		},
		{
			name:        "Giveaway scam matching keywords",
			input:       "Selamat kamu terpilih menang giveaway iphone 16 tapi bayar ongkir",
			expectedID:  "giveaway_fake_verified",
			expectedCat: model.CatGiveaway,
		},
		{
			name:        "Impersonation matching keywords",
			input:       "Halo ini aku ganti nomor baru sementara hp layarku retak pinjam transfer",
			expectedID:  "impersonate_new_number",
			expectedCat: model.CatImpersonate,
		},
		{
			name:        "Phishing bank matching keywords",
			input:       "Rekening nasabah anda akan dibekukan klik link verifikasi segera",
			expectedID:  "phishing_bank_account_freeze",
			expectedCat: model.CatPhishing,
		},
		{
			name:        "Loan scam matching keywords",
			input:       "Pinjol kilat cair langsung tanpa BI checking bayar biaya aktivasi meterai",
			expectedID:  "loan_fast_no_check",
			expectedCat: model.CatLoan,
		},
		{
			name:        "Generic fallback when unknown input",
			input:       "lorem ipsum dolor sit amet tidak jelas",
			expectedID:  "generic_emergency",
			expectedCat: model.CatGeneric,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			matched := engine.MatchScenarioByKeyword(tc.input)
			if matched.ID != tc.expectedID {
				t.Errorf("expected scenario ID '%s', got '%s'", tc.expectedID, matched.ID)
			}
			if matched.Category != tc.expectedCat {
				t.Errorf("expected category '%s', got '%s'", tc.expectedCat, matched.Category)
			}
		})
	}
}

func TestEngine_PerspectiveInversionDeterminism(t *testing.T) {
	repo, err := data.Load()
	if err != nil {
		t.Fatalf("failed to load repo: %v", err)
	}

	scenarios := repo.ListScenarios()
	fullScenarios := make([]model.Scenario, len(scenarios))
	for i, s := range scenarios {
		full, _ := repo.GetScenarioByID(s.ID)
		fullScenarios[i] = full
	}

	engine := reflect.NewEngine(fullScenarios)

	req1 := model.ReflectRequest{
		ScenarioID: "wfh_admin_fee",
		Answers: []model.ReflectUserAnswer{
			{QuestionID: "q1", SelectedOptionID: "q1_opt3"}, // pungutan_di_depan
			{QuestionID: "q2", SelectedOptionID: "q2_opt1"}, // pungutan_di_depan
		},
	}

	req2 := model.ReflectRequest{
		ScenarioID: "wfh_admin_fee",
		Answers: []model.ReflectUserAnswer{
			{QuestionID: "q1", SelectedOptionID: "q1_opt2"}, // urgensi_palsu
			{QuestionID: "q2", SelectedOptionID: "q2_opt3"}, // otoritas_palsu
		},
	}

	resp1, err := engine.ProcessReflection(req1)
	if err != nil {
		t.Fatalf("resp1 failed: %v", err)
	}

	resp2, err := engine.ProcessReflection(req2)
	if err != nil {
		t.Fatalf("resp2 failed: %v", err)
	}

	if len(resp1.UserDetectedFlaws) == 0 || len(resp2.UserDetectedFlaws) == 0 {
		t.Fatal("flaws cannot be empty")
	}

	top1 := resp1.UserDetectedFlaws[0].ID
	top2 := resp2.UserDetectedFlaws[0].ID

	if top1 == top2 {
		t.Errorf("expected different top flaw for different answers, both got '%s'", top1)
	}

	// Invariant check: No percentage in confidence_note
	if stringContainsPercentage(resp1.ConfidenceNote) {
		t.Errorf("confidence note violates invariant: contains percentage symbol: %s", resp1.ConfidenceNote)
	}
}

func stringContainsPercentage(s string) bool {
	for _, r := range s {
		if r == '%' {
			return true
		}
	}
	return false
}
