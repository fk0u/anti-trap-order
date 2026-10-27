package reflect

import (
	"testing"
)

func TestNLPTokenize(t *testing.T) {
	input := "halo kak, loker wfh like subs komisi gede tapi harus tf depo rek bca skrg ya"
	tokens := NLPTokenize(input)

	tokenMap := make(map[string]bool)
	for _, tok := range tokens {
		tokenMap[tok] = true
	}

	expectedStems := []string{
		"kakak",
		"lowongan_kerja",
		"subscribe",
		"komisi",
		"transfer",
		"deposit",
		"rekening",
		"bank_bca",
		"sekarang",
	}

	for _, stem := range expectedStems {
		if !tokenMap[stem] {
			t.Errorf("expected canonical stem '%s' in tokens, got tokens: %v", stem, tokens)
		}
	}
}

func TestDetectManipulationVectors(t *testing.T) {
	testCases := []struct {
		name     string
		input    string
		expected ManipulationVector
	}{
		{
			name:     "Urgency vector",
			input:    "Buruan konfirmasi sebelum hangus hanya hari ini!",
			expected: VectorUrgency,
		},
		{
			name:     "Upfront fee vector",
			input:    "Silakan transfer deposit 50rb untuk biaya aktivasi member",
			expected: VectorUpfrontFee,
		},
		{
			name:     "Impersonation vector",
			input:    "Halo kak ini nomor baru hp ku hilang tolong ya",
			expected: VectorImpersonation,
		},
		{
			name:     "Too good to be true vector",
			input:    "Kerja santai modal like dan subscribe dapat hadiah ratusan juta",
			expected: VectorTooGood,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			vectors := DetectManipulationVectors(tc.input)
			found := false
			for _, v := range vectors {
				if v == tc.expected {
					found = true
					break
				}
			}
			if !found {
				t.Errorf("expected vector '%s' in detected vectors: %v", tc.expected, vectors)
			}
		})
	}
}
