package ml_test

import (
	"encoding/json"
	"os"
	"reflect"
	"strings"
	"testing"
	"time"

	"prototype-ato/internal/data"
	"prototype-ato/internal/ml"
)

func setup(t testing.TB) (*ml.Model, []ml.Scenario) {
	m, err := ml.Load()
	if err != nil {
		t.Fatal(err)
	}
	repo, err := data.Load()
	if err != nil {
		t.Fatal(err)
	}
	return m, ml.IndexScenarios(repo)
}

func TestAnalyzeExamples(t *testing.T) {
	m, sc := setup(t)
	cases := []struct{ name, text, cat, scenario string }{
		{"kerja", "Halo kak, lowongan admin WFH gaji 300rb/hari. Daftar sekarang, cukup tf biaya seragam 150rb ke 1234567890123 ya!!", "tawaran_kerja", "wfh_admin_fee"},
		{"giveaway", "Selamat! Kamu terpilih jadi pemenang giveaway dari akun resmi toko kami. Hadiah HP baru, klaim dengan kirim kode OTP yang masuk ke nomor kamu hari ini.", "giveaway", "giveaway_fake_verified"},
		{"akun_menyamar", "Ma, ini nomor baru Dimas, HP yang lama rusak. Tolong transfer dulu 2 juta ke rekening temanku ya, penting banget jangan bilang papa.", "akun_menyamar", "impersonate_new_number"},
		{"investasi", "Investasi cepat untung 30 persen per minggu, modal kecil mulai 500rb, dijamin profit tanpa risiko. Hubungi mentor kami lewat 081234567890 sekarang.", "pinjaman_investasi", "loan_fast_no_check"},
		{"normal", "Besok kuliah pagi jam 8 ya, jangan lupa bawa laptop dan tugas kelompok. Nanti kita makan siang bareng di kantin.", "lainnya", "generic_emergency"},
	}
	for _, c := range cases {
		r := ml.Analyze(m, c.text, sc)
		if r.Category.ID != c.cat || r.ScenarioID != c.scenario {
			t.Errorf("%s: dapat %s/%s, mau %s/%s", c.name, r.Category.ID, r.ScenarioID, c.cat, c.scenario)
		}
		if c.name == "normal" && len(r.Tactics) != 0 {
			t.Errorf("normal: taktik harus kosong, dapat %v", r.Tactics)
		}
		if r.Disclaimer != ml.Disclaimer || r.TooShort {
			t.Errorf("%s: disclaimer/too_short salah", c.name)
		}
	}
}

func TestAnalyzeTooShortAndMask(t *testing.T) {
	m, sc := setup(t)
	r := ml.Analyze(m, "Halo bang", sc)
	if !r.TooShort || r.Category.ID != "lainnya" || r.Category.Confidence != 0 || r.ScenarioID != "generic_emergency" || r.Tactics == nil || len(r.Tactics) != 0 {
		t.Errorf("too_short salah: %+v", r)
	}
	b, _ := json.Marshal(r)
	if !strings.Contains(string(b), `"tactics":[]`) {
		t.Errorf("tactics harus [] bukan null: %s", b)
	}
	r = ml.Analyze(m, "Hubungi saya di 081234567890 ya kak untuk info lowongan kerja", sc)
	if r.MaskedCount != 1 || strings.Contains(r.Masked, "0812") || !strings.Contains(r.Masked, "<NOMOR>") {
		t.Errorf("masking salah: %+v", r)
	}
}

func TestIndexScenarios(t *testing.T) {
	_, sc := setup(t)
	if len(sc) != 10 {
		t.Fatalf("mau 10 skenario, dapat %d", len(sc))
	}
	fb := 0
	for _, s := range sc {
		if s.IsFallback {
			fb++
		}
	}
	if fb != 5 {
		t.Errorf("mau 5 fallback, dapat %d", fb)
	}
}

func TestAnalyzeFixture(t *testing.T) {
	m, sc := setup(t)
	raw, err := os.ReadFile("../../testdata/fixtures/ml-analyze.json")
	if err != nil {
		t.Fatal(err)
	}
	var cases []struct {
		Text     string    `json:"text"`
		Expected ml.Result `json:"expected"`
	}
	if err := json.Unmarshal(raw, &cases); err != nil || len(cases) == 0 {
		t.Fatalf("fixture tidak terbaca: %v", err)
	}
	for _, c := range cases {
		if got := ml.Analyze(m, c.Text, sc); !reflect.DeepEqual(got, c.Expected) {
			t.Errorf("fixture beda untuk %.30q: dapat %+v, mau %+v", c.Text, got, c.Expected)
		}
	}
}

// Rata-rata atas 200 putaran dengan batas longgar (10 ms) agar tidak flaky.
func TestAnalyzeSpeed(t *testing.T) {
	m, sc := setup(t)
	text := strings.Repeat("Halo kak, lowongan admin WFH gaji 300rb/hari, cukup tf biaya seragam. ", 10)[:500]
	const n = 200
	start := time.Now()
	for i := 0; i < n; i++ {
		ml.Analyze(m, text, sc)
	}
	if avg := time.Since(start) / n; avg > 10*time.Millisecond {
		t.Errorf("rata-rata %v, mau < 10ms", avg)
	}
}
